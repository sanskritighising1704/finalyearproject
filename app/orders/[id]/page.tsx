"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Star, ThumbsUp, Minus, ThumbsDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { apiClient } from "@/lib/api-client"
import type { Order } from "@/lib/types"
import { formatDate, formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

// Sentiment options map to a numeric rating for the backend
type Sentiment = "positive" | "neutral" | "negative"

const SENTIMENT_OPTIONS: {
  value: Sentiment
  label: string
  rating: number
  icon: React.ReactNode
  activeClass: string
  inactiveClass: string
}[] = [
  {
    value: "positive",
    label: "Positive",
    rating: 5,
    icon: <ThumbsUp className="w-6 h-6" />,
    activeClass:
      "border-green-500 bg-green-50 text-green-700 shadow-green-100 shadow-md",
    inactiveClass:
      "border-gray-200 bg-white text-gray-400 hover:border-green-300 hover:text-green-500 hover:bg-green-50",
  },
  {
    value: "neutral",
    label: "Neutral",
    rating: 3,
    icon: <Minus className="w-6 h-6" />,
    activeClass:
      "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-yellow-100 shadow-md",
    inactiveClass:
      "border-gray-200 bg-white text-gray-400 hover:border-yellow-300 hover:text-yellow-500 hover:bg-yellow-50",
  },
  {
    value: "negative",
    label: "Negative",
    rating: 1,
    icon: <ThumbsDown className="w-6 h-6" />,
    activeClass:
      "border-red-500 bg-red-50 text-red-700 shadow-red-100 shadow-md",
    inactiveClass:
      "border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50",
  },
]

const ratingToSentiment = (rating: number): Sentiment => {
  if (rating >= 4) return "positive"
  if (rating === 3) return "neutral"
  return "negative"
}

export interface OrderResponse { order: Order }

interface ReviewedMap {
  [productId: string]: { rating: number; comment: string; sentiment: Sentiment }
}

export default function OrderDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order>()
  const [loading, setLoading] = useState(true)
  const [reviewedMap, setReviewedMap] = useState<ReviewedMap>({})

  // Modal state
  const [reviewModal, setReviewModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null)
  const [sentiment, setSentiment] = useState<Sentiment | null>(null)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await apiClient.get<OrderResponse>(`/orders/${params.id}`)
        setOrder(response.order)

        // Fetch already-reviewed products for this order
        const reviewRes = await apiClient.get<{ reviews: any[] }>(
          `/reviews/order/${params.id}`
        )
        const map: ReviewedMap = {}
        reviewRes.reviews.forEach((r) => {
          const pid = r.product?._id || r.product
          map[pid] = {
            rating: r.rating,
            comment: r.comment,
            sentiment: ratingToSentiment(r.rating),
          }
        })
        setReviewedMap(map)
      } catch {
        toast({ title: "Error", description: "Failed to load order", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id, toast])

  const openReviewModal = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName })
    setSentiment(null)
    setComment("")
    setReviewModal(true)
  }

  const submitReview = async () => {
    if (!selectedProduct || !sentiment || !comment.trim()) {
      toast({ title: "Please select a sentiment and add a comment", variant: "destructive" })
      return
    }
    const selectedOption = SENTIMENT_OPTIONS.find((o) => o.value === sentiment)!
    const rating = selectedOption.rating

    setSubmitting(true)
    try {
      await apiClient.post("/reviews", {
        orderId: params.id,
        productId: selectedProduct.id,
        rating,
        comment,
      })
      setReviewedMap((prev) => ({
        ...prev,
        [selectedProduct.id]: { rating, comment, sentiment },
      }))
      toast({ title: "Review submitted!", description: "Thank you for your feedback." })
      setReviewModal(false)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
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

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Order not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  const statusSteps = ["pending", "confirmed", "shipped", "delivered"]
  const currentStepIndex = statusSteps.indexOf(order.orderStatus)
  const isDelivered = order.orderStatus === "delivered"

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order {order._id}</h1>
              <p className="text-muted-foreground mt-1">{formatDate(order.orderDate)}</p>
            </div>
            <Badge className={statusColors[order.orderStatus] || ""}>
              {order.orderStatus}
            </Badge>
          </div>
        </div>

        {/* Status Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {index < currentStepIndex ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="text-xs font-medium capitalize text-center">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Order Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 divide-y">
                  {order.items.map((item) => {
                    const productId = (item.product?._id || item.product)?.toString()
                    const alreadyReviewed = !!reviewedMap[productId]
                    const existingReview = reviewedMap[productId]

                    // Icon for the existing review sentiment badge
                    const sentimentOption = existingReview
                      ? SENTIMENT_OPTIONS.find((o) => o.value === existingReview.sentiment)
                      : null

                    return (
                      <div key={productId} className="py-4 flex gap-4">

                        {/* Product Image */}
                        <div className="relative h-24 w-24 flex-shrink-0 bg-secondary rounded overflow-hidden">
                          <img
                            src={`http://localhost:5000${item.product?.images?.[0]}`}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1">
                          <Link
                            href={`/products/${productId}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {item.product?.name || item.product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.product?.price || item.price)} each
                          </p>

                          {/* Review Button — only for delivered orders */}
                          {isDelivered && (
                            <div className="mt-2">
                              {alreadyReviewed && sentimentOption ? (
                                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${sentimentOption.activeClass}`}>
                                  {sentimentOption.icon &&
                                    <span className="w-3.5 h-3.5 [&>svg]:w-3.5 [&>svg]:h-3.5">
                                      {sentimentOption.icon}
                                    </span>
                                  }
                                  {sentimentOption.label} · Reviewed
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-1 text-xs h-7"
                                  onClick={() =>
                                    openReviewModal(productId, item.product?.name || item.name)
                                  }
                                >
                                  <Star className="w-3 h-3 mr-1" />
                                  Write a Review
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Item Total */}
                        <p className="font-semibold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1 space-y-4">

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.shippingAddress}</p>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {order.paymentMethod === "credit-card"
                    ? "Credit Card"
                    : order.paymentMethod === "paypal"
                      ? "PayPal"
                      : "Cash on Delivery"}
                </p>
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.totalPrice - order.shippingPrice - order.taxPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(order.shippingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(order.taxPrice)}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review: {selectedProduct?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">

            {/* Sentiment Selector */}
            <div>
              <p className="text-sm font-medium mb-3">How was your experience?</p>
              <div className="grid grid-cols-3 gap-3">
                {SENTIMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSentiment(option.value)}
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-150 font-medium text-sm ${
                      sentiment === option.value
                        ? option.activeClass
                        : option.inactiveClass
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
              {sentiment && (
                <p className="text-xs text-muted-foreground mt-2">
                  {sentiment === "positive" && "⭐ 5 stars — Great experience!"}
                  {sentiment === "neutral" && "⭐ 3 stars — It was okay."}
                  {sentiment === "negative" && "⭐ 1 star — Needs improvement."}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <p className="text-sm font-medium mb-2">Your Review</p>
              <Textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {comment.length} characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setReviewModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                disabled={submitting || !sentiment || !comment.trim()}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}