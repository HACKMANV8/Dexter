from fastapi import APIRouter, Query
from services.fundamentals_service import get_fundamentals

router = APIRouter()

@router.get("/")
def fundamentals(symbol: str = Query("AAPL")):
    return get_fundamentals(symbol)
