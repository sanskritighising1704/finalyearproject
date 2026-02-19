"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthResponse } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, address: string) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
    const router = useRouter()

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      refreshProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      })
      localStorage.setItem("authToken", response.token)
      setUser(response.user)
      if(response.user.role==="admin"){
        router.push("/admin")
      }else{
        router.push("/admin")
      }
    } catch (error) {
      throw new Error("Login failed")
    }
  }

  const register = async (name: string, email: string, password: string, address: string) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
        address,
      })
      localStorage.setItem("authToken", response.token)
      setUser(response.user)
      if(response.user.role==="admin"){
        router.push("/admin")
      }else{
        router.push("/")
      }
   
    } catch (error) {
      throw new Error("Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setUser(null)
  }

  const refreshProfile = async () => {
    try {
      const response = await apiClient.get<any>("/auth/profile")
      setUser(response?.user)
    } catch (error) {
      logout()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
