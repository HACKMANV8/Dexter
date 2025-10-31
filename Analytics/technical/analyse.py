import time
import math
import numpy as np
import pandas as pd
import yfinance as yf
import pandas_ta as ta
import datetime as dt
from scipy.stats import rankdata
from pytz import timezone
import json  # <-- NEW IMPORT for JSON output

# --- Imports for charting are REMOVED ---
# import matplotlib.pyplot as plt
# import mplfinance as mpl

# -------- CONFIG ----------
# (Constants and weights are kept for the scoring logic)

# Market Timing Constants (NSE/IST)
MARKET_TIMEZONE = timezone('Asia/Kolkata')
MARKET_OPEN_HOUR = 9
MARKET_OPEN_MINUTE = 15
MARKET_CLOSE_HOUR = 15
MARKET_CLOSE_MINUTE = 30

ADX_TREND_THRESHOLD = 25.0 # ADX threshold for trend regime
ANOMALY_Z_THRESHOLD = 3.0 # return/volume zscore for anomaly

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

# Required columns for decision-making
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

# (Lists of tickers are no longer needed for the main loop, but are harmless to keep)
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
SENSEX_30_TICKERS = [
    "RELIANCE.BO", "HDFCBANK.BO", "ICICIBANK.BO", "INFY.BO", "TCS.BO",
    "KOTAKBANK.BO", "HINDUNILVR.BO", "LT.BO", "SBIN.BO", "AXISBANK.BO",
    "BHARTIARTL.BO", "BAJFINANCE.BO", "ASIANPAINT.BO", "MARUTI.BO", "ITC.BO",
    "WIPRO.BO", "TITAN.BO", "NESTLEIND.BO", "ULTRACEMCO.BO", "TECHM.BO",
    "HCLTECH.BO", "POWERGRID.BO", "NTPC.BO", "M&M.BO", "SUNPHARMA.BO",
    "BAJAJFINSV.BO", "TATASTEEL.BO", "INDUSINDBK.BO", "TATAMOTORS.BO", "JSWSTEEL.BO"
]


# -------- HELPERS ----------

def is_market_open():
    """Checks if NSE market is currently open (9:15 AM to 3:30 PM IST, Mon-Fri)."""
    now_ist = dt.datetime.now(MARKET_TIMEZONE)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False
    market_open = now_ist.replace(hour=MARKET_OPEN_HOUR, minute=MARKET_OPEN_MINUTE, second=0, microsecond=0)
    market_close = now_ist.replace(hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0)
    return market_open <= now_ist < market_close

def pull_history(ticker, interval, period):
    """
    Fetch historical OHLCV data safely using yfinance with dynamic interval/period.
    """
    try:
        df = yf.download(
            ticker,
            period=period, 
            interval=interval, 
            progress=False,
            auto_adjust=False,
        )
    except Exception as e:
        raise RuntimeError(f"❌ yfinance download failed for {ticker}: {e}")

    if df is None or df.empty:
        raise RuntimeError(f"⚠ No data returned by yfinance for ticker: {ticker}")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [c[0] for c in df.columns] 

    df.columns = [str(c).strip().capitalize() for c in df.columns]

    required_cols_price = ["Open", "High", "Low", "Close", "Volume"]
    missing = [c for c in required_cols_price if c not in df.columns]
    if missing:
        if "Adj close" in df.columns and "Close" not in df.columns:
            df["Close"] = df["Adj close"]
        missing = [c for c in required_cols_price if c not in df.columns]
        if missing:
            raise RuntimeError(f"❌ Still missing columns {missing} for {ticker} after normalization.")

    df = df.dropna(subset=required_cols_price)
    if df.empty:
        raise RuntimeError(f"⚠ All OHLCV data empty for {ticker} after dropna.")
    
    if len(df) < 200:
        try:
            df_daily = yf.download(ticker, period="1y", interval="1d", progress=False, auto_adjust=False)
            if not df_daily.empty:
                if isinstance(df_daily.columns, pd.MultiIndex):
                    df_daily.columns = [c[0] for c in df_daily.columns]
                df_daily.columns = [str(c).strip().capitalize() for c in df_daily.columns]
                if "Adj close" in df_daily.columns and "Close" not in df_daily.columns:
                    df_daily["Close"] = df_daily["Adj close"]
                if len(df_daily) > len(df):
                    df = df_daily.dropna(subset=required_cols_price)
        except Exception:
            pass 

    return df


