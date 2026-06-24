import { useState, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react'
import { ItineraryResponse, Activity } from '@/lib/api'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || ''

const mapContainerStyle = { width: '100%', height: '100%' }

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 }

interface MapViewProps {
  itinerary: ItineraryResponse
  onBack: () => void
}

export function MapView({ itinerary, onBack }: MapViewProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [, setMap] = useState<google.maps.Map | null>(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onMapUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center max-w-md p-8">
          <MapPin className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h2 className="text-xl font-semibold mb-2">Maps Not Configured</h2>
          <p className="text-muted-foreground mb-6">
            Google Maps API key not configured. Add VITE_GOOGLE_MAPS_KEY to your .env file.
          </p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft size={16} className="mr-2" />
            Back to Itinerary
          </Button>
        </div>
      </div>
    )
  }

  const currentDay = itinerary.days[selectedDay]
  const activitiesWithCoords = currentDay?.activities.filter(
    (a) => a.lat !== undefined && a.lng !== undefined,
  ) ?? []

  const mapCenter =
    activitiesWithCoords.length > 0
      ? {
          lat:
            activitiesWithCoords.reduce((sum, a) => sum + (a.lat ?? 0), 0) /
            activitiesWithCoords.length,
          lng:
            activitiesWithCoords.reduce((sum, a) => sum + (a.lng ?? 0), 0) /
            activitiesWithCoords.length,
        }
      : DEFAULT_CENTER

  const polylinePath = activitiesWithCoords.map((a) => ({
    lat: a.lat as number,
    lng: a.lng as number,
  }))

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Back button - top left overlay */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={onBack}
          variant="secondary"
          size="sm"
          className="shadow-md bg-background/90 backdrop-blur-sm"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Itinerary
        </Button>
      </div>

      {/* Day selector - top center overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 max-w-xs md:max-w-lg">
        <div className="flex gap-2 overflow-x-auto pb-1 px-2 scrollbar-hide bg-background/90 backdrop-blur-sm rounded-full shadow-md px-3 py-2">
          {itinerary.days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDay(idx)
                setSelectedActivity(null)
              }}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDay === idx
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Map - full screen */}
      {!isLoaded ? (
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={13}
          options={mapOptions}
          onLoad={onMapLoad}
          onUnmount={onMapUnmount}
        >
          {/* Polyline connecting markers */}
          {polylinePath.length > 1 && (
            <Polyline
              path={polylinePath}
              options={{
                strokeColor: '#3B82F6',
                strokeWeight: 3,
                strokeOpacity: 0.7,
              }}
            />
          )}

          {/* Markers */}
          {currentDay?.activities.map((activity, idx) => {
            if (activity.lat === undefined || activity.lng === undefined) return null
            return (
              <Marker
                key={idx}
                position={{ lat: activity.lat, lng: activity.lng }}
                label={{ text: String(idx + 1), color: 'white', fontWeight: 'bold' }}
                onClick={() => setSelectedActivity(activity)}
              />
            )
          })}

          {/* InfoWindow for selected activity */}
          {selectedActivity &&
            selectedActivity.lat !== undefined &&
            selectedActivity.lng !== undefined && (
              <InfoWindow
                position={{ lat: selectedActivity.lat, lng: selectedActivity.lng }}
                onCloseClick={() => setSelectedActivity(null)}
              >
                <div className="max-w-xs p-1">
                  <h3 className="font-semibold text-sm mb-1">{selectedActivity.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Clock size={10} />
                    <span>{selectedActivity.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin size={10} />
                    <span>{selectedActivity.location}</span>
                  </div>
                </div>
              </InfoWindow>
            )}
        </GoogleMap>
      )}

      {/* Info panel - right on desktop, bottom sheet on mobile */}
      {/* Desktop: right panel */}
      <div className="hidden md:flex absolute top-0 right-0 h-full w-80 bg-background/95 backdrop-blur-sm shadow-xl flex-col z-10">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">
            Day {currentDay?.day}
          </h2>
          <p className="text-sm text-muted-foreground">{currentDay?.date}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentDay?.activities.map((activity, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedActivity(activity)}
              className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted ${
                selectedActivity === activity ? 'bg-muted border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge
                  variant="default"
                  className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs"
                >
                  {idx + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-tight">{activity.title}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock size={10} />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <MapPin size={10} />
                    <span className="truncate">{activity.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                    <DollarSign size={10} />
                    <span>
                      {activity.estimated_cost} {itinerary.currency}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-64 bg-background/95 backdrop-blur-sm shadow-t-xl border-t z-10 overflow-y-auto">
        <div className="p-3 border-b sticky top-0 bg-background/95">
          <h2 className="font-semibold text-sm">
            Day {currentDay?.day} — {currentDay?.date}
          </h2>
        </div>
        <div className="p-3 space-y-2">
          {currentDay?.activities.map((activity, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedActivity(activity)}
              className={`w-full text-left p-2 rounded-lg border transition-colors hover:bg-muted ${
                selectedActivity === activity ? 'bg-muted border-primary' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center p-0 text-xs"
                >
                  {idx + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs leading-tight">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {activity.time}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <DollarSign size={9} />
                      {activity.estimated_cost} {itinerary.currency}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
