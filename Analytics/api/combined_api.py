from fastapi import APIRouter, Query
from services.combined_service import get_combined_data

router = APIRouter()

@router.get("/")
def combined(symbol: str = Query("AAPL")):
    return get_combined_data(symbol)
