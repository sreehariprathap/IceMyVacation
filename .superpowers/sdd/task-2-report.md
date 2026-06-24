# Task 2 Report: Backend API Endpoints

## Status: DONE

## Files Modified

- `backend/routers/itinerary.py` — Implemented `POST /itinerary` endpoint
- `backend/routers/currency.py` — Implemented `GET /currency` endpoint

## Implementation Summary

### itinerary.py

**Pydantic models implemented:**
- `ItineraryRequest` — input with name, email, dates, destination, hotel, num_people, transport_mode, budget, budget_currency
- `Activity`, `Day`, `BudgetBreakdown`, `ItineraryResponse` — structured response models
- Used `Optional[float]` and `List[...]` from `typing` (Python 3.9 compatibility — `X | None` and `list[X]` syntax not valid in 3.9 Pydantic models)

**DeepSeek integration:**
- Uses `openai` SDK with `base_url="https://api.deepseek.com/v1"` and model `deepseek-chat`
- API key read from `DEEPSEEK_API_KEY` environment variable
- Transport-aware prompting: separate hint strings for `car`, `public_transit`, `flight`, `mixed`; defaults to `public_transit`
- Tries streaming (`stream=True`) first; falls back to non-streaming on any exception
- JSON fences (`\`\`\`json ... \`\`\``) stripped before parsing
- Returns `ItineraryResponse` validated via Pydantic

**Error handling:**
- Missing API key → 502
- DeepSeek call failure → 502
- JSON parse failure → 500
- Schema mismatch → 500

### currency.py

**Endpoint:** `GET /currency?from=USD&to=THB`
- Query params use `alias` (`from`, `to`) to match URL convention while avoiding Python keyword conflict
- Same-currency shortcut returns `rate: 1.0` immediately
- Calls `https://api.frankfurter.app/latest?from=X&to=Y` via `httpx.AsyncClient`
- Returns `{"from": "USD", "to": "THB", "rate": 35.5}`
- HTTP errors → 502

## Verification

```
Routers import OK
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8001 (Press CTRL+C to quit)
```

Both checks passed.

## Python 3.9 Compatibility Note

The runtime is Python 3.9. The `X | None` union shorthand and bare `list[X]` in Pydantic model class bodies are only valid in 3.10+. All models use `Optional[X]` and `List[X]` from `typing` instead.
