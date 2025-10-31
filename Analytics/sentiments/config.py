#!/usr/bin/env python3
"""
Configuration file for the AlphaFusion sentiment analysis project.
All global static variables go here.
"""

from datetime import datetime, timedelta

# --- Network Config ---
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/5.37.36 Chrome/120.0 Safari/5.36"}
REQUEST_TIMEOUT = 10

# --- Model & Workers ---
MAX_WORKERS = 10  # increase or decrease based on your machine
MODEL_ID = "yiyanghkust/finbert-tone"  # financial tone model

# --- Date Config ---
TODAY = datetime.now().date()
MONTH_START = TODAY.replace(day=1)
# Corrected syntax: timedelta(days=32) and timedelta(days=1)
MONTH_END = (MONTH_START + timedelta(days=32)).replace(day=1) - timedelta(days=1)
# Use these as month bounds (inclusive start, exclusive end)
# Corrected syntax: timedelta(days=1)
MONTH_LOWER = datetime.combine(MONTH_START, datetime.min.time())
MONTH_UPPER = datetime.combine(MONTH_END + timedelta(days=1), datetime.min.time())

# --- Caching Config ---
CACHE_DIR = "cache"
CACHE_EXPIRATION_HOURS = 24  # How long to keep constituent list before re-fetching
CONSTITUENT_CACHE_FILE = f"{CACHE_DIR}/constituents_cache.json"

# --- Output Config ---
OUTPUT_PREFIX = f"alphafusion_full_sentiment_{MONTH_START.strftime('%Y%m')}"

