import { useState } from 'react'
import { IntakeForm } from './components/IntakeForm'
import { LoadingState } from './components/LoadingState'
import { ItineraryDisplay } from './components/ItineraryDisplay'
import { ItineraryResponse } from './lib/api'
import './App.css'

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'result' | 'map'>('form')
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)
  const [userBudget, setUserBudget] = useState<number | null>(null)
  const [userBudgetCurrency, setUserBudgetCurrency] = useState<string>('USD')

  const handleItineraryGenerated = (
    data: ItineraryResponse,
    budget?: number,
    budgetCurrency?: string,
  ) => {
    setItinerary(data)
    setUserBudget(budget ?? null)
    setUserBudgetCurrency(budgetCurrency ?? 'USD')
    setView('result')
  }

  const handleFormSubmit = () => {
    setView('loading')
  }

  return (
    <div className="min-h-screen bg-background">
      {view === 'form' && (
        <IntakeForm
          onItineraryGenerated={handleItineraryGenerated}
          onSubmitting={handleFormSubmit}
        />
      )}
      {view === 'loading' && <LoadingState />}
      {view === 'result' && itinerary && (
        <ItineraryDisplay
          itinerary={itinerary}
          userBudget={userBudget}
          userBudgetCurrency={userBudgetCurrency}
          onViewMap={() => setView('map')}
          onStartOver={() => {
            setItinerary(null)
            setView('form')
          }}
        />
      )}
      {view === 'map' && (
        <div className="container mx-auto p-4">
          <p className="text-center text-muted-foreground">
            Map view coming in Task 6.
          </p>
          <div className="text-center mt-4">
            <button
              className="text-sm underline text-muted-foreground"
              onClick={() => setView('result')}
            >
              Back to itinerary
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
