"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  label?: string
  placeholder?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  className?: string
}

export function DatePicker({ label, placeholder = "Select date", value, onChange, className }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(value)

  const handleSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (onChange) {
      onChange(newDate)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {label && <Label>{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn("w-full justify-start text-left font-normal flex h-10 w-full rounded-md border border-input bg-white\/5 border-white\/10 px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={date} onSelect={handleSelect} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  )
}