def compute_indicators(df):
    """
    Append indicators using pandas_ta in-place, then map to the column names expected
    by the rest of the script.
    """
    df = df.copy()
    df = df.sort_index()

    try:
        df.ta.sma(length=20, append=True)
        df.ta.sma(length=50, append=True)
        df.ta.sma(length=200, append=True)
    except Exception: pass
    try:
        df.ta.ema(length=12, append=True)
        df.ta.ema(length=26, append=True)
    except Exception: pass

    for fn, kwargs in [
        ("macd", {}), ("adx", {}), ("rsi", {"length": 14}), ("atr", {"length": 14}),
        ("bbands", {"length": 20, "std": 2}), ("obv", {}), ("cmf", {"length": 20}),
        ("mfi", {"length": 14}), ("stoch", {}), ("cci", {"length": 20}),
    ]:
        try:
            getattr(df.ta, fn)(**kwargs, append=True)
        except Exception:
            pass

    df["SMA20"] = df.get("SMA_20", df.get("SMA20", pd.Series(np.nan, index=df.index)))
    df["SMA50"] = df.get("SMA_50", df.get("SMA50", pd.Series(np.nan, index=df.index)))
    df["SMA200"] = df.get("SMA_200", df.get("SMA200", pd.Series(np.nan, index=df.index)))
    df["EMA12"] = df.get("EMA_12", df.get("EMA12", pd.Series(np.nan, index=df.index)))
    df["EMA26"] = df.get("EMA_26", df.get("EMA26", pd.Series(np.nan, index=df.index)))
    df["MACD"] = df.get("MACD_12_26_9", df.get("MACD", pd.Series(np.nan, index=df.index)))
    df["MACD_SIGNAL"] = df.get("MACDs_12_26_9", df.get("MACDs", pd.Series(np.nan, index=df.index)))
    df["MACD_HIST"] = df.get("MACDh_12_26_9", df.get("MACDh", pd.Series(np.nan, index=df.index)))
    df["ADX"] = df.get("ADX_14", df.get("ADX", pd.Series(np.nan, index=df.index)))
    df["+DI"] = df.get("DMP_14", df.get("+DI", pd.Series(np.nan, index=df.index)))
    df["-DI"] = df.get("DMN_14", df.get("-DI", pd.Series(np.nan, index=df.index)))
    df["RSI"] = df.get("RSI_14", df.get("RSI", pd.Series(np.nan, index=df.index)))
    df["ATR"] = df.get("ATR_14", df.get("ATR", pd.Series(np.nan, index=df.index)))
    df["BBL"] = df.get("BBL_20_2.0", df.get("BBL", pd.Series(np.nan, index=df.index)))
    df["BBM"] = df.get("BBM_20_2.0", df.get("BBM", pd.Series(np.nan, index=df.index)))
    df["BBU"] = df.get("BBU_20_2.0", df.get("BBU", pd.Series(np.nan, index=df.index)))
    df["OBV"] = df.get("OBV", pd.Series(np.nan, index=df.index))
    df["CMF"] = df.get("CMF_20", df.get("CMF", pd.Series(np.nan, index=df.index)))
    df["MFI"] = df.get("MFI_14", df.get("MFI", pd.Series(np.nan, index=df.index)))
    df["STOCH_K"] = df.get("STOCHk_14_3_3", df.get("STOCHk", pd.Series(np.nan, index=df.index)))
    df["STOCH_D"] = df.get("STOCHd_14_3_3", df.get("STOCHd", pd.Series(np.nan, index=df.index)))
    df["CCI"] = df.get("CCI_20", df.get("CCI", pd.Series(np.nan, index=df.index)))

    df["RET"] = df["Close"].pct_change().fillna(0)
    try:
        ret_roll_mean = df["RET"].rolling(60, min_periods=10).mean()
        ret_roll_std = df["RET"].rolling(60, min_periods=10).std().replace(0, np.nan)
        df["RET_Z"] = (df["RET"] - ret_roll_mean) / ret_roll_std
    except Exception:
        df["RET_Z"] = pd.Series(0.0, index=df.index)
    try:
        vol_roll_mean = df["Volume"].rolling(60, min_periods=10).mean()
        vol_roll_std = df["Volume"].rolling(60, min_periods=10).std().replace(0, np.nan)
        df["VOL_Z"] = (df["Volume"] - vol_roll_mean) / vol_roll_std
    except Exception:
        df["VOL_Z"] = pd.Series(0.0, index=df.index)
    
    df["RET_Z"] = df["RET_Z"].fillna(0.0)
    df["VOL_Z"] = df["VOL_Z"].fillna(0.0)

    return df


