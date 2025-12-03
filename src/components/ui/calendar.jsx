import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { cn } from "@/lib/utils"

export function Calendar({ className, ...props }) {
  return (
    <DayPicker
      className={cn("p-3", className)}
      components={{
        IconLeft: () => <ChevronLeft size={18} />,
        IconRight: () => <ChevronRight size={18} />,
      }}
      {...props}
    />
  )
}
