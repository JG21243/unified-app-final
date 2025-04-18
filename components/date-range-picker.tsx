"use client"

import type React from "react"
import { useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

interface DateRange {
  from?: Date
  to?: Date
}

interface DateRangePickerProps {
  onSelect: (range: DateRange) => void
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ onSelect }) => {
  const [date, setDate] = useState<DateRange | undefined>(undefined)

  const handleDateSelect = (day: Date | undefined) => {
    const range = {
      from: date?.from,
      to: date?.to,
    }

    if (!range.from) {
      range.from = day
    } else if (range.from && !range.to && day && day > range.from) {
      range.to = day
    } else {
      range.from = day
      range.to = undefined
    }

    setDate(range)
    onSelect(range) // Make sure we're calling this with the updated range
  }

  return (
    <div>
      <DayPicker mode="single" selected={date?.from} onSelect={handleDateSelect} />
      {date?.from && (
        <p className="text-sm">
          {date.from.toLocaleDateString()} {date.to ? `- ${date.to.toLocaleDateString()}` : ""}
        </p>
      )}
    </div>
  )
}

export default DateRangePicker

