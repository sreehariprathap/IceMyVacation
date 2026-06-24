from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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


@app.get("/health")
def health():
    return {"status": "ok", "service": "IceMyVacation API"}
