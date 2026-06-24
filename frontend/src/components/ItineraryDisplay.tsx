import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ItineraryResponse } from '@/lib/api'

interface ItineraryDisplayProps {
  itinerary: ItineraryResponse
  userBudget?: number | null
  userBudgetCurrency?: string
  onViewMap: () => void
  onStartOver: () => void
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function ItineraryDisplay({
  itinerary,
  userBudget,
  userBudgetCurrency,
  onViewMap,
  onStartOver,
}: ItineraryDisplayProps) {
  const [selectedDay, setSelectedDay] = useState(0)

  const { days, budget_breakdown, total_estimated_cost, currency } = itinerary
  const currentDay = days[selectedDay]

  const budgetItems = [
    { label: 'Accommodation', amount: budget_breakdown.accommodation },
    { label: 'Food', amount: budget_breakdown.food },
    { label: 'Activities', amount: budget_breakdown.activities },
    { label: 'Transport', amount: budget_breakdown.transport },
  ]

  const isOverBudget =
    userBudget != null && total_estimated_cost > userBudget
  const isUnderBudget =
    userBudget != null && total_estimated_cost <= userBudget

  const totalColorClass =
    isOverBudget
      ? 'text-red-600 dark:text-red-400'
      : isUnderBudget
      ? 'text-green-600 dark:text-green-400'
      : 'text-foreground'

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">✈️</span>
          <span className="font-bold text-lg">IceMyVacation</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onStartOver}>
          Start Over
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left / Top: Day-by-day itinerary ── */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold mb-4">Your Itinerary</h2>

            {/* Day selector tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {days.map((day, idx) => (
                <Button
                  key={day.day}
                  variant={selectedDay === idx ? 'default' : 'outline'}
                  size="sm"
                  className="flex-shrink-0"
                  onClick={() => setSelectedDay(idx)}
                >
                  Day {day.day}
                </Button>
              ))}
            </div>

            {/* View on Map button */}
            <Button className="w-full mb-4" onClick={onViewMap}>
              🗺️ View on Map
            </Button>

            {/* Selected day date */}
            {currentDay && (
              <p className="text-sm text-muted-foreground mb-3">
                {new Date(currentDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}

            {/* Activity cards */}
            <div className="space-y-3">
              {currentDay?.activities.map((activity, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{activity.time}</Badge>
                        <h3 className="font-bold text-lg leading-tight">{activity.title}</h3>
                      </div>
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                        {formatCurrency(activity.estimated_cost, currency)}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>

                    <p className="text-xs text-muted-foreground">
                      📍 {activity.location}
                    </p>

                    {activity.transport_note && (
                      <p className="text-xs text-muted-foreground italic mt-1">
                        🚌 {activity.transport_note}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Right / Bottom: Budget breakdown ── */}
          <div className="lg:w-80 flex-shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Budget Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {budgetItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t my-4" />

                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Total Estimated Cost</span>
                  <span className={`text-lg font-bold ${totalColorClass}`}>
                    {formatCurrency(total_estimated_cost, currency)}
                  </span>
                </div>

                {userBudget != null && userBudgetCurrency && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Your Budget</span>
                    <span className="font-medium">
                      {formatCurrency(userBudget, userBudgetCurrency)}
                    </span>
                  </div>
                )}

                {isOverBudget && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                    Over budget by{' '}
                    {formatCurrency(total_estimated_cost - (userBudget ?? 0), currency)}
                  </p>
                )}
                {isUnderBudget && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                    Within budget — saving{' '}
                    {formatCurrency((userBudget ?? 0) - total_estimated_cost, currency)}
                  </p>
                )}

                {/* Disclaimer */}
                <div className="mt-4 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-2">
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    ⚠️ Note: A buffer of ±10–15% should be expected due to local price
                    variations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
