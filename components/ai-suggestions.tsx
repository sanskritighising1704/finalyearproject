"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"

export function AISuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [noReviews, setNoReviews] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchSuggestions = async () => {
      try {
        const res = await apiClient.get<{
          suggestions: Product[]
          message?: string
        }>("/suggestions")

        if (res.message === "no_reviews") {
          setNoReviews(true)
        } else {
          setSuggestions(res.suggestions)
        }
      } catch {
        // silently fail — don't break homepage
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [user])

  // Hide if not logged in or no reviews
  if (!user || noReviews || (!loading && suggestions.length === 0)) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold">Recommended For You</h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium ml-1">
          Just For You
        </span>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden border">
              <div className="h-48 bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Cards */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {suggestions.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className="group rounded-xl overflow-hidden border hover:shadow-md transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-40 md:h-48 bg-muted overflow-hidden">
                <img
                  src={`http://localhost:5001${product.images?.[0]}`}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  ✦ Pick For You
                </span>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">
                  {product.category}
                </p>
                <p className="font-bold text-sm mt-1 text-primary">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}