import { useState } from 'react'
import { IntakeForm } from './components/IntakeForm'
import { LoadingState } from './components/LoadingState'
import { ItineraryResponse } from './lib/api'
import './App.css'

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'result'>('form')
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null)

  const handleItineraryGenerated = (data: ItineraryResponse) => {
    setItinerary(data)
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
        <div className="container mx-auto p-4">
          <p className="text-center text-muted-foreground">
            Itinerary ready! (display component coming in Task 5)
          </p>
          <pre className="text-xs overflow-auto">{JSON.stringify(itinerary, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default App