def normalize_features(df):
    """
    Calculates features for the last row of the DataFrame.
    """
    df_local = df.copy().sort_index()
    if df_local.empty:
        raise RuntimeError("DataFrame is empty after slicing for analysis.")

    last = df_local.iloc[-1]
    
    if pd.isna(last.get("Close", np.nan)):
        raise RuntimeError("CRITICAL: Last bar is missing price data, cannot proceed.")

    features = {}

    try:
        sma_trend = 0
        if not (pd.isna(last.get("SMA20")) or pd.isna(last.get("SMA50")) or pd.isna(last.get("SMA200"))):
            if last["SMA20"] > last["SMA50"] > last["SMA200"]:
                sma_trend = 1
            elif last["SMA20"] < last["SMA50"] < last["SMA200"]:
                sma_trend = -1
        features["SMA_trend"] = sma_trend
    except Exception: features["SMA_trend"] = 0

    try:
        if not (pd.isna(last.get("EMA12")) or pd.isna(last.get("EMA26"))):
            features["EMA_trend"] = 1 if last["EMA12"] > last["EMA26"] else -1
        else:
            features["EMA_trend"] = 0
    except Exception: features["EMA_trend"] = 0

    try:
        macd_hist = df_local["MACD_HIST"].dropna()
        if len(macd_hist) > 10:
            v = (last.get("MACD_HIST", 0) - macd_hist.mean()) / (macd_hist.std() + 1e-9)
            features["MACD"] = np.tanh(v)
        else:
            features["MACD"] = 0
    except Exception: features["MACD"] = 0

    try:
        adx_val = last.get("ADX", 0)
        features["ADX"] = np.tanh((adx_val - ADX_TREND_THRESHOLD) / 10.0)
    except Exception: features["ADX"] = 0.0

    try:
        rsi_val = last.get("RSI", 50)
        features["RSI"] = (rsi_val - 50) / 50.0
        features["RSI"] = max(-1, min(1, features["RSI"]))
    except Exception: features["RSI"] = 0.0

    try:
        atr_val = last.get("ATR", 0)
        if atr_val > 0 and last.get("Close", 0) > 0:
            atr_rel = atr_val / (last["Close"] + 1e-9)
            features["ATR"] = np.tanh((0.02 - atr_rel) * 50)
        else:
            features["ATR"] = 0.0
    except Exception: features["ATR"] = 0.0

    try:
        bb_mid = last.get("BBM")
        bb_width = max(1e-9, last.get("BBU", 0) - last.get("BBL", 0))
        if bb_mid and bb_width > 1e-9 and last.get("Close") is not None:
            bb_pos = (last["Close"] - bb_mid) / bb_width
            features["BOLL"] = np.tanh(-bb_pos)
        else:
            features["BOLL"] = 0.0
    except Exception: features["BOLL"] = 0.0

    try:
        obv = df_local["OBV"].dropna()
        if len(obv) > 20:
            obv_roll_mean = obv.rolling(20).mean().iloc[-1]
            features["OBV"] = 1 if last.get("OBV", 0) > obv_roll_mean else -1
        else:
            features["OBV"] = 0
    except Exception: features["OBV"] = 0

    try:
        features["CMF"] = np.tanh(last.get("CMF", 0) * 5)
    except Exception: features["CMF"] = 0.0

    try:
        mfi_val = last.get("MFI", 50)
        features["MFI"] = (mfi_val - 50) / 50.0
        features["MFI"] = max(-1, min(1, features["MFI"]))
    except Exception: features["MFI"] = 0.0

    try:
        if not (pd.isna(last.get("STOCH_K")) or pd.isna(last.get("STOCH_D"))):
            features["STOCH"] = 1 if last["STOCH_K"] > last["STOCH_D"] else -1
        else:
            features["STOCH"] = 0
    except Exception: features["STOCH"] = 0

    try:
        features["CCI"] = np.tanh(last.get("CCI", 0) / 200.0)
    except Exception: features["CCI"] = 0.0

    try:
        volz = last.get("VOL_Z", 0)
        ret = last.get("RET", 0)
        if not pd.isna(volz) and not pd.isna(ret):
            vol_sign = 1 if (volz > 1.5 and ret > 0) else (-1 if (volz > 1.5 and ret < 0) else 0)
        else:
            vol_sign = 0
        features["VOL_Z"] = vol_sign
    except Exception: features["VOL_Z"] = 0

    return features


