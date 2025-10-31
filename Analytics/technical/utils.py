# utils.py
# Contains general helper functions.

import datetime as dt
import pandas as pd
import numpy as np
from config import MARKET_TIMEZONE, MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE

def is_market_open():
    """Checks if NSE market is currently open (9:15 AM to 3:30 PM IST, Mon-Fri)."""
    now_ist = dt.datetime.now(MARKET_TIMEZONE)
    
    # Check if it's a weekday (Monday=0, Friday=4)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False

    # Define market open and close times for today
    market_open = now_ist.replace(hour=MARKET_OPEN_HOUR, minute=MARKET_OPEN_MINUTE, second=0, microsecond=0)
    market_close = now_ist.replace(hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0)

    # Check if current time is within trading hours
    return market_open <= now_ist < market_close

def get_valid_indicator_count(row, indicator_cols):
    """Counts how many indicator columns in the row are not NaN."""
    count = 0
    for col in indicator_cols:
        if col in row.index and not pd.isna(row.get(col, np.nan)):
            count += 1
    return count