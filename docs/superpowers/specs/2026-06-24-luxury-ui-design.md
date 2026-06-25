# IceMyVacation — Luxury UI Redesign Spec
**Date:** 2026-06-24  
**Approach:** Option B — Design Token Skin + framer-motion Layer  
**Palette:** Cream & Champagne  
**Motion:** Fluid & Sculptural  

---

## 1. Goals

Transform the existing ShadCN-default UI into a premium, luxury travel experience without touching API integration logic. Every screen should feel like a high-end travel editorial — warm, breathing, unhurried.

## 2. Dependencies

- `framer-motion` — page transitions, stagger reveals, hover microinteractions
- `Playfair Display` — Google Fonts serif for display headings
- Existing `hero.png` asset used as the intake form background

No other new dependencies. ShadCN primitives (Button, Card, Input, Select, Label, Badge) are kept as structural foundation.

## 3. Design Tokens

Replace CSS variables in `src/index.css`:

| Token | Light value | Purpose |
|---|---|---|
| `--background` | `#FAF8F4` (warm off-white) | Page backgrounds |
| `--foreground` | `#1A1714` (warm near-black) | Body text |
| `--primary` | `#C9956A` (rose gold) | CTA buttons, active states, focus rings |
| `--primary-foreground` | `#FFFDF9` | Text on primary |
| `--secondary` | `#EDE6D8` | Secondary button fills |
| `--secondary-foreground` | `#4A3F35` | Text on secondary |
| `--muted` | `#F0ECE4` | Subtle fills |
| `--muted-foreground` | `#8B7D6B` | Placeholder, secondary text |
| `--card` | `#FFFDF9` | Card backgrounds |
| `--card-foreground` | `#1A1714` | Card text |
| `--border` | `#E5DDD3` | Borders, dividers |
| `--input` | `#E5DDD3` | Input borders |
| `--ring` | `#C9956A` | Focus ring |
| `--radius` | `0.75rem` | Slightly rounder corners |

Dark mode: not in scope for this iteration.

## 4. Typography

