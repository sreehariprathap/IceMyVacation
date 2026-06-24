from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

router = APIRouter()


@router.get("/currency")
async def get_exchange_rate(
    from_currency: str = Query(..., alias="from"),
    to_currency: str = Query(..., alias="to"),
) -> dict:
    """Return the exchange rate from one currency to another.

    Uses the free frankfurter.app API (no key required).
    """
    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    # Same currency → rate is 1.0
    if from_currency == to_currency:
        return {"from": from_currency, "to": to_currency, "rate": 1.0}

    try:
        import httpx
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="httpx package is not installed. Run: pip install httpx",
        )

    url = f"https://api.frankfurter.app/latest?from={from_currency}&to={to_currency}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Currency API returned an error: {e.response.status_code} — {e.response.text}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch exchange rate: {e}",
        )

    rates = data.get("rates", {})
    rate = rates.get(to_currency)

    if rate is None:
        raise HTTPException(
            status_code=502,
            detail=f"Rate for '{to_currency}' not found in API response. Available: {list(rates.keys())}",
        )

    return {"from": from_currency, "to": to_currency, "rate": rate}
