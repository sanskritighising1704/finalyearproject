"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string, quantity: number) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link href={`/products/${product._id}`}>
        <div className="relative h-48 bg-secondary overflow-hidden group">
          <Image
            src={product.images[0] || "/placeholder.svg?height=200&width=200&query=electronics"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={`/products/${product._id}`}>
            <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">{product.brand}</p>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">{formatPrice(product.price)}</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-xs font-medium">{product.rating}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {product.stock > 0 ? (
              <Button size="sm" className="flex-1" onClick={() => onAddToCart?.(product._id, 1)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add
              </Button>
            ) : (
              <Button size="sm" disabled className="flex-1">
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
