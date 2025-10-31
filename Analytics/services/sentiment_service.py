import json
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "data" / "sentiment" / "alphafusion_full_sentiment_202510.json"

def get_sentiment_data():
    if not DATA_PATH.exists():
        return {"error": "Sentiment data not found."}
    
    with open(DATA_PATH, "r") as file:
        return json.load(file)
