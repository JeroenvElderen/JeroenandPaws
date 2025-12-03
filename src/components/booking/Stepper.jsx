import { cn } from "@/lib/utils"

export function Stepper({ current }) {
  const steps = ["calendar", "time", "customer", "pet", "summary"]

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      {steps.map((step, idx) => {
        const active = current === step
        const done = steps.indexOf(current) > idx

        return (
          <div
            key={step}
            className={cn(
              "flex-1 text-center py-2 rounded-md text-xs font-medium",
              active && "bg-brand-purple text-white shadow",
              done && "bg-brand-purpleDark text-white",
              !active && !done && "bg-gray-700 text-gray-300"
            )}
          >
            {step.toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}