def adapt_weights(base_weights, features, df):
    w = base_weights.copy()
    adx_val = float(features.get("ADX", 0)) 
    trend_boost = max(0, adx_val)
    
    if trend_boost > 0.3:
        for k in ["SMA_trend", "EMA_trend", "MACD"]:
            if k in w:
                w[k] *= 1.0 + 0.5 * trend_boost
        if "BOLL" in w:
            w["BOLL"] *= max(0.4, 1.0 - 0.8 * trend_boost)
    else:
        if "BOLL" in w:
            w["BOLL"] *= 1.0 + 0.8 * (0.3 - trend_boost)
        if "RSI" in w:
            w["RSI"] *= 1.0 + 0.3 * (0.3 - trend_boost)
            
    s = sum([v for v in w.values() if not math.isnan(v)])
    if s > 1e-9:
        for k in w:
            w[k] = w[k] / s
    return w


def aggregate_score(features, weights):
    s = 0.0
    breakdown = {}
    for k, w in weights.items():
        val = features.get(k, 0.0)
        if not isinstance(val, (int, float)) or pd.isna(val) or not math.isfinite(val):
            val = 0.0
        contr = w * val
        breakdown[k] = contr
        s += contr
        
    score = (s + 1.0) / 2.0 * 100.0
    
    if pd.isna(score) or not math.isfinite(score):
        score = 50.0
        
    return score, breakdown


def compute_confidence(breakdown, features):
    mag = sum(abs(v) for v in breakdown.values())
    adx_bias = abs(features.get("ADX", 0))
    
    num_features = len(BASE_WEIGHTS) if len(BASE_WEIGHTS) > 0 else 1
    conf = (mag / num_features) * 0.8 + adx_bias * 0.2
    
    conf = max(0.0, min(1.0, conf))
    return conf


def recommend_signal(score, confidence, latest, breakdown):
    if score < 30:
        signal = "EXIT"
    elif score < 45:
        signal = "TIGHTEN_STOP"
    elif score < 60:
        signal = "HOLD"
    else:
        signal = "BUY"
    
    ret_z = latest.get("RET_Z", 0)
    vol_z = latest.get("VOL_Z", 0)
    if abs(ret_z) > ANOMALY_Z_THRESHOLD or abs(vol_z) > ANOMALY_Z_THRESHOLD:
        if signal == "BUY":
            signal = "TIGHTEN_STOP"
        elif signal == "HOLD":
            signal = "VIGILANCE_HIGH_VOL"
        elif signal == "TIGHTEN_STOP" or signal == "EXIT":
            signal = "EXIT_ANOMALY"
    
    if confidence < 0.35 and signal == "BUY":
        signal = "HOLD"
    return signal


def smart_stop(latest, signal):
    price = latest.get("Close", 0.0) 
    if price <= 0:
        return 0.0

    atr = latest.get("ATR", price * 0.01) 
    if atr <= 0 or pd.isna(atr):
        atr = price * 0.01

    if signal == "BUY":
        stop = price - 3.0 * atr
    elif signal == "HOLD":
        stop = price - 2.0 * atr
    elif signal == "TIGHTEN_STOP" or signal == "VIGILANCE_HIGH_VOL":
        stop = price - 1.0 * atr
    else: # EXIT or EXIT_ANOMALY
        stop = price - 0.5 * atr
        
    stop = min(stop, price * 0.995) 
    return max(0.0, stop)

