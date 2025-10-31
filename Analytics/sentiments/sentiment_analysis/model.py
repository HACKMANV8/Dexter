import logging
from transformers import pipeline
from sentiments.config import MODEL_ID

def load_sentiment_pipeline(model_id=MODEL_ID):
    logging.info("Loading sentiment model (this may take a minute)...")
    classifier = pipeline("sentiment-analysis", model=model_id, device=-1)
    return classifier
