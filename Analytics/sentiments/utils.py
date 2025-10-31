#!/usr/bin/env python3
"""
Utility functions for network requests, text parsing, and date handling.
"""

import re
import time
import hashlib
import requests
import pandas as pd
import logging
from datetime import datetime, timedelta
from typing import Optional

# Correct absolute import from the root 'sentiments' package
from sentiments.config import HEADERS, REQUEST_TIMEOUT, MONTH_LOWER, MONTH_UPPER

logger = logging.getLogger(__name__)

def safe_get(url: str, tries: int = 2, sleep: float = 1.0) -> Optional[requests.Response]:
    """
    Perform a robust GET request with retries.
    Returns response object or None if all attempts fail.
    """
    for attempt in range(tries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            r.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            return r
        except requests.exceptions.RequestException as e:
            logger.debug(f"safe_get attempt {attempt + 1}/{tries} failed for {url}: {e}")
            if attempt + 1 == tries:
                logger.warning(f"safe_get final fail for {url}: {e}")
                return None
            time.sleep(sleep)
    return None # Should be unreachable, but good practice


def normalize_text(text: str) -> str:
    """Strip excessive whitespace and return clean string."""
    return re.sub(r"\s+", " ", text or "").strip()


def hash_text(text: str) -> str:
    """Return an MD5 hash of the given text."""
    return hashlib.md5(text.encode("utf8", "ignore")).hexdigest()


def parse_common_date(text: str) -> Optional[datetime]:
    """
    Try to parse common date formats. Returns a datetime object or None.
    """
    if not text:
        return None
        
    # Remove common prefixes
    text = re.sub(r"(?i)published|updated|on\s+", "", text).strip()
    
    # Handle "ago" strings (e.g., "5 hours ago") - this is a simple version
    if "ago" in text:
        try:
            if "hour" in text:
                hours = int(re.findall(r'(\d+)', text)[0])
                return datetime.now() - timedelta(hours=hours)
            if "day" in text:
                days = int(re.findall(r'(\d+)', text)[0])
                return datetime.now() - timedelta(days=days)
            # Add more cases like 'min', 'week' if needed
        except Exception:
            pass # Fallback to other parsers

    # List of common formats
    date_formats = [
        "%b %d, %Y", # Jan 01, 2024
        "%d %b %Y", # 01 Jan 2024
        "%d %b, %Y", # 01 Jan, 2024
        "%B %d, %Y", # January 01, 2024
        "%d %B %Y", # 01 January 2024
        "%Y-%m-%d", # 2024-01-01
        "%d-%m-%Y", # 01-01-2024
        "%Y/%m/%d", # 2024/01/01
        "%d/%m/%Y", # 01/01/2024
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(text, fmt)
        except (ValueError, TypeError):
            continue
            
    # Fallback to pandas parser for complex/ambiguous dates
    try:
        dt = pd.to_datetime(text, errors="coerce")
        return dt.to_pydatetime() if pd.notnull(dt) else None
    except Exception as e:
        logger.debug(f"Pandas date parse failed for '{text}': {e}")
        return None


def is_in_current_month(dt: datetime) -> bool:
    """Check if a datetime is within the current month bounds."""
    if dt is None:
        return False
    # Ensure we are comparing offset-naive datetimes if dt is aware
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
        
    return (MONTH_LOWER <= dt < MONTH_UPPER)

