"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface PaymentFormProps {
  onSubmit: (method: string) => void
  loading?: boolean
}

export function PaymentForm({ onSubmit, loading = false }: PaymentFormProps) {
  const [method, setMethod] = useState("credit-card")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(method)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Continuing..." : "Continue to Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
