# data_fetch.py
# Contains function for fetching historical data.

import yfinance as yf
import pandas as pd
import numpy as np

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

    # If yfinance returned nothing
    if df is None or df.empty:
        raise RuntimeError(f"⚠️ No data returned by yfinance for ticker: {ticker}")

    # --- 🧩 Handle MultiIndex columns robustly ---
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = [("_".join(map(str, c))).split("_")[0] for c in df.columns]

    # --- 🧩 Normalize capitalization and spacing ---
    df.columns = [str(c).strip().capitalize() for c in df.columns]

    # --- 🧩 Ensure all required OHLCV columns exist ---
    required_cols_price = ["Open", "High", "Low", "Close", "Volume"]
    missing = [c for c in required_cols_price if c not in df.columns]
    if missing:
        if "Adj close" in df.columns and "Close" not in df.columns:
            df["Close"] = df["Adj close"]
        missing = [c for c in required_cols_price if c not in df.columns]
        if missing:
            raise RuntimeError(f"❌ Still missing columns {missing} for {ticker} after normalization.")

    # --- 🧩 Drop invalid rows ---
    df = df.dropna(subset=required_cols_price)
    if df.empty:
        raise RuntimeError(f"⚠️ All OHLCV data empty for {ticker} after dropna.")
    
    # FIX: Ensure we have at least 200 bars for indicator reliability
    # This was previously indented incorrectly under `if df.empty:`
    if len(df) < 200:
        try:
            # Try fetching a longer daily history if current data is too short
            df_daily = yf.download(ticker, period="1y", interval="1d", progress=False, auto_adjust=False)
            if not df_daily.empty:
                 # Normalize columns for the daily data just in case
                if isinstance(df_daily.columns, pd.MultiIndex):
                    df_daily.columns = [("_".join(map(str, c))).split("_")[0] for c in df_daily.columns]
                df_daily.columns = [str(c).strip().capitalize() for c in df_daily.columns]
                if "Adj close" in df_daily.columns and "Close" not in df_daily.columns:
                    df_daily["Close"] = df_daily["Adj close"]
                
                # If daily data is longer, use it. Otherwise, stick with the original short df.
                if len(df_daily) > len(df):
                    df = df_daily.dropna(subset=required_cols_price)

        except Exception:
            pass # If fallback fetch fails, proceed with the short dataframe

    return df