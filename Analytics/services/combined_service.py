from services.sentiment_service import get_sentiment_data
from services.technicals_service import get_technical_data
from services.fundamentals_service import get_fundamentals

def get_combined_data(symbol: str):
    return {
        "fundamentals": get_fundamentals(symbol),
        "technicals": get_technical_data(symbol),
        "sentiment": get_sentiment_data()
    }
