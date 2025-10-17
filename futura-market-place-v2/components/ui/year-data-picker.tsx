"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function YearDatePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<Date>()
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  const handleYearChange = (increment: number) => {
    const newDate = new Date(currentMonth)
    newDate.setFullYear(newDate.getFullYear() + increment)
    setCurrentMonth(newDate)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Select date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between px-4 pt-3">
            <Button variant="ghost" size="icon" onClick={() => handleYearChange(-1)} aria-label="Previous year">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">{format(currentMonth, "yyyy")}</div>
            <Button variant="ghost" size="icon" onClick={() => handleYearChange(1)} aria-label="Next year">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate)
              setCalendarOpen(false)
            }}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}