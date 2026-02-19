"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdminNav } from "@/components/admin/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import type { AdminStats } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      console.log(user)
      router.push("/")
      return
    }

    const fetchStats = async () => {
      try {
        const response = await apiClient.get<any>("/admin/stats")
        setStats(response.stats)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user?.role === "admin") {
      fetchStats()
    }
  }, [authLoading, user, router, toast])

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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <AdminNav />
          </aside>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Active users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{formatPrice(stats?.totalRevenue || 0)}</p>
                  <p className="text-xs text-muted-foreground mt-2">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">{stats?.pendingOrders || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">Awaiting action</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            {stats?.recentOrders && stats.recentOrders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Order ID</th>
                          <th className="text-left py-2 px-3">Customer</th>
                          <th className="text-left py-2 px-3">Total</th>
                          <th className="text-left py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders.slice(0, 5).map((order:any) => (
                          <tr key={order._id} className="border-b hover:bg-secondary/50">
                            <td className="py-2 px-3 font-mono text-xs">{order._id.slice(0, 8)}</td>
                            <td className="py-2 px-3 text-xs">Customer</td>
                            <td className="py-2 px-3">{formatPrice(order.totalPrice)}</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                {order.orderStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
