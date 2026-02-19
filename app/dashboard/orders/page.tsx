"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import type { Order, OrdersResponse } from "@/lib/types"
import { formatDate, formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const router = useRouter()
  const { loading: authLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await apiClient.get<OrdersResponse>("/orders")
        setOrders(response.orders || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchOrders()
    }
  }, [authLoading, isAuthenticated, router, toast])

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <DashboardNav />
          </aside>

          {/* Main Content */}
          <div className="md:col-span-3">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
                  <Button asChild>
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order._id}>
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Order ID</p>
                          <p className="font-mono text-sm">{order._id.slice(0, 8)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="text-sm">{formatDate(order.orderDate)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="font-bold text-primary">{formatPrice(order.totalPrice)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <Badge className={statusColors[order.orderStatus] || ""}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </Badge>
                        </div>

                        <div className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order._id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
