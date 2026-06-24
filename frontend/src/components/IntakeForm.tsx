import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { generateItinerary, ItineraryRequest, ItineraryResponse } from '@/lib/api'

interface IntakeFormProps {
  onItineraryGenerated: (data: ItineraryResponse) => void
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
      onItineraryGenerated(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">✈️</div>
          <h1 className="text-3xl font-bold tracking-tight">IceMyVacation</h1>
          <p className="text-muted-foreground mt-1">
            Let AI craft your perfect personalised itinerary
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Plan Your Trip</CardTitle>
            <CardDescription>
              Fill in the details below and we'll generate a day-by-day itinerary just for you.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ── Section 1: Personal Info ── */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Personal Info
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      required
                      disabled={loading}
                      value={form.name ?? ''}
                      onChange={(e) => set('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      required
                      disabled={loading}
                      value={form.email ?? ''}
                      onChange={(e) => set('email', e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* ── Section 2: Trip Details ── */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Trip Details 🌴
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="e.g. Bangkok, Thailand"
                    required
                    disabled={loading}
                    value={form.destination ?? ''}
                    onChange={(e) => set('destination', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel">Hotel / Area (optional)</Label>
                  <Input
                    id="hotel"
                    type="text"
                    placeholder="Optional: hotel name or area"
                    disabled={loading}
                    value={form.hotel ?? ''}
                    onChange={(e) => set('hotel', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      min={today}
                      disabled={loading}
                      value={form.start_date ?? ''}
                      onChange={(e) => set('start_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      required
                      min={form.start_date ?? today}
                      disabled={loading}
                      value={form.end_date ?? ''}
                      onChange={(e) => set('end_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:max-w-[160px]">
                  <Label htmlFor="num_people">Number of People *</Label>
                  <Input
                    id="num_people"
                    type="number"
                    min={1}
                    required
                    disabled={loading}
                    value={form.num_people ?? 1}
                    onChange={(e) => set('num_people', parseInt(e.target.value, 10))}
                  />
                </div>
              </section>

              {/* ── Section 3: Transportation & Budget ── */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">
                  Transportation &amp; Budget
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="transport_mode">Transport Mode</Label>
                  <Select
                    disabled={loading}
                    value={form.transport_mode ?? 'public_transit'}
                    onValueChange={(val) => set('transport_mode', val)}
                  >
                    <SelectTrigger id="transport_mode">
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
                    <Label htmlFor="budget">Budget (optional)</Label>
                    <Input
                      id="budget"
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      disabled={loading}
                      value={form.budget ?? ''}
                      onChange={(e) =>
                        set('budget', e.target.value ? parseFloat(e.target.value) : ('' as unknown as number))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_currency">Currency</Label>
                    <Input
                      id="budget_currency"
                      type="text"
                      placeholder="USD, EUR, THB..."
                      maxLength={10}
                      disabled={loading}
                      value={form.budget_currency ?? 'USD'}
                      onChange={(e) => set('budget_currency', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              </section>

              {/* ── Error ── */}
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              {/* ── Submit ── */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planning your adventure...
                  </>
                ) : (
                  'Generate My Itinerary ✈️'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
