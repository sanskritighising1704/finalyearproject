"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { formatDate } from "@/lib/utils"

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login")
    }
  }, [loading, isAuthenticated, router])

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <DashboardNav />
          </aside>

          {/* Main Content */}
          <div className="md:col-span-3">
            {/* Welcome Card */}
            <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10">
              <CardContent className="pt-6">
                <p className="text-lg">
                  Welcome back, <span className="font-bold">{user?.name}</span>!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Member since {user?.createdAt && formatDate(user.createdAt)}
                </p>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <ProfileForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
