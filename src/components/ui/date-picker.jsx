import * as React from "react"
import { DateTime } from "luxon"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"
import { Calendar } from "./calendar"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export function DatePicker({ value, onChange }) {
  const [date, setDate] = React.useState(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-neutral-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL)
            : "Pick a date"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            setDate(d)
            onChange?.(d)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
