"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { X, Loader2, ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import type { Product } from "@/lib/types"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
  onSuccess: (product: Product) => void
}

const CATEGORIES = [
  "Annual flowers",
  "Biennial flowers",
  "Perennial flowers",
  "Single flowers",
]

const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"

export function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: ProductFormModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: CATEGORIES[0],
    stock: "",
    isActive: true,
  })

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        isActive: product.isActive,
      })
      setExistingImages(product.images || [])
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category: CATEGORIES[0],
        stock: "",
        isActive: true,
      })
      setExistingImages([])
    }
    // Clear new images on every open/close
    setNewImages([])
    setNewImagePreviews([])
  }, [product, isOpen])

  // Revoke object URLs on cleanup to prevent memory leaks
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newImagePreviews])

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      // Revoke old previews before replacing
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url))

      const files = Array.from(e.target.files)
      const previews = files.map((file) => URL.createObjectURL(file))
      setNewImages(files)
      setNewImagePreviews(previews)
    },
    [newImagePreviews]
  )

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index])
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = new FormData()
      payload.append("name", formData.name)
      payload.append("description", formData.description)
      payload.append("price", formData.price)
      payload.append("category", formData.category)
      payload.append("stock", formData.stock)
      payload.append("isActive", String(formData.isActive))

      // Send remaining existing images so backend knows which to keep
      existingImages.forEach((img) => payload.append("existingImages", img))

      // Append new image files
      newImages.forEach((file) => payload.append("images", file))

      let response
      if (product?._id) {
        response = await apiClient.putForm<any>(`/products/${product._id}`, payload)
      } else {
        response = await apiClient.postForm<any>("/products", payload)
      }

      toast({
        title: "Success",
        description: product?._id ? "Product updated successfully" : "Product created successfully",
      })
      window.location.reload()

      onSuccess(response)
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: product?._id ? "Failed to update product" : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <Card className="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl">
            {product?._id ? "Edit Product" : "Add Product"}
          </CardTitle>
          <button
            onClick={onClose}
            className="rounded-sm p-2 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(100vh-7rem)] sm:max-h-[calc(100vh-8rem)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Product Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-background min-h-[6rem] resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-sm font-medium">Images</label>

              {/* Existing images (edit mode) */}
              {existingImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Current images</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {existingImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`${BASE_URL}${img}`}
                          alt={`existing-${index}`}
                          className="w-full aspect-square object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image upload */}
              <label className="mt-2 flex items-center gap-2 cursor-pointer w-fit px-3 py-2 border rounded-lg hover:bg-secondary transition-colors">
                <ImagePlus className="w-4 h-4" />
                <span className="text-sm">
                  {newImages.length > 0 ? `${newImages.length} file(s) selected` : "Upload images"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {/* New image previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">New images</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-full aspect-square object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin inline-block" />}
                {product?._id ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}