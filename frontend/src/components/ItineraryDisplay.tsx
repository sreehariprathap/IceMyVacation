import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
      onUpdate(v) { node.textContent = formatCurrency(v, currency) },
    })
    return () => controls.stop()
  }, [value, currency])
  return <span ref={ref}>{formatCurrency(0, currency)}</span>
}

const ACTIVITY_EMOJIS: Record<string, string> = {
  default: '📍',
  food: '🍽️',
  temple: '🛕',
  beach: '🏖️',
  museum: '🏛️',
  market: '🛍️',
  hotel: '🏨',
  transport: '🚌',
}

function activityEmoji(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('food') || t.includes('eat') || t.includes('restaurant') || t.includes('dinner') || t.includes('lunch') || t.includes('breakfast')) return ACTIVITY_EMOJIS.food
  if (t.includes('temple') || t.includes('wat') || t.includes('shrine')) return ACTIVITY_EMOJIS.temple
  if (t.includes('beach') || t.includes('coast') || t.includes('sea')) return ACTIVITY_EMOJIS.beach
  if (t.includes('museum') || t.includes('gallery')) return ACTIVITY_EMOJIS.museum
  if (t.includes('market') || t.includes('shop') || t.includes('mall')) return ACTIVITY_EMOJIS.market
  if (t.includes('hotel') || t.includes('check') || t.includes('resort')) return ACTIVITY_EMOJIS.hotel
  return ACTIVITY_EMOJIS.default
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
    { label: 'Accommodation', emoji: '🏨', amount: budget_breakdown.accommodation },
    { label: 'Food', emoji: '🍽️', amount: budget_breakdown.food },
    { label: 'Activities', emoji: '🎯', amount: budget_breakdown.activities },
    { label: 'Transport', emoji: '🚌', amount: budget_breakdown.transport },
  ]

  const isOverBudget = userBudget != null && total_estimated_cost > userBudget
  const isUnderBudget = userBudget != null && total_estimated_cost <= userBudget
  const totalColorClass = isOverBudget ? 'text-red-500' : isUnderBudget ? 'text-green-600' : 'text-primary'

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b-2 border-border px-4 py-3 flex items-center justify-between">
        <span className="font-fredoka text-2xl text-primary tracking-wide">🌴 IceMyVacation</span>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="ghost" size="sm" onClick={onStartOver}
            className="font-nunito font-semibold text-muted-foreground hover:text-foreground rounded-xl">
            Start Over
          </Button>
        </motion.div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page title */}
        <FadeUp className="mb-7">
          <h2 className="font-fredoka text-4xl text-foreground tracking-wide">
            🗺️ Your Itinerary
          </h2>
        </FadeUp>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: itinerary */}
          <div className="flex-1 min-w-0">
            {/* Day tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {days.map((day, idx) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(idx)}
                  className="relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-nunito font-semibold transition-colors"
                >
                  {selectedDay === idx && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 ${selectedDay === idx ? 'text-white' : 'text-muted-foreground'}`}>
                    Day {day.day}
                  </span>
                </button>
              ))}
            </div>

            {/* View on Map */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mb-5">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-fredoka tracking-wider rounded-2xl h-12 gap-2 text-base border-0 shadow-sm"
                onClick={onViewMap}>
                <Compass size={18} />
                View on Map
              </Button>
            </motion.div>

            {/* Date label */}
            {currentDay && (
              <FadeUp key={`date-${selectedDay}`} className="mb-5">
                <p className="text-sm text-muted-foreground font-nunito font-medium">
                  📅{' '}
                  {new Date(currentDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </FadeUp>
            )}

            {/* Activity cards */}
            <AnimatePresence mode="wait">
              <StaggerContainer key={`cards-${selectedDay}`} className="space-y-4">
                {currentDay?.activities.map((activity, idx) => (
                  <StaggerItem key={idx}>
                    <motion.div
                      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.09)' }}
                      className="bg-white border-2 border-border rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xl">{activityEmoji(activity.title)}</span>
                          <span className="bg-secondary text-secondary-foreground text-xs font-nunito font-semibold px-3 py-1 rounded-full">
                            {activity.time}
                          </span>
                          <h3 className="font-nunito font-bold text-base leading-tight text-foreground">
                            {activity.title}
                          </h3>
                        </div>
                        <span className="text-sm font-nunito font-bold text-primary whitespace-nowrap">
                          {formatCurrency(activity.estimated_cost, currency)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground font-nunito mb-2 leading-relaxed">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground font-nunito">
                        📍 {activity.location}
                      </p>
                      {activity.transport_note && (
                        <p className="text-xs text-muted-foreground font-nunito italic mt-1">
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
              <div className="bg-white border-2 border-border rounded-3xl p-6 shadow-sm">
                <h3 className="font-fredoka text-2xl text-foreground tracking-wide mb-5">
                  💰 Budget Overview
                </h3>
                <StaggerContainer className="space-y-4">
                  {budgetItems.map((item) => (
                    <StaggerItem key={item.label}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-nunito font-medium text-muted-foreground">
                          {item.emoji} {item.label}
                        </span>
                        <span className="text-sm font-nunito font-bold text-foreground">
                          <AnimatedNumber value={item.amount} currency={currency} />
                        </span>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <div className="border-t-2 border-border my-4" />

                <div className="flex items-center justify-between mb-2">
                  <span className="font-nunito font-bold text-sm text-foreground">Total Estimated</span>
                  <span className={`text-xl font-fredoka tracking-wide ${totalColorClass}`}>
                    <AnimatedNumber value={total_estimated_cost} currency={currency} />
                  </span>
                </div>

                {userBudget != null && userBudgetCurrency && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground font-nunito">Your Budget</span>
                    <span className="font-nunito font-semibold">{formatCurrency(userBudget, userBudgetCurrency)}</span>
                  </div>
                )}

                {isOverBudget && (
                  <div className="mt-3 bg-red-50 border-2 border-red-200 rounded-2xl px-3 py-2">
                    <p className="text-xs text-red-600 font-nunito font-semibold">
                      ⚠️ Over budget by {formatCurrency(total_estimated_cost - (userBudget ?? 0), currency)}
                    </p>
                  </div>
                )}
                {isUnderBudget && (
                  <div className="mt-3 bg-green-50 border-2 border-green-200 rounded-2xl px-3 py-2">
                    <p className="text-xs text-green-700 font-nunito font-semibold">
                      🎉 Saving {formatCurrency((userBudget ?? 0) - total_estimated_cost, currency)}!
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-accent/30 border-2 border-accent/50 px-3 py-2">
                  <p className="text-xs text-foreground/70 font-nunito leading-relaxed">
                    ℹ️ Expect ±10–15% variation due to local prices.
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
