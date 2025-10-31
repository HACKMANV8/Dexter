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
    
    # Fallback to get more data if needed for indicators
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