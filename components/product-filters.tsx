"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

const CATEGORIES = ["Annual flowers", "Biennial flowers", "Perennial flowers", "Single flowers"]

interface ProductFiltersProps {
  onFiltersChange?: (filters: Record<string, string>) => void
}

export function ProductFilters({ onFiltersChange }: ProductFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedCategory = searchParams.get("category") || ""
  const selectedBrand = searchParams.get("brand") || ""
  const minPrice = Number.parseInt(searchParams.get("minPrice") || "0")
  const maxPrice = Number.parseInt(searchParams.get("maxPrice") || "5000")
  let priceRange = [minPrice, maxPrice]

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedCategory === category) {
      params.delete("category")
    } else {
      params.set("category", category)
    }
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  const handleBrandChange = (brand: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedBrand === brand) {
      params.delete("brand")
    } else {
      params.set("brand", brand)
    }
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  const handlePriceChange = (value: number[]) => {
    priceRange = value
  }

  const handlePriceApply = () => {
    const params = new URLSearchParams(searchParams)
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())
    params.set("page", "1")
    router.push(`/products?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Categories</h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selectedCategory === category} onChange={() => handleCategoryChange(category)} />
              <span className="text-sm capitalize">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands */}
     

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <Slider value={priceRange} onValueChange={handlePriceChange} min={0} max={5000} step={50} className="mb-3" />
        <div className="flex gap-2 text-sm">
          <span>${priceRange[0]}</span>
          <span>-</span>
          <span>${priceRange[1]}</span>
        </div>
        <Button size="sm" className="w-full mt-3" onClick={handlePriceApply}>
          Apply
        </Button>
      </div>

      {/* Clear Filters */}
      <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={handleClearFilters}>
        Clear Filters
      </Button>
    </div>
  )
}
