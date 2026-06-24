import json
import re
import os
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


# ── Request / Response models ────────────────────────────────────────────────

class ItineraryRequest(BaseModel):
    name: str
    email: str
    start_date: str          # ISO date, e.g. "2025-03-01"
    end_date: str            # ISO date, e.g. "2025-03-07"
    destination: str
    hotel: str = ""
    num_people: int = 1
    transport_mode: str = "public_transit"  # car | public_transit | flight | mixed
    budget: Optional[float] = None
    budget_currency: str = "USD"


class Activity(BaseModel):
    time: str
    title: str
    description: str
    location: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    estimated_cost: float
    transport_note: str = ""


class Day(BaseModel):
    day: int
    date: str
    activities: List[Activity]


class BudgetBreakdown(BaseModel):
    accommodation: float
    food: float
    activities: float
    transport: float


class ItineraryResponse(BaseModel):
    days: List[Day]
    budget_breakdown: BudgetBreakdown
    total_estimated_cost: float
    currency: str


# ── Transport prompt snippets ────────────────────────────────────────────────

TRANSPORT_HINTS: Dict[str, str] = {
    "car": (
        "The traveller is using a CAR. Include driving routes between each activity, "
        "estimated drive times, parking tips, scenic road-trip stops, and fuel/toll notes."
    ),
    "public_transit": (
        "The traveller is using PUBLIC TRANSIT (bus, metro, train). Include specific "
        "bus/metro/train route numbers where known, estimated journey times, "
        "recommended transit cards, and the nearest station/stop for each location."
    ),
    "flight": (
        "The traveller's primary long-distance mode is FLIGHT. Include airport transfer "
        "details (taxi, shuttle, or rail), check-in/security buffer times, terminal info "
        "where relevant, and local transport from the airport."
    ),
    "mixed": (
        "The traveller uses a MIX of transport modes. Choose the most practical mode "
        "per leg: flights for long distances, trains/metro for medium distances, and "
        "walking/taxi for short hops. State the mode for each activity."
    ),
}

DEFAULT_TRANSPORT_HINT = TRANSPORT_HINTS["public_transit"]


# ── Helper: build prompts ────────────────────────────────────────────────────

def _build_system_prompt() -> str:
    return (
        "You are an expert travel planner. When given travel details you respond with "
        "a detailed, day-by-day vacation itinerary as **valid JSON only** — no markdown, "
        "no prose, no code fences. The JSON must exactly match the schema provided by the user."
    )


def _build_user_prompt(req: ItineraryRequest) -> str:
    transport_hint = TRANSPORT_HINTS.get(req.transport_mode, DEFAULT_TRANSPORT_HINT)

    budget_line = (
        f"Total budget: {req.budget} {req.budget_currency}."
        if req.budget is not None
        else "No strict budget specified; estimate realistic costs."
    )

    schema = """
{
  "days": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity title",
          "description": "Detailed description",
          "location": "Place name, City",
          "lat": 13.7563,
          "lng": 100.5018,
          "estimated_cost": 15.0,
          "transport_note": "Take BTS Skytrain to Siam station"
        }
      ]
    }
  ],
  "budget_breakdown": {
    "accommodation": 0.0,
    "food": 0.0,
    "activities": 0.0,
    "transport": 0.0
  },
  "total_estimated_cost": 0.0,
  "currency": "USD"
}
"""

    return f"""Plan a vacation itinerary with the following details:

Traveller name: {req.name}
Destination: {req.destination}
Hotel / Accommodation: {req.hotel or "Not specified"}
Start date: {req.start_date}
End date: {req.end_date}
Number of people: {req.num_people}
Transport mode: {req.transport_mode}
{budget_line}
Output currency: {req.budget_currency}

Transport guidance: {transport_hint}

Requirements:
- Create one entry per day between start_date and end_date (inclusive).
- Each day should have at least 3 activities: morning (e.g. 08:00-10:00), afternoon (e.g. 13:00-15:00), and evening (e.g. 18:00-20:00).
- Provide realistic lat/lng coordinates for every location.
- estimated_cost is per-person in {req.budget_currency}.
- transport_note must reflect the chosen transport mode ({req.transport_mode}).
- budget_breakdown totals should equal total_estimated_cost (for {req.num_people} people).
- currency field must be "{req.budget_currency}".

Respond with ONLY valid JSON matching this schema exactly:
{schema}
"""


# ── Helper: strip markdown fences ────────────────────────────────────────────

def _strip_fences(text: str) -> str:
    # Remove ```json ... ``` or ``` ... ```
    text = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text.strip())
    return text.strip()


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/itinerary", response_model=ItineraryResponse)
async def create_itinerary(req: ItineraryRequest) -> ItineraryResponse:
    api_key = os.environ.get("DEEPSEEK_API_KEY", "")

    if not api_key:
        raise HTTPException(
            status_code=502,
            detail="DeepSeek API key not configured. Set DEEPSEEK_API_KEY in environment.",
        )

    try:
        from openai import OpenAI
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="openai package is not installed. Run: pip install openai",
        )

    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com/v1")
    system_prompt = _build_system_prompt()
    user_prompt = _build_user_prompt(req)

    raw_text: str = ""

    # Try streaming first, fall back to non-streaming
    try:
        stream = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            stream=True,
        )
        chunks: List[str] = []
        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                chunks.append(delta.content)
        raw_text = "".join(chunks)
    except Exception:
        # Fall back to non-streaming
        try:
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                stream=False,
            )
            raw_text = response.choices[0].message.content or ""
        except Exception as non_stream_err:
            raise HTTPException(
                status_code=502,
                detail=f"DeepSeek API call failed: {non_stream_err}",
            )

    if not raw_text:
        raise HTTPException(status_code=502, detail="DeepSeek returned an empty response.")

    # Parse JSON
    cleaned = _strip_fences(raw_text)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse itinerary JSON from DeepSeek response: {e}. Raw: {cleaned[:500]}",
        )

    try:
        return ItineraryResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Itinerary response did not match expected schema: {e}",
        )
