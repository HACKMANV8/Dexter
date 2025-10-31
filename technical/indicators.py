# indicators.py
# Contains function for computing technical indicators.

import pandas_ta as ta
import pandas as pd
import numpy as np

def compute_indicators(df):
    """
    Append indicators using pandas_ta in-place, then map to the column names expected
    by the rest of the script.
    """
    df = df.copy()
    df = df.sort_index()

    # append moving averages (including 200)
    try:
        df.ta.sma(length=20, append=True)
        df.ta.sma(length=50, append=True)
        df.ta.sma(length=200, append=True)
    except Exception:
        pass

    # EMAs
    try:
        df.ta.ema(length=12, append=True)
        df.ta.ema(length=26, append=True)
    except Exception:
        pass

    # MACD / ADX / RSI / ATR / BBANDS / OBV / CMF / MFI / STOCH / CCI
    for fn, kwargs in [
        ("macd", {}),
        ("adx", {}),
        ("rsi", {"length": 14}),
        ("atr", {"length": 14}),
        ("bbands", {"length": 20, "std": 2}),
        ("obv", {}),
        ("cmf", {"length": 20}),
        ("mfi", {"length": 14}),
        ("stoch", {}),
        ("cci", {"length": 20}),
    ]:
        try:
            getattr(df.ta, fn)(**kwargs, append=True)
        except Exception:
            pass

    # Map common pandas_ta output names into our canonical names (safe get with fallback)
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

    # returns and zscores
    df["RET"] = df["Close"].pct_change().fillna(0)

    # Rolling stats need enough history; compute if possible, else fill with 0
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
    
    # Fill any remaining NaNs in Z-scores with 0
    df["RET_Z"] = df["RET_Z"].fillna(0.0)
    df["VOL_Z"] = df["VOL_Z"].fillna(0.0)

    return df
