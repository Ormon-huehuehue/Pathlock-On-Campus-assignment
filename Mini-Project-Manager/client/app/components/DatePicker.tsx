"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  minDate?: Date;
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "Select date",
  className = "",
  error = false,
  minDate
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convert string value to Date object
  const selectedDate = value ? new Date(value) : undefined

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Convert Date to YYYY-MM-DD string format
      const dateString = date.toISOString().split('T')[0];
      onChange(dateString);
    }
    setOpen(false);
  };

  return (
    <div className={`flex ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={`w-full justify-between font-normal px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            captionLayout="dropdown"
            onSelect={handleDateSelect}
            disabled={(date) => minDate ? date < minDate : false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
