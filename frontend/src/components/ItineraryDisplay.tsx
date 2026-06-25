import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Compass } from 'lucide-react'
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/motion'
import type { ItineraryResponse } from '@/lib/api'

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

function AnimatedNumber({ value, currency }: { value: number; currency: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate(v) {
        node.textContent = formatCurrency(v, currency)
      },
    })
    return () => controls.stop()
  }, [value, currency])

  return <span ref={ref}>{formatCurrency(0, currency)}</span>
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

  const isOverBudget = userBudget != null && total_estimated_cost > userBudget
  const isUnderBudget = userBudget != null && total_estimated_cost <= userBudget

  const totalColorClass = isOverBudget
    ? 'text-red-600'
    : isUnderBudget
    ? 'text-green-600'
    : 'text-[#C9956A]'

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="font-playfair italic text-xl text-foreground">IceMyVacation</span>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartOver}
            className="text-muted-foreground hover:text-foreground"
          >
            Start Over
          </Button>
        </motion.div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page title */}
        <FadeUp className="mb-6">
          <h2 className="font-playfair italic text-3xl md:text-4xl text-foreground">
            Your Itinerary
          </h2>
        </FadeUp>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: itinerary */}
          <div className="flex-1 min-w-0">
            {/* Day tabs with shared layout animation */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {days.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(idx)}
                  className="relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  {selectedDay === idx && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full bg-[#C9956A]"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span
                    className={`relative z-10 ${
                      selectedDay === idx ? 'text-white' : 'text-muted-foreground'
                    }`}
                  >
                    Day {day.day}
                  </span>
                </button>
              ))}
            </div>

            {/* View on Map */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mb-4"
            >
              <Button
                className="w-full bg-[#C9956A] hover:bg-[#B8845A] text-white font-medium rounded-xl h-11 gap-2 border-0"
                onClick={onViewMap}
              >
                <Compass size={16} />
                View on Map
              </Button>
            </motion.div>

            {/* Date label */}
            {currentDay && (
              <FadeUp key={`date-${selectedDay}`} className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {new Date(currentDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </FadeUp>
            )}

            {/* Activity cards — exit old, enter new on day change */}
            <AnimatePresence mode="wait">
              <StaggerContainer key={`cards-${selectedDay}`} className="space-y-3">
                {currentDay?.activities.map((activity, idx) => (
                  <StaggerItem key={idx}>
                    <motion.div
                      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                      className="bg-card border border-border rounded-xl p-4 cursor-default"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-muted text-muted-foreground border-0 rounded-full text-xs font-normal">
                            {activity.time}
                          </Badge>
                          <h3 className="font-semibold text-base leading-tight">
                            {activity.title}
                          </h3>
                        </div>
                        <span className="text-sm font-semibold text-[#C9956A] whitespace-nowrap">
                          {formatCurrency(activity.estimated_cost, currency)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">📍 {activity.location}</p>
                      {activity.transport_note && (
                        <p className="text-xs text-muted-foreground italic mt-1">
                          🚌 {activity.transport_note}
                        </p>
                      )}
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </AnimatePresence>
          </div>

          {/* Right: Budget */}
          <div className="lg:w-80 flex-shrink-0">
            <FadeUp delay={0.2}>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-playfair italic text-xl mb-4 text-foreground">
                  Budget Overview
                </h3>
                <StaggerContainer className="space-y-3">
                  {budgetItems.map((item) => (
                    <StaggerItem key={item.label}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium">
                          <AnimatedNumber value={item.amount} currency={currency} />
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <div className="border-t border-border my-4" />

                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">Total Estimated Cost</span>
                  <span className={`text-lg font-bold ${totalColorClass}`}>
                    <AnimatedNumber value={total_estimated_cost} currency={currency} />
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
                  <p className="text-xs text-red-600 mt-2">
                    Over budget by{' '}
                    {formatCurrency(total_estimated_cost - (userBudget ?? 0), currency)}
                  </p>
                )}
                {isUnderBudget && (
                  <p className="text-xs text-green-600 mt-2">
                    Within budget — saving{' '}
                    {formatCurrency((userBudget ?? 0) - total_estimated_cost, currency)}
                  </p>
                )}

                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    A buffer of ±10–15% should be expected due to local price variations.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  )
}
