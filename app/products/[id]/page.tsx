"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Share2, ChevronLeft } from "lucide-react"
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

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCart()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await apiClient.get<any>(`/products/${params.id}`)
        setProduct(response?.product||null)

        // Fetch related products
        const relatedResponse = await apiClient.get<any>(`/products?category=${response.category}&limit=6`)
        setRelatedProducts(relatedResponse.products?.filter((p: Product) => p._id !== params.id) || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, toast])

  const handleAddToCart = async () => {
    try {
      await addItem(params.id as string, quantity)
      toast({
        title: "Success",
        description: `Added ${quantity} item(s) to cart`,
      })
      setQuantity(1)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    }
  }

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
          {/* Image */}
          <div className="relative h-96 md:h-full bg-secondary rounded-lg overflow-hidden">
            <Image
              src={product.images?.[0] || "/placeholder.svg?height=500&width=500&query=electronics"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{product.rating} out of 5</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Price</p>
                <p className="text-4xl font-bold text-primary">{formatPrice(product.price)}</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Stock Status */}
              <div className="mb-8">
                {product.stock > 0 ? (
                  <p className="text-sm text-green-600 font-medium">✓ In stock ({product.stock} available)</p>
                ) : (
                  <p className="text-sm text-destructive font-medium">Out of stock</p>
                )}
              </div>

              {/* Specifications */}
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

            {/* Actions */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Quantity</p>
                    <QuantitySelector value={quantity} onChange={setQuantity} max={product.stock} />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setWishlist(!wishlist)}
                    className={wishlist ? "text-primary" : ""}
                  >
                    <Heart className="w-5 h-5" fill={wishlist ? "currentColor" : "none"} />
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1" size="lg" onClick={handleAddToCart}>
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="lg">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

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
