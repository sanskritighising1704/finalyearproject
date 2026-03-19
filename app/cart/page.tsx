"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { QuantitySelector } from "@/components/quantity-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { formatPrice } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { cart, removeItem, updateQuantity } = useCart()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      await updateQuantity(productId, quantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeItem(productId)
      toast({
        title: "Removed",
        description: "Item removed from cart",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }
    router.push("/checkout")
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Start shopping to add items to your cart</p>
            <Button asChild>
              <Link href="/products">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const subtotal = cart.totalPrice || 0
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="divide-y">
              {cart.items.map((item) => (
                <div key={item.productId} className="p-6 flex gap-6">
                  <div className="relative h-24 w-24 flex-shrink-0 bg-secondary rounded-lg overflow-hidden">
                     {item.product.images?.[0] ? (
    <img
      src={`http://localhost:5000${item.product.images[0]}`}
      alt={item.product.name}
      width={150}
      height={150}
      className="object-cover rounded"
    />
  ) : (
    <div className="w-[50px] h-[50px] bg-muted rounded" />
  )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-semibold hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{item.product.brand}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary">{formatPrice(item.product.price)}</p>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) => handleUpdateQuantity(item.productId, qty)}
                        max={item.product.stock}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Link href="/products" className="inline-flex items-center text-primary mt-6">
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 space-y-4 sticky top-20">
              <h2 className="font-bold text-lg">Order Summary</h2>

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
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
                {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
              </Button>

              {subtotal > 0 && subtotal <= 100 && (
                <p className="text-xs text-muted-foreground text-center">Free shipping on orders over $100</p>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
