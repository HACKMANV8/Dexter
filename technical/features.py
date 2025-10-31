# features.py
# Contains function for normalizing raw indicators into features.

import pandas as pd
import numpy as np
from config import ADX_TREND_THRESHOLD

def normalize_features(df):
    """
    [FIXED] Simply returns the features for the last row, trusting the
    outer function to have selected the correct, non-fragmented bar.
    NaNs are handled locally within each feature calculation block.
    """
    df_local = df.copy().sort_index()

    if df_local.empty:
        raise RuntimeError("DataFrame is empty after slicing for analysis.")

    # --- FIX: Use the last row directly and rely on safe access (.get(..., default)) ---
    last = df_local.iloc[-1]
    
    if pd.isna(last.get("Close", np.nan)):
        raise RuntimeError("CRITICAL: Last bar is missing price data, cannot proceed.")
    # -----------------------------------------------

    features = {}

    # SMA trend
    try:
        sma_trend = 0
        # Check for NaNs before comparison
        if not (pd.isna(last.get("SMA20")) or pd.isna(last.get("SMA50")) or pd.isna(last.get("SMA200"))):
            if last["SMA20"] > last["SMA50"] > last["SMA200"]:
                sma_trend = 1
            elif last["SMA20"] < last["SMA50"] < last["SMA200"]:
                sma_trend = -1
        features["SMA_trend"] = sma_trend
    except Exception:
        features["SMA_trend"] = 0

    # EMA trend
    try:
        if not (pd.isna(last.get("EMA12")) or pd.isna(last.get("EMA26"))):
            features["EMA_trend"] = 1 if last["EMA12"] > last["EMA26"] else -1
        else:
            features["EMA_trend"] = 0
    except Exception:
        features["EMA_trend"] = 0

    # MACD hist
    try:
        macd_hist = df_local["MACD_HIST"].dropna()
        # Only compute normalization if we have enough historical data points
        if len(macd_hist) > 10:
            v = (last.get("MACD_HIST", 0) - macd_hist.mean()) / (macd_hist.std() + 1e-9)
            features["MACD"] = np.tanh(v)
        else:
            features["MACD"] = 0
    except Exception:
        features["MACD"] = 0

    # ADX
    try:
        adx_val = last.get("ADX", 0)
        features["ADX"] = np.tanh((adx_val - ADX_TREND_THRESHOLD) / 10.0)
    except Exception:
        features["ADX"] = 0.0

    # RSI
    try:
        rsi_val = last.get("RSI", 50)
        features["RSI"] = (rsi_val - 50) / 50.0
        features["RSI"] = max(-1, min(1, features["RSI"]))
    except Exception:
        features["RSI"] = 0.0

    # ATR
    try:
        atr_val = last.get("ATR", 0)
        # <-- FIX: Added check for Close > 0 to prevent division by zero
        if atr_val > 0 and last.get("Close", 0) > 0:
            atr_rel = atr_val / (last["Close"] + 1e-9)
            features["ATR"] = np.tanh((0.02 - atr_rel) * 50)
        else:
            features["ATR"] = 0.0
    except Exception:
        features["ATR"] = 0.0

    # Bollinger
    try:
        bb_mid = last.get("BBM")
        bb_width = max(1e-9, last.get("BBU", 0) - last.get("BBL", 0))
        # <-- FIX: Added check for Close is not None
        if bb_mid and bb_width > 1e-9 and last.get("Close") is not None:
            bb_pos = (last["Close"] - bb_mid) / bb_width
            features["BOLL"] = np.tanh(-bb_pos)
        else:
            features["BOLL"] = 0.0
    except Exception:
        features["BOLL"] = 0.0

    # OBV
    try:
        obv = df_local["OBV"].dropna()
        if len(obv) > 20:
            obv_roll_mean = obv.rolling(20).mean().iloc[-1]
            features["OBV"] = 1 if last.get("OBV", 0) > obv_roll_mean else -1
        else:
            features["OBV"] = 0
    except Exception:
        features["OBV"] = 0

    # CMF
    try:
        features["CMF"] = np.tanh(last.get("CMF", 0) * 5)
    except Exception:
        features["CMF"] = 0.0

    # MFI
    try:
        mfi_val = last.get("MFI", 50)
        features["MFI"] = (mfi_val - 50) / 50.0
        features["MFI"] = max(-1, min(1, features["MFI"]))
    except Exception:
        features["MFI"] = 0.0

    # STOCH
    try:
        if not (pd.isna(last.get("STOCH_K")) or pd.isna(last.get("STOCH_D"))):
            features["STOCH"] = 1 if last["STOCH_K"] > last["STOCH_D"] else -1
        else:
            features["STOCH"] = 0
    except Exception:
        features["STOCH"] = 0

    # CCI
    try:
        features["CCI"] = np.tanh(last.get("CCI", 0) / 200.0)
    except Exception:
        features["CCI"] = 0.0

    # VOL_Z sign
    try:
        volz = last.get("VOL_Z", 0)
        ret = last.get("RET", 0)
        if not pd.isna(volz) and not pd.isna(ret):
            vol_sign = 1 if (volz > 1.5 and ret > 0) else (-1 if (volz > 1.5 and ret < 0) else 0)
        else:
            vol_sign = 0
        features["VOL_Z"] = vol_sign
    except Exception:
        features["VOL_Z"] = 0

    return features