"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Cart } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addItem: (productId: string, quantity: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

interface cartapiResponse {
  sucess: boolean
  cart: Cart
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refreshCart()
  }, [])

  const refreshCart = async () => {
    try {
      const response = await apiClient.get<cartapiResponse>("/cart")
      setCart(response.cart)
    } catch (error) {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (productId: string, quantity: number) => {
    try {
      await apiClient.post("/cart/add", { productId, quantity })
      await refreshCart()
    } catch (error) {
      throw new Error("Failed to add item to cart")
    }
  }

  const removeItem = async (productId: string) => {
    try {
      await apiClient.delete(`/cart/item/${productId}`)
      await refreshCart()
    } catch (error) {
      throw new Error("Failed to remove item from cart")
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      await apiClient.put("/cart/update", { productId, quantity })
      await refreshCart()
    } catch (error) {
      throw new Error("Failed to update quantity")
    }
  }

  const clearCart = async () => {
    try {
      await apiClient.delete("/cart/clear")
      await refreshCart()
    } catch (error) {
      throw new Error("Failed to clear cart")
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
