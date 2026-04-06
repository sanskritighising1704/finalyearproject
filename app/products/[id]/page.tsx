"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Share2, ChevronLeft, ThumbsUp, ThumbsDown, Minus } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuantitySelector } from "@/components/quantity-selector"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/contexts/cart-context"
import { apiClient } from "@/lib/api-client"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

// ── Types ─────────────────────────────────────────────────────────────
interface Review {
  _id: string
  user: { name: string }
  rating: number
  comment: string
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  createdAt: string
}

// ── Star rating → sentiment rule ──────────────────────────────────────
// 4-5 stars = positive | 3 stars = neutral | 1-2 stars = negative
function getSentimentFromRating(rating: number): "positive" | "negative" | "neutral" {
  if (rating >= 4) return "positive"
  if (rating === 3) return "neutral"
  return "negative"
}

// ── Sentiment Badge ───────────────────────────────────────────────────
function SentimentBadge({ rating }: { rating: number }) {
  const sentiment = getSentimentFromRating(rating)
  if (sentiment === "positive")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
        <ThumbsUp className="w-3 h-3" /> Positive
      </span>
    )
  if (sentiment === "negative")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
        <ThumbsDown className="w-3 h-3" /> Negative
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <Minus className="w-3 h-3" /> Neutral
    </span>
  )
}

// ── Sentiment Summary Bar ─────────────────────────────────────────────
function SentimentSummary({ reviews }: { reviews: Review[] }) {
  const total = reviews.length
  if (total === 0) return null

  const pos = reviews.filter((r) => getSentimentFromRating(r.rating) === "positive").length
  const neg = reviews.filter((r) => getSentimentFromRating(r.rating) === "negative").length
  const neu = reviews.filter((r) => getSentimentFromRating(r.rating) === "neutral").length
  const posP = Math.round((pos / total) * 100)
  const negP = Math.round((neg / total) * 100)
  const neuP = Math.round((neu / total) * 100)

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-5 mb-8">
      <p className="text-sm font-semibold text-gray-600 mb-1">Customer Sentiment</p>
      <p className="text-xs text-gray-400 mb-4">
        ⭐⭐⭐⭐⭐ 4-5 stars = Positive &nbsp;·&nbsp; ⭐⭐⭐ 3 stars = Neutral &nbsp;·&nbsp; ⭐⭐ 1-2 stars = Negative
      </p>

      {/* Bar */}
      <div className="flex rounded-full overflow-hidden h-3 mb-4">
        {posP > 0 && (
          <div style={{ width: `${posP}%` }} className="bg-emerald-400 transition-all duration-700" title={`Positive ${posP}%`} />
        )}
        {neuP > 0 && (
          <div style={{ width: `${neuP}%` }} className="bg-amber-300 transition-all duration-700" title={`Neutral ${neuP}%`} />
        )}
        {negP > 0 && (
          <div style={{ width: `${negP}%` }} className="bg-red-400 transition-all duration-700" title={`Negative ${negP}%`} />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          😊 Positive — {pos} ({posP}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
          😐 Neutral — {neu} ({neuP}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
          😞 Negative — {neg} ({negP}%)
        </span>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(false)
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative" | "neutral">("all")

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get<any>(`/products/${params.id}`)
        setProduct(response?.product || null)

        const relatedResponse = await apiClient.get<any>(`/products?category=${response.category}&limit=6`)
        setRelatedProducts(relatedResponse.products?.filter((p: Product) => p._id !== params.id) || [])

        const reviewsResponse = await apiClient.get<any>(`/reviews/product/${params.id}`)
        setReviews(reviewsResponse?.reviews || [])
      } catch (error) {
        toast({ title: "Error", description: "Failed to load product", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id, toast])

  const handleAddToCart = async () => {
    try {
      await addItem(params.id as string, quantity)
      toast({ title: "Success", description: `Added ${quantity} item(s) to cart` })
      setQuantity(1)
    } catch (error) {
      toast({ title: "Error", description: "Failed to add to cart", variant: "destructive" })
    }
  }

  const filteredReviews =
    sentimentFilter === "all"
      ? reviews
      : reviews.filter((r) => getSentimentFromRating(r.rating) === sentimentFilter)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
              <div className="h-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <p className="text-center text-muted-foreground">Product not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/products" className="hover:text-foreground flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="relative h-96 md:h-full bg-secondary rounded-lg overflow-hidden">
            <Image
              src={product.images?.[0] || "/placeholder.svg?height=500&width=500&query=electronics"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating} out of 5</span>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
              </div>

              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-8">
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium">✓ In stock ({product.stock} available)</p>
                ) : (
                  <p className="text-sm text-destructive font-medium">Out of stock</p>
                )}
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-4">Specifications</h3>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                    <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setWishlist(!wishlist)} className={wishlist ? "text-primary" : ""}>
                    <Heart className="w-5 h-5" fill={wishlist ? "currentColor" : "none"} />
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1" size="lg" onClick={handleAddToCart}>Add to Cart</Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Reviews Section ───────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {/* Sentiment Summary Bar */}
          <SentimentSummary reviews={reviews} />

          {/* Filter Buttons */}
          {reviews.length > 0 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["all", "positive", "neutral", "negative"] as const).map((f) => {
                const count = f === "all" ? reviews.length : reviews.filter((r) => getSentimentFromRating(r.rating) === f).length
                return (
                  <button
                    key={f}
                    onClick={() => setSentimentFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      sentimentFilter === f
                        ? f === "positive" ? "bg-emerald-500 text-white border-emerald-500"
                          : f === "negative" ? "bg-red-500 text-white border-red-500"
                          : f === "neutral" ? "bg-amber-400 text-white border-amber-400"
                          : "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {f === "all" && `All (${count})`}
                    {f === "positive" && `😊 Positive (${count})`}
                    {f === "neutral" && `😐 Neutral (${count})`}
                    {f === "negative" && `😞 Negative (${count})`}
                  </button>
                )
              })}
            </div>
          )}

          {/* Review Cards */}
          {filteredReviews.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">
              {reviews.length === 0 ? "No reviews yet for this product." : "No reviews in this category."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{review.user?.name || "Customer"}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{review.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SentimentBadge rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.slice(0, 3).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}