# Analytics/sentiments/main.py
import json
from pathlib import Path

def load_static_sentiments():
    """Load your precomputed sentiment data from alphafusion_full_sentiment_202510.json"""
    base_dir = Path(__file__).resolve().parent.parent  # Goes up from sentiments/
    data_file = base_dir / "alphafusion_full_sentiment_202510.json"

    try:
        with open(data_file, "r") as f:
            sentiments = json.load(f)
    except FileNotFoundError:
        sentiments = {"error": "Sentiment file not found"}

    return sentiments
