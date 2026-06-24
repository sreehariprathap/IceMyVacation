# Task 6 Report: Google Maps View

## Status
DONE

## What Was Implemented

### 1. Installed @react-google-maps/api
Added the npm package to the frontend project.

### 2. Created `frontend/src/components/MapView.tsx`
Full-screen interactive map component with:
- **Day selector**: Horizontal scrollable pill buttons at the top center overlay showing "Day 1", "Day 2", etc. Selected day highlighted with primary color.
- **Full-screen GoogleMap**: Centers on average lat/lng of activities with coordinates for the selected day (fallback: Bangkok 13.7563, 100.5018).
- **Numbered markers**: Each activity with lat/lng gets a Google Maps Marker with a number label (1, 2, 3...).
- **Route polyline**: Blue polyline (strokeColor: '#3B82F6', strokeWeight: 3, strokeOpacity: 0.7) connecting all markers in order.
- **InfoWindow**: Clicking a marker shows an InfoWindow with activity title, time, and location.
- **Info panel (desktop)**: Fixed right panel (w-80) listing all day activities with number badge, time, location, cost. Clicking an activity highlights it on the map.
- **Info panel (mobile)**: Bottom sheet (h-64, scrollable) with compact activity list.
- **Loading state**: Centered spinner while Google Maps JS loads.
- **Error/no-key state**: Friendly message prompting user to add VITE_GOOGLE_MAPS_KEY to .env.
- **Back button**: Top-left overlay button returning to the itinerary result view.

### 3. Updated `frontend/src/App.tsx`
- Imported MapView component.
- Replaced the 'map' view placeholder with `<MapView itinerary={itinerary} onBack={() => setView('result')} />`.

## TypeScript
Zero errors from `npx tsc --noEmit`.

## Files Changed
- `/Users/sreehariprathap/Documents/Projects/IceMyVacation/frontend/src/components/MapView.tsx` (new)
- `/Users/sreehariprathap/Documents/Projects/IceMyVacation/frontend/src/App.tsx` (updated)
- `package.json` / `package-lock.json` — added @react-google-maps/api

## Configuration Required
Add `VITE_GOOGLE_MAPS_KEY=<your_key>` to `frontend/.env` to enable the map.
