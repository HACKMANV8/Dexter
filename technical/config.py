# config.py
# This file stores all your constants and configuration variables.

from pytz import timezone
import math # Original script imported math, so we keep it

# -------- CONFIG ----------
# NIFTY 50 (First 50)
NIFTY_50_TICKERS = [
    "RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", "TCS.NS",
    "KOTAKBANK.NS", "HINDUNILVR.NS", "LT.NS", "SBIN.NS", "AXISBANK.NS",
    "BHARTIARTL.NS", "BAJFINANCE.NS", "ASIANPAINT.NS", "MARUTI.NS", "ITC.NS",
    "WIPRO.NS", "TITAN.NS", "NESTLEIND.NS", "ULTRACEMCO.NS", "TECHM.NS",
    "HCLTECH.NS", "POWERGRID.NS", "NTPC.NS", "GRASIM.NS", "SUNPHARMA.NS",
    "M&M.NS", "INDUSINDBK.NS", "ONGC.NS", "DRREDDY.NS", "TATACONSUM.NS",
    "BRITANNIA.NS", "JSWSTEEL.NS", "COALINDIA.NS", "HINDALCO.NS", "TATAMOTORS.NS",
    "EICHERMOT.NS", "ADANIPORTS.NS", "BPCL.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
    "HEROMOTOCO.NS", "SHREECEM.NS", "BAJAJ-AUTO.NS", "CIPLA.NS", "TATASTEEL.NS",
    "HDFCLIFE.NS", "SBILIFE.NS", "ADANIENT.NS", "UPL.NS", "ICICIGI.NS"
]

# NIFTY NEXT 50 (The next 50)
NIFTY_NEXT_50_TICKERS = [
    "PIDILITIND.NS", "BAJAJFINSV.NS", "AMBUJACEM.NS", "GAIL.NS", "IOC.NS",
    "DLF.NS", "SBICARD.NS", "HAVELLS.NS", "SIEMENS.NS", "INDIGO.NS",
    "CHOLAFIN.NS", "PGHH.NS", "DABUR.NS", "SRF.NS", "BOSCHLTD.NS",
    "HDFCAMC.NS", "BERGEPAINT.NS", "GODREJCP.NS", "NMDC.NS", "BANKBARODA.NS",
    "COLPAL.NS", "ICICIPRULI.NS", "TVSMOTOR.NS", "PNB.NS", "MARICO.NS",
    "LTIM.NS", "SHRIRAMFIN.NS", "VEDL.NS", "HINDZINC.NS", "HINDPETRO.NS",
    "MOTHERSON.NS", "AUROPHARMA.NS", "TORNTPHARM.NS", "BEL.NS", "LODHA.NS",
    "TRENT.NS", "ABB.NS", "HAL.NS", "ADANIPOWER.NS", "IRCTC.NS",
    "ATGL.NS", "ZEEL.NS", "NAUKRI.NS", "ZOMATO.NS", "PAYTM.NS"
]

# BSE Sensex 30 (Note the .BO suffix for Bombay Stock Exchange)
SENSEX_30_TICKERS = [
    "RELIANCE.BO", "HDFCBANK.BO", "ICICIBANK.BO", "INFY.BO", "TCS.BO",
    "KOTAKBANK.BO", "HINDUNILVR.BO", "LT.BO", "SBIN.BO", "AXISBANK.BO",
    "BHARTIARTL.BO", "BAJFINANCE.BO", "ASIANPAINT.BO", "MARUTI.BO", "ITC.BO",
    "WIPRO.BO", "TITAN.BO", "NESTLEIND.BO", "ULTRACEMCO.BO", "TECHM.BO",
    "HCLTECH.BO", "POWERGRID.BO", "NTPC.BO", "M&M.BO", "SUNPHARMA.BO",
    "BAJAJFINSV.BO", "TATASTEEL.BO", "INDUSINDBK.BO", "TATAMOTORS.BO", "JSWSTEEL.BO"
]

# Market Timing Constants (NSE/IST)
MARKET_TIMEZONE = timezone('Asia/Kolkata')
MARKET_OPEN_HOUR = 9
MARKET_OPEN_MINUTE = 15
MARKET_CLOSE_HOUR = 15
MARKET_CLOSE_MINUTE = 30

HISTORY_BARS = 700 
POLL_INTERVAL = 60 # seconds between polls (simulate realtime)
EWMA_ALPHA = 0.25 # smoothing for composite score
ADX_TREND_THRESHOLD = 25.0 # ADX threshold for trend regime
ANOMALY_Z_THRESHOLD = 3.0 # return/volume zscore for anomaly
VOLATILITY_SCALE = 0.05 # used to scale ATR-check (fraction of mean price)

# Weights (base) — will be adapted by regime
BASE_WEIGHTS = {
    "SMA_trend": 0.08,
    "EMA_trend": 0.06,
    "MACD": 0.09,
    "ADX": 0.05,
    "RSI": 0.08,
    "ATR": 0.05,
    "BOLL": 0.06,
    "OBV": 0.05,
    "CMF": 0.04,
    "MFI": 0.03,
    "STOCH": 0.04,
    "CCI": 0.03,
    "VOL_Z": 0.02, # volume zscore signal
}
# normalize weights to sum 1
total = sum(BASE_WEIGHTS.values())
BASE_WEIGHTS = {k: v/total for k, v in BASE_WEIGHTS.items()}

# Required columns for decision-making (must be non-null in at least one recent row)
# NOTE: This list is now primarily for documentation, as normalize_features is less strict.
REQUIRED_COLS = [
    "Close", "High", "Low", "Volume",
    "SMA20", "SMA50", "SMA200",
    "EMA12", "EMA26",
    "MACD_HIST", "ADX", "RSI", "ATR",
    "BBM", "BBU", "BBL",
    "OBV", "CMF", "MFI",
    "STOCH_K", "STOCH_D", "CCI",
    "RET", "RET_Z", "VOL_Z"
]