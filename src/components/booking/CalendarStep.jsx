import { useMemo } from "react"
import { DayPicker } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function CalendarStep({ service, state }) {
  const {
    selectedDate,
    setSelectedDate,
    availability,
    isDayAvailableForService,
    getDefaultSlotForDate,
    setSelectedSlots,
    setSelectedTime,
    setCurrentStep,
  } = state

  const availableDays = useMemo(() => {
    return new Set((availability?.dates || [])
      .filter((day) => isDayAvailableForService(day))
      .map((day) => day.date))
  }, [availability, isDayAvailableForService])

  const handleSelect = (date) => {
    if (!date) return
    const iso = date.toISOString().split("T")[0]

    if (!availableDays.has(iso)) return

    // Select date
    setSelectedDate(iso)

    // Auto-select first available time
    const defaultSlot = getDefaultSlotForDate(iso)
    setSelectedTime(defaultSlot)
    setSelectedSlots({ [iso]: defaultSlot })

    // Go to next step
    setCurrentStep("time")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Choose a date</h2>

      <div className="rounded-xl bg-brand-purple/10 p-4 border border-brand-purple/30 shadow-md">
        <DayPicker
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={handleSelect}
          disabled={(day) => {
            const iso = day.toISOString().split("T")[0]
            return !availableDays.has(iso)
          }}
          showOutsideDays
          components={{
            IconLeft: () => <ChevronLeft className="text-brand-purple" />,
            IconRight: () => <ChevronRight className="text-brand-purple" />,
          }}
          className="text-white"
          classNames={{
            nav_button: "text-brand-purple hover:bg-brand-purple/20 rounded-md",
            day: "rounded-md w-9 h-9 flex items-center justify-center",
            day_selected:
              "bg-brand-purple text-white rounded-md font-semibold shadow",
            day_today: "border border-brand-purple text-white font-semibold",
            day_disabled: "opacity-30 cursor-not-allowed",
          }}
        />
      </div>

      <Button
        variant="outline"
        className="border-brand-purple text-white hover:bg-brand-purple/20"
        onClick={() => setCurrentStep("time")}
        disabled={!selectedDate}
      >
        Continue
      </Button>
    </div>
  )
}
