from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic_settings import BaseSettings, SettingsConfigDict

from routers.itinerary import router as itinerary_router
from routers.currency import router as currency_router


class Settings(BaseSettings):
    deepseek_api_key: str = ""
    google_maps_api_key: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

app = FastAPI(title="IceMyVacation API")

origins = list({settings.frontend_url, "http://localhost:5173"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(itinerary_router, prefix="/api")
app.include_router(currency_router, prefix="/api")


@app.get("/health", response_class=HTMLResponse)
def health():
    return HTMLResponse(content="""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IceMyVacation API</title>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0f7fa;
      font-family: 'Nunito', sans-serif;
    }
    .card {
      background: #fff;
      border-radius: 2rem;
      padding: 3rem 3.5rem;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
      max-width: 420px;
      width: 90%;
    }
    .pulse {
      font-size: 3.5rem;
      animation: pulse 1.8s ease-in-out infinite;
      display: inline-block;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.18); }
    }
    h1 {
      font-family: 'Fredoka One', cursive;
      font-size: 2rem;
      color: #F2633A;
      margin: 1rem 0 0.4rem;
    }
    .subtitle {
      color: #555;
      font-size: 1rem;
      margin-bottom: 1.8rem;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #e6f9f0;
      color: #1a7f4b;
      font-weight: 600;
      font-size: 0.95rem;
      border-radius: 999px;
      padding: 0.45rem 1.1rem;
      margin-bottom: 1.8rem;
    }
    .dot {
      width: 10px; height: 10px;
      background: #22c55e;
      border-radius: 50%;
      animation: blink 1.4s ease-in-out infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .endpoints {
      text-align: left;
      background: #f8f8f8;
      border-radius: 1rem;
      padding: 1rem 1.2rem;
      font-size: 0.88rem;
    }
    .endpoints p {
      font-weight: 700;
      color: #333;
      margin-bottom: 0.6rem;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.3rem 0;
      color: #444;
    }
    .method {
      font-size: 0.7rem;
      font-weight: 700;
      border-radius: 4px;
      padding: 2px 6px;
      min-width: 40px;
      text-align: center;
    }
    .get  { background: #dbeafe; color: #1d4ed8; }
    .post { background: #fef3c7; color: #92400e; }
    .path { font-family: monospace; font-size: 0.83rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="pulse">🌴</div>
    <h1>IceMyVacation API</h1>
    <p class="subtitle">Your vacation planning backend</p>
    <div class="badge">
      <span class="dot"></span>
      All systems operational
    </div>
    <div class="endpoints">
      <p>Available endpoints</p>
      <div class="endpoint"><span class="method get">GET</span><span class="path">/health</span></div>
      <div class="endpoint"><span class="method post">POST</span><span class="path">/api/itinerary</span></div>
      <div class="endpoint"><span class="method get">GET</span><span class="path">/api/currency</span></div>
      <div class="endpoint"><span class="method get">GET</span><span class="path">/docs</span></div>
    </div>
  </div>
</body>
</html>""", status_code=200)
