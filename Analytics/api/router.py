# Analytics/api/router.py
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Any, Dict

router = APIRouter()
EXEC = ThreadPoolExecutor(max_workers=6)

# -------------------------
# Helpers & config
# -------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]  # Analytics/
SENTIMENT_CACHE_FILE = PROJECT_ROOT / "technical" / "alphafusion_full_sentiment_202510.log"  # or cache/<file>.json
# If you store JSON in cache/, adjust path:
ALT_CACHE_JSON = PROJECT_ROOT / "cache" / "sentiment_latest.json"

# -------------------------
# 1) FUNDAMENTAL endpoint (real-time)
# -------------------------
@router.get("/fundamental")
def fundamental(ticker: str, index: Optional[str] = None):
    """
    Real-time fundamentals: uses fetcher -> scoring -> quick result.
    Calls: Analytics/fundamental/stock_analyzer/fetcher.py and scoring.py
    """
    try:
        # Import inside function to avoid import-time costs
        from Analytics.fundamental.stock_analyzer.fetcher import fetch_financial_data
        from Analytics.fundamental.stock_analyzer.scoring import score_fundamentals, recommendation_from_score
        from Analytics.fundamental.stock_analyzer.analysis import FundamentalAnalyzer

        # Use fetcher directly to get the latest live data
        series = fetch_financial_data(ticker)
        if series is None:
            raise HTTPException(status_code=404, detail=f"Could not fetch live data for {ticker}")

        # Compute metrics quickly using the same logic as your class (we can re-use class)
        fa = FundamentalAnalyzer(ticker)  # this will call fetcher internally too; we could pass series if you add that helper
        metrics = fa.calculate_all_metrics()

        scores = score_fundamentals(metrics)
        rec = recommendation_from_score(scores["Composite_Score"])

        # Convert pandas.Series to plain dict
        metrics_dict = metrics.to_dict() if hasattr(metrics, "to_dict") else dict(metrics)

        return {"ticker": ticker.upper(), "metrics": metrics_dict, "scores": scores, "recommendation": rec}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# 2) TECHNICAL endpoint (real-time)
# -------------------------
@router.get("/technical")
def technical(ticker: str, period_days: int = 90):
    """
    Real-time technical: uses Analytics/technical/* to fetch recent price series and compute indicators.
    Expected functions in your technical folder:
      - data_fetch.get_price_series(ticker, days) -> pandas.DataFrame or dict
      - indicators.get_rsi(series, window=14)
      - indicators.get_macd(series)
    """
    try:
        # Lazy import
        from Analytics.technical import data_fetch, indicators, signals

        # fetch price series (OHLC) for the requested days
        price_df = data_fetch.get_price_series(ticker, days=period_days)
        if price_df is None:
            raise HTTPException(status_code=404, detail=f"No price data for {ticker}")

        # Calculate indicators (assumes functions exist)
        rsi_series = indicators.get_rsi(price_df["close"])
        macd_res = indicators.get_macd(price_df["close"])
        buy_sell = signals.generate_signals(price_df, macd_res) if hasattr(signals, "generate_signals") else {}

        # Convert to serializable objects
        sample = {
            "ticker": ticker.upper(),
            "latest_close": float(price_df["close"].iloc[-1]),
            "rsi_latest": float(rsi_series.iloc[-1]) if hasattr(rsi_series, "iloc") else rsi_series,
            "macd": {k: v.tolist() if hasattr(v, "tolist") else v for k, v in macd_res.items()},
            "signals": buy_sell
        }
        return sample

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# 3) SENTIMENT endpoints (cached)
# -------------------------
@router.get("/sentiment")
def sentiment(ticker: Optional[str] = None):
    """
    Returns precomputed sentiment dict (file-based). If ticker provided, returns single entry.
    Not real-time: uses cached JSON/log written by your sentiment main.
    """
    # choose which file exists
    path = SENTIMENT_CACHE_FILE if SENTIMENT_CACHE_FILE.exists() else (ALT_CACHE_JSON if ALT_CACHE_JSON.exists() else None)
    if not path:
        raise HTTPException(status_code=404, detail="No sentiment cache file found. Run sentiment main to generate one.")

    try:
        # Some logs are .log but contain JSON; try to load robustly
        text = path.read_text(encoding="utf-8")
        # If file is a JSON file, load it
        try:
            sentiment_dict = json.loads(text)
        except json.JSONDecodeError:
            # attempt to find a JSON object inside log file
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                sentiment_dict = json.loads(text[start:end+1])
            else:
                raise

        if ticker:
            t = ticker.upper()
            if t in sentiment_dict:
                return {t: sentiment_dict[t]}
            else:
                raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found in sentiment cache")
        return sentiment_dict

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read sentiment cache: {e}")

# Manual refresh endpoint (runs sentiment main to regenerate cache) - protected in prod
@router.post("/sentiment/refresh")
def sentiment_refresh(background: BackgroundTasks):
    """
    Trigger sentiment recomputation. This will spawn the sentiment main process in background.
    Note: This can be heavy (loads models), so use sparingly.
    """
    try:
        def _run_sentiment_main():
            # call the existing sentiment main script
            import subprocess, sys
            main_script = PROJECT_ROOT / "sentiments" / "sentiment_analysis" / "main.py"
            if main_script.exists():
                subprocess.run([sys.executable, str(main_script)], check=False)
            else:
                # fallback: call your analyzer module's entrypoint if available
                try:
                    from Analytics.sentiments.sentiment_analysis import main as sentiment_main_fn
                    sentiment_main_fn()
                except Exception:
                    pass

        background.add_task(_run_sentiment_main)
        return {"status": "started", "message": "Sentiment recomputation started in background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
