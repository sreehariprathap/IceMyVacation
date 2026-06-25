import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { ItineraryResponse, Activity } from '@/lib/api'

// Fix Leaflet default icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER: [number, number] = [13.7563, 100.5018]

function createNumberedIcon(num: number) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#C9956A;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

interface MapViewProps {
  itinerary: ItineraryResponse
  onBack: () => void
}

export function MapView({ itinerary, onBack }: MapViewProps) {
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const markerRefs = useRef<Record<number, L.Marker>>({})

  const currentDay = itinerary.days[selectedDay]
  const activitiesWithCoords =
    currentDay?.activities.filter((a) => a.lat !== undefined && a.lng !== undefined) ?? []

  const mapCenter: [number, number] =
    activitiesWithCoords.length > 0
      ? [
          activitiesWithCoords.reduce((sum, a) => sum + (a.lat ?? 0), 0) /
            activitiesWithCoords.length,
          activitiesWithCoords.reduce((sum, a) => sum + (a.lng ?? 0), 0) /
            activitiesWithCoords.length,
        ]
      : DEFAULT_CENTER

  const polylinePath: [number, number][] = activitiesWithCoords.map((a) => [
    a.lat as number,
    a.lng as number,
  ])

  function handleActivityClick(activity: Activity, idx: number) {
    setSelectedActivity(activity)
    const marker = markerRefs.current[idx]
    if (marker) marker.openPopup()
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Back button */}
      <div className="absolute top-4 left-4 z-[1000]">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onBack}
            variant="secondary"
            size="sm"
            className="shadow-md bg-[#FAF8F4]/90 backdrop-blur-sm border border-[#E5DDD3] text-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Itinerary
          </Button>
        </motion.div>
      </div>

      {/* Day selector */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] max-w-xs md:max-w-lg">
        <div className="flex gap-2 overflow-x-auto pb-1 px-3 py-2 scrollbar-hide bg-[#FAF8F4]/90 backdrop-blur-sm rounded-full shadow-md">
          {itinerary.days.map((day, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDay(idx)
                setSelectedActivity(null)
              }}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDay === idx
                  ? 'bg-[#C9956A] text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={mapCenter} />

        {polylinePath.length > 1 && (
          <Polyline positions={polylinePath} color="#C9956A" weight={3} opacity={0.8} />
        )}

        {currentDay?.activities.map((activity, idx) => {
          if (activity.lat === undefined || activity.lng === undefined) return null
          return (
            <Marker
              key={idx}
              position={[activity.lat, activity.lng]}
              icon={createNumberedIcon(idx + 1)}
              ref={(ref) => {
                if (ref) markerRefs.current[idx] = ref
              }}
            >
              <Popup>
                <div className="max-w-xs p-1">
                  <h3 className="font-semibold text-sm mb-1">{activity.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                    <Clock size={10} />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin size={10} />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Desktop: right panel */}
      <div className="hidden md:flex absolute top-0 right-0 h-full w-80 bg-[#FAF8F4]/95 backdrop-blur-md shadow-xl border-l border-[#E5DDD3] flex-col z-[1000]">
        <div className="p-4 border-b border-[#E5DDD3]">
          <h2 className="font-playfair italic text-xl text-foreground">
            Day {currentDay?.day}
          </h2>
          <p className="text-sm text-muted-foreground">{currentDay?.date}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <StaggerContainer className="space-y-3">
            {currentDay?.activities.map((activity, idx) => (
              <StaggerItem key={idx}>
                <motion.button
                  whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  onClick={() => handleActivityClick(activity, idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors hover:bg-muted ${
                    selectedActivity === activity
                      ? 'bg-muted border-[#C9956A]'
                      : 'border-[#E5DDD3] bg-card'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center p-0 text-xs bg-[#C9956A] text-white border-0">
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
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-[#C9956A]">
                        <DollarSign size={10} />
                        <span>
                          {activity.estimated_cost} {itinerary.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="md:hidden absolute bottom-0 left-0 right-0 h-64 bg-[#FAF8F4]/95 backdrop-blur-md border-t border-[#E5DDD3] z-[1000] overflow-y-auto">
        <div className="p-3 border-b border-[#E5DDD3] sticky top-0 bg-[#FAF8F4]/95">
          <h2 className="font-playfair italic text-sm text-foreground">
            Day {currentDay?.day} — {currentDay?.date}
          </h2>
        </div>
        <div className="p-3 space-y-2">
          {currentDay?.activities.map((activity, idx) => (
            <button
              key={idx}
              onClick={() => handleActivityClick(activity, idx)}
              className={`w-full text-left p-2 rounded-xl border transition-colors hover:bg-muted ${
                selectedActivity === activity
                  ? 'bg-muted border-[#C9956A]'
                  : 'border-[#E5DDD3] bg-card'
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center p-0 text-xs bg-[#C9956A] text-white border-0">
                  {idx + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs leading-tight">{activity.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Clock size={9} />
                      {activity.time}
                    </span>
                    <span className="flex items-center gap-0.5 text-[#C9956A]">
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
