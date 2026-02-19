"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  max?: number
  min?: number
}

export function QuantitySelector({ value, onChange, max = 999, min = 1 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-border rounded-lg w-fit">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none border-r"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = Number.parseInt(e.target.value) || min
          onChange(Math.min(Math.max(val, min), max))
        }}
        className="w-12 text-center border-0 bg-transparent focus:outline-none"
        min={min}
        max={max}
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none border-l"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}
