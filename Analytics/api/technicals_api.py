from fastapi import APIRouter, Query
from services.technicals_service import get_technical_data

router = APIRouter()

@router.get("/")
def technicals(symbol: str = Query("AAPL")):
    return get_technical_data(symbol)
