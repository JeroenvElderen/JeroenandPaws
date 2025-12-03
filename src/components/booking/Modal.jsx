import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Stepper } from "./Stepper"
import { CalendarStep } from "./CalendarStep"
import { TimeStep } from "./TimeStep"
import { CustomerStep } from "./CustomerStep"
import { PetStep } from "./PetStep"
import { SummaryStep } from "./SummaryStep"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BookingModal({ open, onClose, service, state }) {
  const { currentStep } = state

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Fullscreen mobile modal
          "fixed inset-0 p-0 glass border-none rounded-none shadow-none",
          "flex flex-col bg-brand-dark text-white",
          // Desktop positioning
          "md:max-w-3xl md:h-[90vh] md:mx-auto md:my-8 md:rounded-xl md:shadow-xl"
        )}
      >
        {/* Header */}
        <header className="flex items-center justify-between bg-brand-purple px-6 py-4 shadow-md">
          <div>
            <p className="uppercase text-[10px] tracking-tight opacity-70">
              {service.duration}
            </p>
            <h3 className="text-lg font-semibold leading-tight">
              {service.title}
            </h3>
            <span className="opacity-80 text-xs">Jeroen & Paws</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close booking"
            className="text-white text-2xl leading-none hover:opacity-70"
          >
            ×
          </button>
        </header>

        {/* Steps & content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Stepper current={currentStep} />
          <div>
            {currentStep === "calendar" && <CalendarStep state={state} service={service} />}
            {currentStep === "time" && <TimeStep state={state} />}
            {currentStep === "customer" && <CustomerStep state={state} />}
            {currentStep === "pet" && <PetStep state={state} />}
            {currentStep === "summary" && <SummaryStep state={state} />}
          </div>
        </main>
      </DialogContent>
    </Dialog>
  );
}
