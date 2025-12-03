import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TimeStep({ state }) {
  const {
    selectedDate,
    selectedTime,
    setSelectedTime,
    availability,
    isDayAvailableForService,
    setSelectedSlots,
    setCurrentStep,
    formatTime,
  } = state

  if (!selectedDate) {
    return (
      <p className="text-sm opacity-60">
        Please choose a date first.
      </p>
    )
  }

  const day = availability.dates.find((d) => d.date === selectedDate)
  if (!day || !isDayAvailableForService(day)) {
    return (
      <p className="text-sm opacity-60">
        No available times for this day.
      </p>
    )
  }

  const handleSelectTime = (time) => {
    setSelectedTime(time)
    setSelectedSlots({ [selectedDate]: time })
  }

  return (
    <div className="space-y-6 pb-4">
      <h2 className="text-xl font-semibold text-white">
        Choose a time
      </h2>

      <p className="text-sm opacity-70">
        {new Date(selectedDate).toLocaleDateString(undefined, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>

      {/* Time slots as pills */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {day.slots.map((slot) => {
          const disabled = !slot.available
          const active = selectedTime === slot.time

          return (
            <button
              key={slot.time}
              disabled={disabled}
              onClick={() => handleSelectTime(slot.time)}
              className={cn(
                "rounded-md px-3 py-2 text-center text-sm border transition-all",
                disabled && "opacity-30 cursor-not-allowed border-gray-600",
                active &&
                  "bg-brand-purple text-white border-brand-purple shadow-lg scale-[1.03]",
                !active &&
                  !disabled &&
                  "border-brand-purple/30 hover:bg-brand-purple/20 text-white"
              )}
            >
              {formatTime(slot.time)}
            </button>
          )
        })}
      </div>

      {/* Continue */}
      <Button
        className="w-full bg-brand-purple hover:bg-brand-purpleDark"
        disabled={!selectedTime}
        onClick={() => setCurrentStep("customer")}
      >
        Continue
      </Button>
    </div>
  )
}
