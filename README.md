# IceMyVacation

AI-powered vacation itinerary planner. Enter your trip details and get a day-by-day itinerary with map view and budget analysis.

## Features

- **AI Itinerary Generation** — DeepSeek AI creates personalized day-by-day plans
- **Transport-aware Planning** — Tailored advice for car, public transit, flight, or mixed travel
- **Budget Analysis** — Breakdown with currency conversion and budget comparison
- **Interactive Map** — Google Maps view with route visualization
- **Mobile-first Design** — Works great on phones and desktops

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + ShadCN UI
- **Backend**: Python FastAPI
- **AI**: DeepSeek API (OpenAI-compatible)
- **Maps**: Google Maps API
- **Deployment**: Vercel (frontend) + Render (backend)

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.9+
- API keys (see below)

### Getting API Keys

**DeepSeek API Key:**
1. Go to https://platform.deepseek.com
2. Sign up / log in
3. Navigate to API Keys and create a new key
4. Copy the key

**Google Maps API Key:**
1. Go to https://console.cloud.google.com
2. Create or select a project
3. Enable these APIs: Maps JavaScript API, Directions API
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key to your domains for production

**Exchange Rate API:**
No key needed — uses https://api.frankfurter.app (free, no auth)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and add your API keys

python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload
# API runs at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:8000
#   VITE_GOOGLE_MAPS_KEY=your_google_maps_api_key

npm install
npm run dev
# App runs at http://localhost:5173
```

## Deployment

### Deploy Backend to Render

1. Push this repo to GitHub
2. Go to https://render.com and create a new Web Service
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — review and confirm settings
5. Add environment variables in Render dashboard:
   - `DEEPSEEK_API_KEY`
   - `GOOGLE_MAPS_API_KEY`
   - `FRONTEND_URL` (your Vercel URL, e.g. `https://icemyvacation.vercel.app`)
6. Deploy — your API will be at `https://icemyvacation-api.onrender.com`

### Deploy Frontend to Vercel

1. Go to https://vercel.com and import your GitHub repo
2. Vercel detects `vercel.json` automatically
3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL` = your Render backend URL
   - `VITE_GOOGLE_MAPS_KEY` = your Google Maps API key
4. Deploy — your app will be at `https://icemyvacation.vercel.app` (or your custom domain)

## Project Structure

```
IceMyVacation/
├── backend/
│   ├── main.py              # FastAPI app, CORS, settings
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   └── routers/
│       ├── itinerary.py     # POST /api/itinerary
│       └── currency.py      # GET /api/currency
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # ShadCN UI components
│   │   │   ├── IntakeForm.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ItineraryDisplay.tsx
│   │   │   └── MapView.tsx
│   │   ├── lib/
│   │   │   ├── api.ts       # API client + TypeScript types
│   │   │   └── utils.ts     # cn() helper
│   │   └── App.tsx
│   ├── .env.example
│   └── vite.config.ts
├── render.yaml              # Render deployment config
├── vercel.json              # Vercel deployment config
└── README.md
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/itinerary | Generate AI itinerary |
| GET | /api/currency?from=USD&to=THB | Exchange rate lookup |

## Environment Variables

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| DEEPSEEK_API_KEY | Yes | DeepSeek API key |
| GOOGLE_MAPS_API_KEY | No | Google Maps API key |
| FRONTEND_URL | Yes | Frontend URL for CORS |

### Frontend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | Yes | Backend API URL |
| VITE_GOOGLE_MAPS_KEY | Yes | Google Maps API key |

## License

MIT