# -------- NEW FUNCTION TO PREPARE CHART DATA (REPLACES generate_charts) ----------
def prepare_chart_data(ticker, df_1d_intraday, df_1y_daily):
    """
    Generates 1D, 1M, 6M, and 1Y price-only chart data and returns as a dict.
    The format is: [ { "date": "...", "price": ... }, ... ]
    """
    chart_data = {}

    # --- 1. 1-Day (Intraday Chart) ---
    try:
        if not df_1d_intraday.empty:
            df_1d = df_1d_intraday.dropna(subset=["Close"])
            data_1d = []
            for index, row in df_1d.iterrows():
                # isoformat() is a standard way to represent dates as strings
                data_1d.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1D'] = data_1d
        else:
            chart_data['1D'] = [] # Send empty list if no data
    except Exception as e:
        print(f"Could not process 1-Day chart data: {e}")
        chart_data['1D'] = []

    # --- 2. 1-Month, 6-Month, 1-Year (Daily Charts) ---
    try:
        if not df_1y_daily.empty:
            df_1y = df_1y_daily.dropna(subset=["Close"])
            
            # Slice for other timeframes
            df_6m = df_1y.last('6M')
            df_1m = df_1y.last('1M')

            # Process 1M
            data_1m = []
            for index, row in df_1m.iterrows():
                data_1m.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1M'] = data_1m
            
            # Process 6M
            data_6m = []
            for index, row in df_6m.iterrows():
                data_6m.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['6M'] = data_6m

            # Process 1Y
            data_1y = []
            for index, row in df_1y.iterrows():
                data_1y.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1Y'] = data_1y
            
        else:
            # Send empty lists if no data
            chart_data['1M'] = []
            chart_data['6M'] = []
            chart_data['1Y'] = []
            
    except Exception as e:
        print(f"Could not process daily chart data: {e}")
        chart_data['1M'] = []
        chart_data['6M'] = []
        chart_data['1Y'] = []

    return chart_data


# -------- NEW INTERPRETATION FUNCTION ----------
def interpret_score(score):
    """Provides a simple text interpretation of the technical score."""
    if score > 70:
        return "✅ Strong Technical Buy"
    elif score > 60:
        return "👍 Moderate Technical Buy"
    elif score < 40:
        return "👎 Moderate Technical Sell/Avoid"
    elif score < 30:
        return "❌ Strong Technical Sell/Avoid"
    else:
        return "Hold"

