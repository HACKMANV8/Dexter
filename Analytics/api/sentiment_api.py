from fastapi import APIRouter
from services.sentiment_service import get_sentiment_data

router = APIRouter()

@router.get("/")
def sentiment():
    return get_sentiment_data()

