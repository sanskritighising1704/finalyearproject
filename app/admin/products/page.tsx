"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, Star, MessageSquare } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductFormModal } from "@/components/admin/product-form-modal"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import type { Product, ProductsResponse } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Review {
  _id: string
  user: { name: string }
  rating: number
  comment: string
  createdAt: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({})
  const [reviewsLoading, setReviewsLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      router.push("/")
      return
    }

    const fetchProducts = async () => {
      try {
        const response = await apiClient.get<ProductsResponse>("/products?limit=100")
        setProducts(response.products || [])
      } catch {
        toast({ title: "Error", description: "Failed to load products", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user?.role === "admin") fetchProducts()
  }, [authLoading, user, router, toast])

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleFormSuccess = (newProduct: Product) => {
    if (selectedProduct?._id) {
      setProducts(products.map((p) => (p._id === selectedProduct._id ? newProduct : p)))
    } else {
      setProducts([newProduct, ...products])
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    try {
      await apiClient.delete(`/products/${productId}`)
      setProducts(products.filter((p) => p._id !== productId))
      toast({ title: "Success", description: "Product deleted successfully" })
    } catch {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" })
    }
  }

  const toggleReviews = async (productId: string) => {
    if (expandedProductId === productId) {
      setExpandedProductId(null)
      return
    }
    setExpandedProductId(productId)
    if (reviewsMap[productId]) return
    setReviewsLoading((prev) => ({ ...prev, [productId]: true }))
    try {
      const res = await apiClient.get<{ reviews: Review[] }>(`/reviews/product/${productId}`)
      setReviewsMap((prev) => ({ ...prev, [productId]: res.reviews }))
    } catch {
      toast({ title: "Error", description: "Failed to load reviews", variant: "destructive" })
    } finally {
      setReviewsLoading((prev) => ({ ...prev, [productId]: false }))
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  )

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-96 bg-muted rounded-lg animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold">Product Management</h1>
          <Button onClick={handleAddProduct} size="sm" className="md:size-default">
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Add Product</span>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-8">

          {/* Sidebar — hidden on mobile, shown on md+ */}
          <aside className="hidden md:block md:col-span-1">
            <AdminNav />
          </aside>

          {/* Main Content */}
          <div className="col-span-full md:col-span-3 space-y-4">

            {/* Mobile: AdminNav as horizontal scroll strip */}
            <div className="block md:hidden">
              <AdminNav />
            </div>

            <Card>
              <CardContent className="pt-4 md:pt-6 px-2 md:px-6">

                {/* ─── DESKTOP TABLE (md+) ─── */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Image</th>
                        <th className="text-left py-2 px-3">Product</th>
                        <th className="text-left py-2 px-3">Category</th>
                        <th className="text-left py-2 px-3">Price</th>
                        <th className="text-left py-2 px-3">Stock</th>
                        <th className="text-left py-2 px-3">Reviews</th>
                        <th className="text-left py-2 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const isExpanded = expandedProductId === product._id
                        const reviews = reviewsMap[product._id] || []
                        const isLoadingReviews = reviewsLoading[product._id]

                        return (
                          <>
                            <tr key={product._id} className="border-b hover:bg-secondary/50">
                              <td className="py-2 px-3">
                                {product.images?.[0] ? (
                                  <img
                                    src={`http://localhost:5000${product.images[0]}`}
                                    alt={product.name}
                                    width={50}
                                    height={50}
                                    className="object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-[50px] h-[50px] bg-muted rounded" />
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <p className="font-medium line-clamp-1">{product.name}</p>
                                <p className="text-xs text-muted-foreground">{product.brand}</p>
                              </td>
                              <td className="py-2 px-3 capitalize text-xs">{product.category}</td>
                              <td className="py-2 px-3 font-semibold">{formatPrice(product.price)}</td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {product.stock} items
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-1 text-xs"
                                  onClick={() => toggleReviews(product._id)}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {isExpanded
                                    ? <ChevronUp className="w-3.5 h-3.5" />
                                    : <ChevronDown className="w-3.5 h-3.5" />
                                  }
                                </Button>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </div>
                              </td>
                            </tr>

                            {/* Expandable Reviews Row - Desktop */}
                            {isExpanded && (
                              <tr key={`${product._id}-reviews`}>
                                <td colSpan={7} className="bg-muted/40 px-6 py-4 border-b">
                                  <ReviewsPanel
                                    reviews={reviews}
                                    isLoading={isLoadingReviews}
                                    renderStars={renderStars}
                                  />
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ─── MOBILE CARDS (< md) ─── */}
                <div className="flex flex-col gap-3 md:hidden">
                  {products.map((product) => {
                    const isExpanded = expandedProductId === product._id
                    const reviews = reviewsMap[product._id] || []
                    const isLoadingReviews = reviewsLoading[product._id]

                    return (
                      <div key={product._id} className="border rounded-lg overflow-hidden">

                        {/* Product Card Row */}
                        <div className="flex gap-3 p-3">

                          {/* Image */}
                          {product.images?.[0] ? (
                            <img
                              src={`http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex-shrink-0" />
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                            <div className="flex flex-wrap gap-2 mt-1 items-center">
                              <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {product.stock} items
                              </span>
                              <span className="text-xs text-muted-foreground capitalize">{product.category}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-1 items-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(product._id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        {/* Reviews Toggle Button */}
                        <button
                          onClick={() => toggleReviews(product._id)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-muted/50 border-t text-xs font-medium hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Customer Reviews</span>
                            {reviewsMap[product._id] && (
                              <span className="text-muted-foreground">
                                ({reviewsMap[product._id].length})
                              </span>
                            )}
                          </div>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />
                          }
                        </button>

                        {/* Expandable Reviews - Mobile */}
                        {isExpanded && (
                          <div className="p-3 border-t bg-muted/20">
                            <ReviewsPanel
                              reviews={reviews}
                              isLoading={isLoadingReviews}
                              renderStars={renderStars}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <div>
        <ProductFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          product={selectedProduct}
          onSuccess={handleFormSuccess}
        />
      </div>

      <Footer />
    </div>
  )
}

// ─── Shared Reviews Panel Component ───────────────────────────────────────────
function ReviewsPanel({
  reviews,
  isLoading,
  renderStars,
}: {
  reviews: Review[]
  isLoading: boolean
  renderStars: (rating: number) => JSX.Element
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No reviews yet for this product.
      </p>
    )
  }

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length

  return (
    <div className="space-y-3">
      <p className="font-semibold text-sm mb-2">Customer Reviews</p>

      {/* Summary */}
      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
        <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
        {renderStars(Math.round(avgRating))}
        <span className="text-xs text-muted-foreground">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {reviews.map((review) => (
          <div key={review._id} className="flex gap-3 p-3 bg-background rounded-lg border">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
              {review.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              {renderStars(review.rating)}
              <p className="text-sm text-muted-foreground mt-1 break-words">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}