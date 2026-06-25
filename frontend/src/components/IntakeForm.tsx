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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero header */}
        <FadeUp delay={0} className="text-center mb-10">
          {/* Sun decoration */}
          <div className="text-6xl mb-4">🌴</div>
          <h1 className="font-fredoka text-5xl md:text-6xl text-primary mb-3 tracking-wide">
            IceMyVacation
          </h1>
          <p className="font-nunito text-lg text-muted-foreground font-medium">
            Let AI craft your perfect personalised itinerary
          </p>
        </FadeUp>

        {/* Form card */}
        <FadeUp delay={0.15}>
          <div className="bg-white rounded-3xl border-2 border-border shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit}>
              <StaggerContainer>

                {/* ── Personal Info ── */}
                <StaggerItem>
                  <div className="px-8 pt-8 pb-6 border-b border-border">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">👤</span>
                      <h2 className="font-fredoka text-xl text-foreground tracking-wide">Personal Info</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-nunito font-600 text-sm text-foreground">Full Name *</Label>
                        <Input id="name" type="text" placeholder="Jane Doe" required disabled={loading}
                          value={form.name ?? ''} onChange={(e) => set('name', e.target.value)}
                          className="rounded-xl border-2 h-11 font-nunito" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-nunito font-600 text-sm text-foreground">Email *</Label>
                        <Input id="email" type="email" placeholder="jane@example.com" required disabled={loading}
                          value={form.email ?? ''} onChange={(e) => set('email', e.target.value)}
                          className="rounded-xl border-2 h-11 font-nunito" />
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* ── Trip Details ── */}
                <StaggerItem>
                  <div className="px-8 py-6 border-b border-border">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">🌍</span>
                      <h2 className="font-fredoka text-xl text-foreground tracking-wide">Trip Details</h2>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="font-nunito font-600 text-sm text-foreground">Destination *</Label>
                        <Input id="destination" type="text" placeholder="e.g. Bangkok, Thailand" required disabled={loading}
                          value={form.destination ?? ''} onChange={(e) => set('destination', e.target.value)}
                          className="rounded-xl border-2 h-11 font-nunito" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hotel" className="font-nunito font-600 text-sm text-foreground">Hotel / Area <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Input id="hotel" type="text" placeholder="Hotel name or neighbourhood" disabled={loading}
                          value={form.hotel ?? ''} onChange={(e) => set('hotel', e.target.value)}
                          className="rounded-xl border-2 h-11 font-nunito" />
                      </div>
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="start_date" className="font-nunito font-600 text-sm text-foreground">Start Date *</Label>
                          <Input id="start_date" type="date" required min={today} disabled={loading}
                            value={form.start_date ?? ''} onChange={(e) => set('start_date', e.target.value)}
                            className="rounded-xl border-2 h-11 font-nunito" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date" className="font-nunito font-600 text-sm text-foreground">End Date *</Label>
                          <Input id="end_date" type="date" required min={form.start_date ?? today} disabled={loading}
                            value={form.end_date ?? ''} onChange={(e) => set('end_date', e.target.value)}
                            className="rounded-xl border-2 h-11 font-nunito" />
                        </div>
                      </div>
                      <div className="space-y-2 max-w-[180px]">
                        <Label htmlFor="num_people" className="font-nunito font-600 text-sm text-foreground">Number of People *</Label>
                        <Input id="num_people" type="number" min={1} required disabled={loading}
                          value={form.num_people ?? 1}
                          onChange={(e) => set('num_people', parseInt(e.target.value, 10))}
                          className="rounded-xl border-2 h-11 font-nunito" />
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* ── Transport & Budget ── */}
                <StaggerItem>
                  <div className="px-8 py-6">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-2xl">✈️</span>
                      <h2 className="font-fredoka text-xl text-foreground tracking-wide">Transport &amp; Budget</h2>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="transport_mode" className="font-nunito font-600 text-sm text-foreground">Transport Mode</Label>
                        <Select disabled={loading} value={form.transport_mode ?? 'public_transit'}
                          onValueChange={(val) => set('transport_mode', val)}>
                          <SelectTrigger id="transport_mode" className="rounded-xl border-2 h-11 font-nunito">
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
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="budget" className="font-nunito font-600 text-sm text-foreground">Budget <span className="text-muted-foreground font-normal">(optional)</span></Label>
                          <Input id="budget" type="number" min={0} step="0.01" placeholder="0.00" disabled={loading}
                            value={form.budget ?? ''}
                            onChange={(e) => set('budget', e.target.value ? parseFloat(e.target.value) : ('' as unknown as number))}
                            className="rounded-xl border-2 h-11 font-nunito" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="budget_currency" className="font-nunito font-600 text-sm text-foreground">Currency</Label>
                          <Input id="budget_currency" type="text" placeholder="USD, EUR, THB…" maxLength={10} disabled={loading}
                            value={form.budget_currency ?? 'USD'}
                            onChange={(e) => set('budget_currency', e.target.value.toUpperCase())}
                            className="rounded-xl border-2 h-11 font-nunito" />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>

                {/* Error */}
                {error && (
                  <StaggerItem>
                    <div className="mx-8 mb-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 text-sm font-nunito">
                      {error}
                    </div>
                  </StaggerItem>
                )}

                {/* Submit */}
                <StaggerItem>
                  <div className="px-8 pb-8">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button type="submit" size="lg" disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-fredoka tracking-wider rounded-2xl h-14 text-lg shadow-md border-0">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Planning your adventure…
                          </>
                        ) : (
                          '✈️  Generate My Itinerary'
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </StaggerItem>

              </StaggerContainer>
            </form>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}
