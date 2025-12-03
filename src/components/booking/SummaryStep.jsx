import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SummaryStep({ state }) {
  const {
    service,
    selectedSlots,
    scheduleEntries, // derived: [{ date, time }]
    pricing,
    notes,
    setNotes,
    formatCurrency,
    setCurrentStep,
    handleBookAndPay,
    isBooking,
  } = state

  return (
    <div className="space-y-8 pb-6">
      <h2 className="text-xl font-semibold text-white">Review your booking</h2>

      {/* Service */}
      <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-xl p-4 space-y-2">
        <h3 className="text-lg font-medium text-white">{service.title}</h3>
        <p className="text-sm opacity-70">{service.duration}</p>
      </div>

      {/* Schedule */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">Your visits</h4>

        {scheduleEntries.map((entry, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-2 border-b border-white/10 text-sm"
          >
            <span className="text-white">
              {new Date(entry.date).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-white opacity-90">{entry.time}</span>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3">
        <h4 className="font-medium text-white">Price breakdown</h4>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/80">Dogs</span>
            <span className="text-white">{pricing.dogCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">Visits</span>
            <span className="text-white">{pricing.visitCount}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/80">Price per dog per visit</span>
            <span className="text-white">
              {formatCurrency(pricing.perDogPerVisit)}
            </span>
          </div>

          {pricing.selectedAddons?.length > 0 && (
            <>
              <hr className="border-brand-purple/20" />
              <span className="text-white/80 text-xs">Add-ons</span>
              {pricing.selectedAddons.map((addon) => (
                <div key={addon.value} className="flex justify-between">
                  <span className="text-white">{addon.label}</span>
                  <span className="text-white">
                    {formatCurrency(pricing.parsePriceValue(addon.price))}
                  </span>
                </div>
              ))}
            </>
          )}

          <hr className="border-brand-purple/20" />

          <div className="flex justify-between text-base font-semibold">
            <span className="text-white">Total</span>
            <span className="text-brand-purple">
              {formatCurrency(pricing.totalPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm text-white/70">Notes (optional)</label>
        <textarea
          className="w-full bg-brand-dark border-brand-purple/30 text-white rounded-md px-3 py-2 placeholder:text-white/30"
          placeholder="Tell us anything we should know..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full border-brand-purple text-white hover:bg-brand-purple/20"
          onClick={() => setCurrentStep("pet")}
        >
          Back to pets
        </Button>

        <Button
          className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white"
          disabled={isBooking}
          onClick={handleBookAndPay}
        >
          {isBooking ? "Processing…" : "Pay & Confirm Booking"}
        </Button>
      </div>
    </div>
  )
}
