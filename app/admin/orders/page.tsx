"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import type { OrdersResponse, Order } from "@/lib/types"
import { formatPrice, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // FIX #3: Defined fetchOrders with useCallback so it's stable
  // and can be reused (e.g. after a status refresh if needed)
  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiClient.get<OrdersResponse>("/admin/orders")
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
  }, [toast])

  // FIX #2: Cleaned up useEffect — wait for auth to resolve first,
  // then guard by role, then fetch. No redundant condition split.
  useEffect(() => {
    if (authLoading) return

    if (user?.role !== "admin") {
      router.push("/")
      return
    }

    fetchOrders()
  }, [authLoading, user, router, fetchOrders])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.put(`/admin/orders/${orderId}`, { status: newStatus })

      // FIX #1: Was updating `status` instead of `orderStatus` — silently broke UI
      setOrders(orders.map((o) =>
        o._id === orderId ? { ...o, orderStatus: newStatus as Order["orderStatus"] } : o
      ))

      toast({
        title: "Success",
        description: "Order status updated",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

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
        <h1 className="text-3xl font-bold mb-8">Order Management</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <AdminNav />
          </aside>

          {/* Main Content */}
          <div className="md:col-span-3">
            <Card>
              <CardContent className="pt-6">
                {/* FIX #4: Added empty state so the table doesn't render blank */}
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No orders found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Order ID</th>
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-left py-2 px-3">Total</th>
                          <th className="text-left py-2 px-3">Status</th>
                          <th className="text-left py-2 px-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id} className="border-b hover:bg-secondary/50">
                            <td className="py-2 px-3 font-mono text-xs">{order._id.slice(0, 8)}</td>
                            <td className="py-2 px-3 text-xs">{formatDate(order.orderDate)}</td>
                            <td className="py-2 px-3 font-semibold">{formatPrice(order.totalPrice)}</td>
                            <td className="py-2 px-3">
                              <Select
                                value={order.orderStatus}
                                onValueChange={(value) => handleStatusUpdate(order._id, value)}
                              >
                                <SelectTrigger className="w-32 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="confirmed">Confirmed</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-2 px-3">
                              {/* FIX #5: Replaced <a> with Next.js <Link> for client-side navigation */}
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/orders/${order._id}`}>View</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}