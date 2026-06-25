import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { generateItinerary } from '@/lib/api'
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion'
import type { ItineraryRequest, ItineraryResponse } from '@/lib/api'

interface IntakeFormProps {
  onItineraryGenerated: (data: ItineraryResponse, budget?: number, budgetCurrency?: string) => void
  onSubmitting: () => void
}

export function IntakeForm({ onItineraryGenerated, onSubmitting }: IntakeFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<Partial<ItineraryRequest>>({
    num_people: 1,
    transport_mode: 'public_transit',
    budget_currency: 'USD',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: keyof ItineraryRequest, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    onSubmitting()
    setLoading(true)
    try {
      const payload: ItineraryRequest = {
        name: form.name!,
        email: form.email!,
        start_date: form.start_date!,
        end_date: form.end_date!,
        destination: form.destination!,
        hotel: form.hotel,
        num_people: form.num_people ?? 1,
        transport_mode: form.transport_mode ?? 'public_transit',
        budget: form.budget,
        budget_currency: form.budget_currency ?? 'USD',
      }
      const data = await generateItinerary(payload)
      onItineraryGenerated(
        data,
        typeof payload.budget === 'number' ? payload.budget : undefined,
        payload.budget_currency,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const inputClass =
    'bg-white/10 border-white/30 text-white placeholder:text-white/40 focus-visible:ring-[#C9956A] focus-visible:border-[#C9956A]'
  const labelClass = 'text-white/80 text-sm font-medium'

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #1A0F0A 0%, #3D2314 30%, #6B3E26 60%, #9B6644 80%, #C9956A 100%)',
        }}
      />
      {/* Ambient texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 20% 50%, #C9956A44 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #8B4A2044 0%, transparent 50%)',
        }}
      />
      {/* Bottom fade for form readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center py-12 px-4">
        {/* Hero heading */}
        <FadeUp delay={0} className="text-center mb-8">
          <h1 className="font-playfair italic text-5xl md:text-6xl text-white tracking-tight mb-3 drop-shadow-lg">
            IceMyVacation
          </h1>
          <p className="text-white/70 text-lg font-light tracking-wide">
            Let AI craft your perfect personalised itinerary
          </p>
        </FadeUp>

        {/* Glass form card */}
        <FadeUp delay={0.2} className="w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              <StaggerContainer>
                {/* Personal Info */}
                <StaggerItem>
                  <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">
                      Personal Info
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className={labelClass}>
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Jane Doe"
                          required
                          disabled={loading}
                          value={form.name ?? ''}
                          onChange={(e) => set('name', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className={labelClass}>
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="jane@example.com"
                          required
                          disabled={loading}
                          value={form.email ?? ''}
                          onChange={(e) => set('email', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>
                </StaggerItem>

                {/* Trip Details */}
                <StaggerItem>
                  <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">
                      Trip Details
                    </h2>
                    <div className="space-y-2">
                      <Label htmlFor="destination" className={labelClass}>
                        Destination *
                      </Label>
                      <Input
                        id="destination"
                        type="text"
                        placeholder="e.g. Bangkok, Thailand"
                        required
                        disabled={loading}
                        value={form.destination ?? ''}
                        onChange={(e) => set('destination', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotel" className={labelClass}>
                        Hotel / Area (optional)
                      </Label>
                      <Input
                        id="hotel"
                        type="text"
                        placeholder="Hotel name or neighbourhood"
                        disabled={loading}
                        value={form.hotel ?? ''}
                        onChange={(e) => set('hotel', e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="start_date" className={labelClass}>
                          Start Date *
                        </Label>
                        <Input
                          id="start_date"
                          type="date"
                          required
                          min={today}
                          disabled={loading}
                          value={form.start_date ?? ''}
                          onChange={(e) => set('start_date', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date" className={labelClass}>
                          End Date *
                        </Label>
                        <Input
                          id="end_date"
                          type="date"
                          required
                          min={form.start_date ?? today}
                          disabled={loading}
                          value={form.end_date ?? ''}
                          onChange={(e) => set('end_date', e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:max-w-[160px]">
                      <Label htmlFor="num_people" className={labelClass}>
                        Number of People *
                      </Label>
                      <Input
                        id="num_people"
                        type="number"
                        min={1}
                        required
                        disabled={loading}
                        value={form.num_people ?? 1}
                        onChange={(e) => set('num_people', parseInt(e.target.value, 10))}
                        className={inputClass}
                      />
                    </div>
                  </section>
                </StaggerItem>

                {/* Transport & Budget */}
                <StaggerItem>
                  <section className="space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-white/50 border-b border-white/10 pb-2">
                      Transport &amp; Budget
                    </h2>
                    <div className="space-y-2">
                      <Label htmlFor="transport_mode" className={labelClass}>
                        Transport Mode
                      </Label>
                      <Select
                        disabled={loading}
                        value={form.transport_mode ?? 'public_transit'}
                        onValueChange={(val) => set('transport_mode', val)}
                      >
                        <SelectTrigger id="transport_mode" className={inputClass}>
                          <SelectValue placeholder="Select transport mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="public_transit">Public Transit</SelectItem>
                          <SelectItem value="flight">Flight</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="budget" className={labelClass}>
                          Budget (optional)
                        </Label>
                        <Input
                          id="budget"
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          disabled={loading}
                          value={form.budget ?? ''}
                          onChange={(e) =>
                            set(
                              'budget',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : ('' as unknown as number),
                            )
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget_currency" className={labelClass}>
                          Currency
                        </Label>
                        <Input
                          id="budget_currency"
                          type="text"
                          placeholder="USD, EUR, THB…"
                          maxLength={10}
                          disabled={loading}
                          value={form.budget_currency ?? 'USD'}
                          onChange={(e) => set('budget_currency', e.target.value.toUpperCase())}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </section>
                </StaggerItem>

                {/* Error */}
                {error && (
                  <StaggerItem>
                    <div className="rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 px-4 py-3 text-sm">
                      {error}
                    </div>
                  </StaggerItem>
                )}

                {/* Submit */}
                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-[#C9956A] hover:bg-[#B8845A] text-white font-semibold tracking-wide rounded-xl h-12 text-base shadow-lg border-0"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Planning your adventure…
                        </>
                      ) : (
                        'Generate My Itinerary'
                      )}
                    </Button>
                  </motion.div>
                </StaggerItem>
              </StaggerContainer>
            </form>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}
