#!/usr/bin/env python3
"""
analyzer.py — Sentiment analysis logic for AlphaFusion

This module handles:
- Gathering articles from all scrapers.
- Running fallback scrapers if no articles are found.
- Filtering articles by date.
- Running sentiment analysis in batches (optimized).
- Aggregating a final weighted score.
"""

import logging
from datetime import datetime
from typing import List, Dict, Any, Tuple
from transformers import Pipeline  # <-- Added for better type hinting

# --- Correct Absolute Imports ---
# This fixes the ModuleNotFoundError for 'scrapers'
from sentiments.scrapers.sources import (
    SOURCE_FUNCS,
    google_news_search,
    timesofindia_search,
    indianexpress_search,
    bloombergquint_search
)
from sentiments.utils import normalize_text, hash_text, is_in_current_month
from sentiments.config import MONTH_LOWER, MONTH_UPPER

# --- Module-level Configuration ---
logger = logging.getLogger(__name__)

# -----------------------------
# WEIGHT CALCULATIONS
# -----------------------------

def recency_weight(published_dt: datetime) -> float:
    """
    Calculates a weight for an article based on its publish date.
    """
    if not published_dt:
        return 0.5  # Neutral weight for unknown dates
    days = (datetime.now() - published_dt).days
    
    # Penalize if outside current month
    if published_dt < MONTH_LOWER or published_dt >= MONTH_UPPER:
        return 0.01
    
    total_days = (MONTH_UPPER - MONTH_LOWER).days or 30
    # Linear decay: fresher articles get higher weight
    w = 1.0 - (days / max(total_days, 1)) * 0.8
    return max(0.2, min(1.0, w))


def article_weight(source_weight: float, published_dt: datetime) -> float:
    """
    Combines source trust weight with recency weight.
    """
    return source_weight * recency_weight(published_dt)

# -----------------------------
# ARTICLE GATHERING
# -----------------------------

def _run_main_scrapers(company_name: str) -> List[Dict[str, Any]]:
    """Runs all registered scrapers from the SOURCE_FUNCS list."""
    articles = []
    for func, src_name, src_w in SOURCE_FUNCS:
        # We already wrapped individual scrapers in try/except in sources.py
        results: List[Tuple] = func(company_name)
        for (title, snippet, sname, dt) in results:
            articles.append({
                "title": normalize_text(title),
                "snippet": normalize_text(snippet),
                "source": sname or src_name,
                "source_weight": src_w,
                "published": dt,
            })
    return articles


def _run_fallback_scrapers(company_name: str) -> List[Dict[str, Any]]:
    """
    Runs a smaller, high-coverage set of scrapers if initial search finds nothing.
    """
    logger.debug(f"No month articles for {company_name}, running fallback generic searches")
    # These functions are imported directly from sentiments.scrapers
    fallback_funcs = [
        (google_news_search, "GoogleNews", 0.9),
        (timesofindia_search, "TimesOfIndia", 0.6),
        (indianexpress_search, "IndianExpress", 0.6),
        (bloombergquint_search, "BloombergQuint", 0.7)
    ]
    
    f_articles = []
    for func, sname, src_w in fallback_funcs:
        try:
            for title, snippet, _, dt in func(company_name):
                f_articles.append({
                    "title": normalize_text(title),
                    "snippet": normalize_text(snippet),
                    "source": sname,
                    "source_weight": src_w,
                    "published": dt
                })
        except Exception as e:
            logger.warning(f"Fallback scraper {sname} failed for {company_name}: {e}")
            
    return f_articles


def _gather_articles_for_company(company_name: str) -> List[Dict[str, Any]]:
    """
    Runs all scrapers, applies fallback logic, and deduplicates.
    """
    articles = _run_main_scrapers(company_name)
    
    # Filter for current month OR unknown date
    filtered_articles = [a for a in articles if a["published"] is None or is_in_current_month(a["published"])]
    
    # If no relevant articles found, run fallback scrapers
    if not filtered_articles:
        logger.debug(f"No current-month articles for {company_name}, running fallbacks.")
        filtered_articles = _run_fallback_scrapers(company_name)

    # Deduplicate by title+snippet hash
    unique = {}
    for a in filtered_articles:
        if not a["title"]: # Skip articles without a title
            continue
        h = hash_text(a["title"] + "|" + (a["snippet"] or ""))
        if h not in unique:
            unique[h] = a
            
    return list(unique.values())

# -----------------------------
# COMPANY SENTIMENT ANALYSIS (PUBLIC)
# -----------------------------

def analyze_company(ticker: str, company_name: str, classifier: Pipeline) -> Dict[str, float]:
    """
    Main analysis pipeline for a single company.
    This is the public function called by main.py.
    """
    try:
        articles = _gather_articles_for_company(company_name)

        # Final safety: if still empty, create a neutral single-entry
        if not articles:
            logger.info(f"No articles found for {company_name} after all scrapers. Using neutral fallback.")
            articles = [{
                "title": company_name, # Use company name as neutral text
                "snippet": "",
                "source": "Fallback",
                "source_weight": 0.3,
                "published": None
            }]

        # Prepare texts for the model.
        # Removed the [:512] character slice to let the pipeline
        # handle proper token-based truncation.
        texts_to_analyze = [
            ((a["title"] + ". " + (a["snippet"] or "")).strip())
            for a in articles
        ]

        # --- BATCH PREDICTION (Optimized) ---
        # Run sentiment analysis on all texts for this company at once
        # The pipeline will handle tokenization and truncation.
        predictions = classifier(texts_to_analyze)
        # ---

        # Aggregate weighted scores
        weighted_sum = 0.0
        total_weight = 0.0
        
        for pred, article_data in zip(predictions, articles):
            lbl = pred["label"].lower()
            
            # FinBERT-tone labels: Positive, Negative, Neutral
            polarity = 1 if "positive" in lbl else -1 if "negative" in lbl else 0
            
            w = article_weight(article_data["source_weight"], article_data["published"])
            
            weighted_sum += polarity * w
            total_weight += w

        weighted_score = (weighted_sum / total_weight) if total_weight > 0 else 0.0
        return {ticker: round(weighted_score, 4)}

    except Exception as e:
        logger.error(f"Critical failure in analyze_company for {company_name}: {e}", exc_info=True)
        return {ticker: 0.0} # Return neutral on complete failure

