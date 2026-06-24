# Task 5 Report: Itinerary Display & Budget Analysis UI

## Status: DONE

## What was built

### New file: `frontend/src/components/ItineraryDisplay.tsx`
- Mobile-first layout with sticky header bar (app name + "Start Over" ghost button)
- Two-panel layout: stacked vertically on mobile, side-by-side (`lg:flex-row`) on large screens
- **Day-by-day section:**
  - Horizontal scrollable day selector tabs (primary variant for selected, outline for others)
  - Full-width "View on Map" button calling `onViewMap()`
  - Activity cards showing: time badge (secondary variant), title (bold text-lg), description (muted), location with 📍 icon, transport note with 🚌 icon (italic, conditional), estimated cost (formatted with Intl.NumberFormat)
- **Budget section (Card):**
  - Four breakdown rows: Accommodation, Food, Activities, Transport
  - Divider, then total estimated cost (green if under budget, red if over, neutral if no budget)
  - User's stated budget displayed if provided
  - Over/under budget delta shown
  - Amber disclaimer banner: "⚠️ Note: A buffer of ±10–15% should be expected due to local price variations."
- Currency formatting via `Intl.NumberFormat` with `itinerary.currency`

### Modified: `frontend/src/components/IntakeForm.tsx`
- Updated `onItineraryGenerated` callback signature to `(data: ItineraryResponse, budget?: number, budgetCurrency?: string) => void`
- Passes `payload.budget` and `payload.budget_currency` when calling the callback

### Modified: `frontend/src/App.tsx`
- Added `'map'` to view state type: `'form' | 'loading' | 'result' | 'map'`
- Added `userBudget: number | null` and `userBudgetCurrency: string` state
- `handleItineraryGenerated` now accepts and stores budget info
- Result view now renders `<ItineraryDisplay>` instead of raw JSON
- Map view shows placeholder with back link (Task 6 will implement it)

## Verification
- `npx tsc --noEmit` → zero errors