# -------- NEW MAIN ANALYSIS FUNCTION ----------
def analyze_stock(ticker):
    """
    Runs the full analysis for a single stock ticker.
    """
    try:
        # --- 1. Get Data for Scoring ---
        is_open = is_market_open()
        if is_open:
            interval = '1m'
            period = '7d'
            data_mode = "REAL-TIME (1m)"
        else:
            # Use 1 year of daily data for full indicator calculation (SMA200 etc)
            interval = '1d'
            period = '1y' 
            data_mode = "HISTORICAL (1d)"

        print(f"\n--- Analyzing {ticker} ({data_mode}) ---")
        df = pull_history(ticker, interval, period)

        # Use the last complete bar for analysis
        df_to_analyze = df.copy()
        if not is_open and interval != '1d' and len(df_to_analyze) >= 2:
            # If market just closed, use the second-to-last bar
            df_to_analyze = df_to_analyze.iloc[:-1]
        
        if df_to_analyze.empty:
            print("No data to analyze.")
            return

        # --- 2. Compute Score ---
        df_computed = compute_indicators(df_to_analyze)
        features = normalize_features(df_computed)
        latest_row = df_computed.iloc[-1]
        
        # Add Z-scores to features
        features["RET_Z"] = latest_row.get("RET_Z", 0)
        features["VOL_Z"] = latest_row.get("VOL_Z", 0)

        weights = adapt_weights(BASE_WEIGHTS.copy(), features, df_computed)
        
        # For a single run, the raw score is our final score
        final_score, breakdown = aggregate_score(features, weights)
        
        confidence = compute_confidence(breakdown, features)
        signal = recommend_signal(final_score, confidence, latest_row, breakdown)
        stop_price = smart_stop(latest_row, signal)

        # --- 3. Print "Right Now" Data ---
        print("\n--- 📊 CURRENT DATA ---")
        print(f"  Price:  {latest_row['Close']:.2f}")
        print(f"  Open:   {latest_row.get('Open', 0.0):.2f}")
        print(f"  High:   {latest_row.get('High', 0.0):.2f}")
        print(f"  Low:    {latest_row.get('Low', 0.0):.2f}")
        print(f"  Volume: {latest_row.get('Volume', 0):,.0f}")
        print(f"  Change: {latest_row.get('RET', 0.0) * 100:+.2f}%")
        try:
            bar_time = latest_row.name.strftime('%Y-%m-%d %H:%M:%S')
            print(f"  Bar Time: {bar_time} ({data_mode})")
        except Exception:
            print(f"  Bar Time: {latest_row.name} ({data_mode})")


        # --- 4. Print Score & Signal ---
        print("\n--- 🎯 TECHNICAL ANALYSIS ---")
        print(f"  Score (0-100):   {final_score:.2f}")
        print(f"  Interpretation:  {interpret_score(final_score)}")
        print(f"  Signal:          {signal}")
        print(f"  Confidence:      {confidence*100:.1f}%")
        print(f"  Smart Stop:      {stop_price:.2f}")

        # --- 5. Print Disclaimer ---
        print("\n--- ⚠️ IMPORTANT DISCLAIMER ---")
        print("  This analysis is purely TECHNICAL (based on price, volume, and momentum).")
        print("  It is NOT fundamental analysis (e.g., P/E, revenue, debt).")
        print("  'BUY'/'SELL' signals refer to technical indicators, not financial advice.")
        print("  Do your own research.")

        # --- 6. Fetch, Process, and Print Chart Data ---
        print(f"\n📈 Preparing chart data for {ticker}...")
        
        # Fetch chart data using pull_history
        try:
            df_chart_1d = pull_history(ticker, interval='5m', period='1d')
        except Exception as e:
            print(f"Could not fetch 1-Day chart data: {e}")
            df_chart_1d = pd.DataFrame() # Create empty df to avoid errors

        try:
            df_chart_1y = pull_history(ticker, interval='1d', period='1y')
        except Exception as e:
            print(f"Could not fetch 1-Year chart data: {e}")
            df_chart_1y = pd.DataFrame() # Create empty df to avoid errors
            
        # Call the new function to get the data as a dict
        chart_data_dict = prepare_chart_data(ticker, df_chart_1d, df_chart_1y)
        
        # Convert the dict to a clean, formatted JSON string
        # This is the "data components" block you can copy
        chart_json = json.dumps(chart_data_dict, indent=2)

        # Print the JSON block
        print("\n--- 📈 CHART DATA COMPONENTS (JSON) ---")
        print(chart_json)
        print("--- END OF CHART DATA ---")


    except Exception as e:
        print(f"\n❌ An error occurred while analyzing {ticker}: {e}")
        # import traceback
        # traceback.print_exc() # Uncomment for detailed debugging


# -------- MODIFIED MAIN EXECUTION ----------
if __name__ == "__main__":
    
    while True:
        ticker_input = input("\nEnter a stock ticker (e.g., RELIANCE.NS, INFY.BO, or AAPL for US) or 'q' to quit: ")
        
        if ticker_input.lower() == 'q':
            print("Exiting...")
            break
            
        if not ticker_input:
            continue
        
        # Standardize ticker
        ticker = ticker_input.upper().strip()
        
        # --- Auto-suffixing logic for Indian stocks (optional but helpful) ---
        if ".NS" not in ticker and ".BO" not in ticker and not any(c.isdigit() for c in ticker):
             # Check if it's in one of the predefined lists (without suffix)
            if ticker in (t.split('.')[0] for t in NIFTY_50_TICKERS) or \
               ticker in (t.split('.')[0] for t in NIFTY_NEXT_50_TICKERS):
                 ticker += ".NS"
                 print(f"(Auto-suffixed to {ticker})")
            elif ticker in (t.split('.')[0] for t in SENSEX_30_TICKERS):
                 ticker += ".BO"
                 print(f"(Auto-suffixed to {ticker})")
            # If not in lists, we assume it's a global ticker (like 'AAPL')
            # or a typo, and let yfinance handle it.
        
        
        analyze_stock(ticker)