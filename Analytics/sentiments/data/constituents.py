#!/usr/bin/env python3
"""
constituents.py - Fetches and caches NIFTY100 and Sensex constituent lists.
"""

import logging
import json
import pandas as pd
from typing import Dict, Optional
from datetime import datetime, timedelta
from pathlib import Path
from bs4 import BeautifulSoup

# Import from the root 'sentiments' package
from sentiments.utils import safe_get
from sentiments.config import CONSTITUENT_CACHE_FILE, CACHE_EXPIRATION_HOURS, CACHE_DIR

# --- Module-level Configuration ---
logger = logging.getLogger(__name__)

# --- Private Fetching Functions ---

def _get_nifty100_from_nse() -> Dict[str, str]:
    """Fetch NIFTY100 companies directly from NSE API."""
    url = "https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%20100"
    try:
        r = safe_get(url)
        if not r:
            logger.warning("NSE API request failed, returned None.")
            return {}
            
        data = r.json()
        if "data" not in data:
            logger.warning("NSE API response format unexpected (missing 'data' key).")
            return {}

        result = {}
        for row in data["data"]:
            sym = row.get("symbol")
            name = row.get("meta", {}).get("companyName")
            if sym and name:
                ticker = sym.upper()
                if not ticker.endswith(".NS"):
                    ticker += ".NS"
                result[ticker] = name
                
        logger.info(f"Fetched {len(result)} NIFTY100 symbols from NSE API.")
        return result
        
    except Exception as e:
        logger.error(f"NSE NIFTY100 fetch failed: {e}", exc_info=True)
        return {}

def _get_nifty100_from_wikipedia() -> Dict[str, str]:
    """Fallback NIFTY100 from Wikipedia."""
    url = "https://en.wikipedia.org/wiki/NIFTY_100"
    try:
        r = safe_get(url)
        if not r:
            logger.warning("Wikipedia NIFTY100 request failed, returned None.")
            return {}

        soup = BeautifulSoup(r.text, "html.parser")
        table = soup.find("table", {"class": "wikitable"})
        if not table:
            logger.warning("Could not find 'wikitable' on NIFTY100 Wikipedia page.")
            return {}

        df = pd.read_html(str(table))[0]
        
        # Find columns by keyword, making it robust to renames
        symbol_col = next((c for c in df.columns if "Symbol" in str(c) or "Ticker" in str(c)), None)
        name_col = next((c for c in df.columns if "Company" in str(c) or "Name" in str(c)), None)

        if not symbol_col or not name_col:
            logger.warning("Could not find Symbol or Company columns in Wikipedia NIFTY100 table.")
            return {}

        result = {}
        for _, row in df.iterrows():
            sym = str(row.get(symbol_col, "")).strip()
            name = str(row.get(name_col, "")).strip()
            if sym and name and sym != "Symbol":
                ticker = sym.upper()
                if not ticker.endswith(".NS"):
                    ticker += ".NS"
                result[ticker] = name
                
        logger.info(f"Fetched {len(result)} NIFTY100 symbols from Wikipedia fallback.")
        return result
        
    except Exception as e:
        logger.error(f"Wikipedia NIFTY100 fetch failed: {e}", exc_info=True)
        return {}

def _get_sensex_from_wikipedia() -> Dict[str, str]:
    """Fetch SENSEX constituents from Wikipedia, standardizing to .NS tickers."""
    url = "https://en.wikipedia.org/wiki/List_of_BSE_SENSEX_companies"
    try:
        r = safe_get(url)
        if not r:
            logger.warning("Wikipedia SENSEX request failed, returned None.")
            return {}

        soup = BeautifulSoup(r.text, "html.parser")
        table = soup.find("table", {"class": "wikitable"})
        if not table:
            logger.warning("Could not find 'wikitable' on SENSEX Wikipedia page.")
            return {}

        df = pd.read_html(str(table))[0]

        # Standardize on NSE ticker for compatibility
        symbol_col = next((c for c in df.columns if "NSE" in str(c) or "Ticker" in str(c)), None)
        name_col = next((c for c in df.columns if "Company" in str(c) or "Name" in str(c)), None)

        if not symbol_col or not name_col:
            logger.warning("Could not find NSE Ticker or Company columns in Wikipedia SENSEX table.")
            return {}

        result = {}
        for _, row in df.iterrows():
            sym = str(row.get(symbol_col, "")).strip()
            name = str(row.get(name_col, "")).strip()
            if sym and name and sym != "Ticker" and sym != "TICKER":
                ticker = sym.upper()
                if not ticker.endswith(".NS"):
                    ticker += ".NS"
                result[ticker] = name
                
        logger.info(f"Fetched {len(result)} SENSEX symbols (as .NS) from Wikipedia.")
        return result
        
    except Exception as e:
        logger.error(f"SENSEX fetch failed: {e}", exc_info=True)
        return {}

# --- Caching Logic ---

def _load_cache() -> Optional[Dict[str, str]]:
    """Loads the constituent cache if it's valid and not expired."""
    cache_file = Path(CONSTITUENT_CACHE_FILE)
    if not cache_file.exists():
        logger.info("Constituent cache not found.")
        return None

    try:
        mtime = datetime.fromtimestamp(cache_file.stat().st_mtime)
        if datetime.now() - mtime > timedelta(hours=CACHE_EXPIRATION_HOURS):
            logger.info("Constituent cache is expired.")
            return None
            
        with open(cache_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logger.info(f"Loaded {len(data)} companies from cache.")
        return data
    except Exception as e:
        logger.warning(f"Could not load cache file {cache_file}: {e}. Re-fetching.")
        return None

def _save_cache(data: Dict[str, str]):
    """Saves the combined constituent list to the cache."""
    cache_file = Path(CONSTITUENT_CACHE_FILE)
    try:
        # Ensure the cache directory exists
        Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(data)} companies to cache file: {cache_file}")
    except Exception as e:
        logger.error(f"Failed to save cache file {cache_file}: {e}")

# --- Public Function ---

def get_all_index_constituents() -> Dict[str, str]:
    """
    Get combined NIFTY100 + SENSEX list, using cache if available.
    Standardizes all tickers to .NS format.
    """
    cached_data = _load_cache()
    if cached_data:
        return cached_data

    logger.info("Cache empty or expired, re-fetching all constituents...")
    
    # Try NSE first, fallback to Wikipedia
    nifty = _get_nifty100_from_nse() or _get_nifty100_from_wikipedia()
    
    # Get Sensex companies, already standardized to .NS
    sensex = _get_sensex_from_wikipedia()

    # Combine lists, with NIFTY100 taking precedence
    combined = {**sensex, **nifty}

    if not combined:
        logger.error("Failed to fetch any constituents from any source.")
        return {}

    _save_cache(combined)
    return combined


# --- Test Run ---
if __name__ == "__main__":
    # Configure logger for standalone testing
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    
    print("--- Testing Constituent Fetching ---")
    
    print("\nAttempting full combined fetch (will use/create cache):")
    all_data = get_all_index_constituents()
    print(f"Total unique companies fetched: {len(all_data)}")
    
    if all_data:
        print("\nSample (first 5):")
        for i, (ticker, name) in enumerate(all_data.items()):
            if i >= 5:
                break
            print(f"  {ticker}: {name}")
            
    print("\n--- Test Complete ---")

