import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CustomerStep({ state }) {
  const {
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    clientEmail,
    setClientEmail,
    clientAddress,
    setClientAddress,
    setCurrentStep,
  } = state

  const canContinue =
    clientName.trim() &&
    clientPhone.trim() &&
    clientEmail.trim() &&
    clientAddress.trim()

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">
        Your details
      </h2>

      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm text-white/70">Full name</label>
          <Input
            className="bg-brand-dark border-brand-purple/30 text-white placeholder:text-white/30"
            placeholder="John Doe"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70">Phone number</label>
          <Input
            className="bg-brand-dark border-brand-purple/30 text-white placeholder:text-white/30"
            placeholder="+31 6 12345678"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70">Email address</label>
          <Input
            className="bg-brand-dark border-brand-purple/30 text-white placeholder:text-white/30"
            placeholder="you@example.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/70">Address</label>
          <Input
            className="bg-brand-dark border-brand-purple/30 text-white placeholder:text-white/30"
            placeholder="Street, City"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
        </div>
      </div>

      <Button
        className="w-full bg-brand-purple hover:bg-brand-purpleDark text-white"
        disabled={!canContinue}
        onClick={() => setCurrentStep("pet")}
      >
        Continue
      </Button>
    </div>
  )
}
