const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ItineraryRequest {
  name: string
  email: string
  start_date: string
  end_date: string
  destination: string
  hotel?: string
  num_people: number
  transport_mode: string
  budget?: number
  budget_currency: string
}

export interface Activity {
  time: string
  title: string
  description: string
  location: string
  lat?: number
  lng?: number
  estimated_cost: number
  transport_note?: string
}

export interface Day {
  day: number
  date: string
  activities: Activity[]
}

export interface BudgetBreakdown {
  accommodation: number
  food: number
  activities: number
  transport: number
}

export interface ItineraryResponse {
  days: Day[]
  budget_breakdown: BudgetBreakdown
  total_estimated_cost: number
  currency: string
}

export async function generateItinerary(data: ItineraryRequest): Promise<ItineraryResponse> {
  const response = await fetch(`${API_URL}/api/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Failed to generate itinerary')
  }
  return response.json()
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1
  const response = await fetch(`${API_URL}/api/currency?from=${from}&to=${to}`)
  if (!response.ok) throw new Error('Failed to fetch exchange rate')
  const data = await response.json()
  return data.rate
}
