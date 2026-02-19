"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { ShippingForm } from "@/components/checkout/shipping-form"
import { OrderReview } from "@/components/checkout/order-review"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  if (!cart || cart.items.length === 0) {
    router.push("/cart")
    return null
  }

  const handleShippingSubmit = (shippingAddress: string) => {
    setAddress(shippingAddress)
    setCurrentStep(2)
  }

  const handlePlaceOrder = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please provide shipping address",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const subtotal = cart.totalPrice || 0
      const shippingPrice = subtotal > 100 ? 0 : 10
      const taxPrice = subtotal * 0.1

      const response = await apiClient.post<any>("/esewa/initiate-payment", {
        shippingAddress: address,
        paymentMethod: "esewa",
        paymentGateway: "esewa",
        shippingPrice,
        taxPrice,
      })

      if (response.success) {
        // Clear cart before redirecting to payment
        await clearCart()

        // Check if payment is required
        if (response.paymentRequired && response.paymentUrl) {
          toast({
            title: "Redirecting to payment",
            description: "You will be redirected to eSewa for payment",
          })

          // Redirect to eSewa payment gateway
          window.location.href = response.paymentUrl
        } else {
          // For COD or if payment not required
          toast({
            title: "Success",
            description: "Order placed successfully!",
          })
          router.push(`/orders/${response.order._id}`)
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to place order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <CheckoutSteps currentStep={currentStep} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 1 && <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />}
            
            {currentStep === 2 && (
              <div>
                <div className="mb-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    ← Back to Shipping
                  </Button>
                </div>
                <OrderReview
                  cart={cart}
                  address={address}
                  paymentMethod="eSewa"
                  onSubmit={handlePlaceOrder}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items:</span>
                    <span>{cart.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${cart.totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span>${((cart.totalPrice || 0) > 100 ? 0 : 10).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (10%):</span>
                    <span>${((cart.totalPrice || 0) * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>
                      ${(
                        (cart.totalPrice || 0) +
                        ((cart.totalPrice || 0) > 100 ? 0 : 10) +
                        (cart.totalPrice || 0) * 0.1
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/>
                  </svg>
                  <span className="font-semibold text-sm">Payment via eSewa</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to eSewa to complete your payment securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}