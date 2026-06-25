import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { IntakeForm } from './components/IntakeForm'
import type { TripMeta } from './components/IntakeForm'
import { LoadingState } from './components/LoadingState'
import { ItineraryDisplay } from './components/ItineraryDisplay'
import { MapView } from './components/MapView'
import { PageTransition } from './components/motion'
import type { ItineraryResponse } from './lib/api'
import './App.css'

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'result' | 'map'>('form')
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)
  const [userBudget, setUserBudget] = useState<number | null>(null)
  const [userBudgetCurrency, setUserBudgetCurrency] = useState<string>('USD')
  const [tripMeta, setTripMeta] = useState<TripMeta | null>(null)

  const handleItineraryGenerated = (
    data: ItineraryResponse,
    budget?: number,
    budgetCurrency?: string,
    meta?: TripMeta,
  ) => {
    setItinerary(data)
    setUserBudget(budget ?? null)
    setUserBudgetCurrency(budgetCurrency ?? 'USD')
    if (meta) setTripMeta(meta)
    setView('result')
  }

  const handleFormSubmit = () => {
    setView('loading')
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'form' && (
          <PageTransition key="form">
            <IntakeForm
              onItineraryGenerated={handleItineraryGenerated}
              onSubmitting={handleFormSubmit}
            />
          </PageTransition>
        )}
        {view === 'loading' && (
          <PageTransition key="loading">
            <LoadingState />
          </PageTransition>
        )}
        {view === 'result' && itinerary && (
          <PageTransition key="result">
            <ItineraryDisplay
              itinerary={itinerary}
              userBudget={userBudget}
              userBudgetCurrency={userBudgetCurrency}
              travelerName={tripMeta?.name}
              destination={tripMeta?.destination}
              startDate={tripMeta?.startDate}
              endDate={tripMeta?.endDate}
              numPeople={tripMeta?.numPeople}
              transportMode={tripMeta?.transportMode}
              onViewMap={() => setView('map')}
              onStartOver={() => {
                setItinerary(null)
                setView('form')
              }}
            />
          </PageTransition>
        )}
        {view === 'map' && itinerary && (
          <PageTransition key="map">
            <MapView
              itinerary={itinerary}
              onBack={() => setView('result')}
            />
          </PageTransition>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
