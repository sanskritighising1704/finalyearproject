"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Cart } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface OrderReviewProps {
  cart: Cart
  address: string
  paymentMethod: string
  onSubmit: () => void
  loading?: boolean
}

export function OrderReview({ cart, address, paymentMethod, onSubmit, loading = false }: OrderReviewProps) {
  const subtotal = cart.totalPrice || 0
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  const paymentMethodLabel =
    {
      "credit-card": "Credit Card",
      paypal: "PayPal",
      cod: "Cash on Delivery",
    }[paymentMethod] || paymentMethod

  return (
    <div className="space-y-6">
      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 divide-y">
            {cart.items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 bg-secondary rounded overflow-hidden">
               <img
                          src={`http://localhost:5000${item.product.images[0]}`}
                          alt={`existing-${item.product.name}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} x {formatPrice(item.product.price)}
                  </p>
                </div>
                <p className="font-semibold">${item.quantity * item.product.price}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{address}</p>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{paymentMethodLabel}</p>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-lg text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <Button className="w-full mt-6" size="lg" onClick={onSubmit} disabled={loading}>
            {loading ? "Processing..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
