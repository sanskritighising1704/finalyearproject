// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// User types
export interface User {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  address?: string
  createdAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Product types
export interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  brand: string
  images: string[]
  rating: number
  reviews: number
  stock: number
  isActive:boolean
  specifications?: Record<string, string>
}

export interface ProductsResponse {
  products: Product[]
  total: number
  pages: number
  currentPage: number
}

// Cart types
export interface CartItem {
  productId: string
  product: Product
  quantity: number
  subtotal: number
  price:number
}

export interface Cart {
  items: CartItem[]
  totalPrice: number
}

// Order types
export interface Order {
  _id: string
  userId: string
  items: CartItem[]
  shippingAddress: string
  paymentMethod: string
  totalPrice: number
  taxPrice: number
  shippingPrice: number
  orderStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  updatedAt: string
}

export interface OrdersResponse {
  orders: Order[]
  total: number
}

// Admin types
export interface AdminStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  recentOrders: Order[]
}