Add to `index.html` `<head>`:
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
```

Usage:
- Display headings (app name, page titles): `font-family: 'Playfair Display', serif`
- Body, labels, UI text: `font-family: 'Inter', sans-serif`
- Add Tailwind `fontFamily` extension in `tailwind.config.js`

## 5. Motion System

Install: `npm install framer-motion`

### 5a. Page Transitions

`App.tsx` wraps view-switching with `<AnimatePresence mode="wait">`. Each view component wrapped in a `<motion.div>` with:
- Enter: `opacity: 0→1`, `y: 16→0`, duration `0.45s`, ease `[0.25, 0.1, 0.25, 1]`
- Exit: `opacity: 1→0`, `y: 0→-8`, duration `0.3s`

### 5b. Reusable Motion Primitives

Create `src/components/motion.tsx` with:

**`<FadeUp delay? scale?>`** — single element fade-up on mount. Used for headings, form sections.  
**`<StaggerContainer>`** — `motion.div` with `staggerChildren: 0.06`, `delayChildren: 0.1`. Wraps lists of cards.  
**`<StaggerItem>`** — child of StaggerContainer. `opacity: 0→1`, `y: 20→0`, spring `{ stiffness: 300, damping: 30 }`.

### 5c. Microinteractions

Activity cards and budget rows: `whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}`, spring physics.  
Buttons: `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`.  
Day tab pills: `layoutId="activeTab"` shared layout animation — the active indicator slides between tabs.

## 6. Screen Designs

### 6a. Intake Form (`IntakeForm.tsx`)

**Layout:**
- Full viewport: `hero.png` as `object-cover` background image
- Gradient overlay: `linear-gradient(to top, rgba(26,23,20,0.7) 0%, transparent 60%)` for readability
- Centered scrollable column with the form card on top

**Hero text (above card):**
- App name: `Playfair Display`, italic, `text-5xl`, white, letter-spacing tight
- Tagline: Inter 300, `text-lg`, `text-white/70`
- FadeUp animation on mount

**Form card:**
- `bg-white/10 backdrop-blur-xl border border-white/20` — glass morphism
- Text inside card: white/near-white (since on dark hero)
- Section headers: Inter 500, uppercase, `text-white/50`, thinner border
- Inputs: `bg-white/10 border-white/30 text-white placeholder:text-white/40`
- Focus ring: rose-gold `ring-[#C9956A]`
- Submit button: solid rose-gold `bg-[#C9956A]` with white text, full width, spring scale

**Animation:**
- Card enters with FadeUp (delay 0.2s after hero text)
- Form sections stagger in after card enters

### 6b. Loading State (`LoadingState.tsx`)

**Layout:** Warm cream background (`bg-[#FAF8F4]`), full screen centered column

**Content:**
- Three dots in rose-gold, stagger-pulse animation (each dot scales 1→1.4→1 with 0.15s offset)
- Heading: Playfair Display italic `text-3xl` — "Crafting your journey…"
- Below: cycling travel words fade in/out with `AnimatePresence` — *"Temples"*, *"Sunsets"*, *"Adventures"*, *"Hidden gems"* — one word every 1.8s

**No spinner** — replace `Loader2` entirely.

### 6c. Itinerary Display (`ItineraryDisplay.tsx`)

**Header:** Sticky, `bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#E5DDD3]`
- App name: Playfair Display, `text-xl`
- "Start Over" button: ghost with warm text

**Page title:** Playfair Display italic `text-3xl`, "Your Itinerary"

**Day tabs:**
- Horizontal scroll pill row
- Active tab: `bg-[#C9956A] text-white` with `layoutId="activeTab"` shared layout (smooth slide)
- Inactive: `bg-[#F0ECE4] text-[#8B7D6B]`

**"View on Map" button:** Rose-gold fill, compass icon (Lucide `Compass`), full width

**Activity cards:**
- Warm card `bg-[#FFFDF9]`, border `border-[#E5DDD3]`, rounded-xl
- When `selectedDay` changes: StaggerContainer with StaggerItem children — cards cascade in
- `AnimatePresence` on the card list so old cards exit before new ones enter
- Hover lift microinteraction
- Time badge: cream `bg-[#EDE6D8] text-[#4A3F35]`, pill shape
- Cost: rose-gold text
- Location and transport note: muted warm gray

**Budget panel (sidebar):**
- Card header in Playfair Display
- Budget rows: FadeUp stagger on mount
- Total: large, rose-gold if under budget, red if over
- Numbers animate in from 0 using framer-motion `useSpring` + `useTransform` on mount

### 6d. Map View (`MapView.tsx`)

**Back button:** Glass treatment `bg-[#FAF8F4]/80 backdrop-blur-sm`, warm border
**Day selector:** Same pill style as itinerary tabs, glass background
**Side panel (desktop):** `bg-[#FAF8F4]/95 backdrop-blur-md`, panel header in Playfair Display
**Activity list items:** FadeUp stagger on panel mount; hover lift
**Mobile bottom sheet:** Same warm glass treatment

## 7. File Changes Summary

| File | Change |
|---|---|
| `index.html` | Add Google Fonts link |
| `src/index.css` | Replace all CSS variables with cream/champagne tokens |
| `tailwind.config.js` | Add `fontFamily` extension (playfair, inter) |
| `src/components/motion.tsx` | New — FadeUp, StaggerContainer, StaggerItem primitives |
| `src/App.tsx` | Wrap views in AnimatePresence + PageTransition |
| `src/components/IntakeForm.tsx` | Full-bleed hero, glass card, luxury typography |
| `src/components/LoadingState.tsx` | Dot pulse + word cycling animation |
| `src/components/ItineraryDisplay.tsx` | Token updates, stagger cards, shared tab layout, budget spring |
| `src/components/MapView.tsx` | Glass overlay panels, Playfair header, stagger list |

## 8. Out of Scope

- Dark mode
- Backend changes
- Map tile styling (would require Mapbox)
- Mobile bottom sheet spring-drag gesture

## 9. Success Criteria

- Build passes with zero TypeScript errors
- All four screens load and function identically to current (no logic regression)
- Page transitions play on every view switch
- Activity cards stagger in when day changes
- Hero image covers full screen on intake form
- Loading state has no spinner — uses dot pulse + word cycle
