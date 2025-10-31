# main.py
# This is the main entry point for the application.

import time
import datetime as dt
import pandas as pd
import numpy as np # Keep numpy import as it's a core lib

# --- Local Imports ---
# Import all configuration variables and ticker lists
from config import * # Import all helper functions from their respective files
from utils import is_market_open, get_valid_indicator_count
from data_fetch import pull_history
from indicators import compute_indicators
from features import normalize_features
from scoring import adapt_weights, aggregate_score, compute_confidence
from signals import recommend_signal, smart_stop


# -------- MAIN LOOP (polling) ----------
def run_realtime(poll_interval=POLL_INTERVAL):

    # <-- MODIFIED: Initialize as an empty dict to hold all tickers
    smoothed_scores = {} 
    
    market_status = "OPEN" if is_market_open() else "CLOSED"
    print(f"Starting realtime technical scorer. Initial market status: {market_status}. Ctrl+C to stop.")
    
    # List of technical indicator columns, excluding basic OHLCV
    INDICATOR_COLS = [c for c in REQUIRED_COLS if c not in ["Close", "High", "Low", "Volume", "RET", "RET_Z", "VOL_Z"]]

    # <-- MODIFIED: Define the list of indices to run
    indices_to_run = [
        ("NIFTY 50", NIFTY_50_TICKERS),
        ("NIFTY NEXT 50", NIFTY_NEXT_50_TICKERS),
        ("SENSEX 30", SENSEX_30_TICKERS)
    ]

    while True:
        try:
            # --- DYNAMIC PARAMETER SELECTION ---
            is_open = is_market_open()
            if is_open:
                interval = '1m'
                period = '7d'
                data_mode = "REAL-TIME (1m)"
            else:
                # Use 1 year of daily data for full indicator calculation (SMA200 requires > 200 bars)
                interval = '1d'
                period = '1y' 
                data_mode = "HISTORICAL (1d)"

            # Check if the market status changed since the last poll
            new_status = "OPEN" if is_open else "CLOSED"
            if new_status != market_status:
                print(f"\n[STATUS CHANGE] Market is now {new_status}. Switching to {data_mode} mode.")
                market_status = new_status
            
            print("\n" + "~"*85)
            print(f"CYCLE START: {data_mode} analysis at {dt.datetime.now(MARKET_TIMEZONE).strftime('%Y-%m-%d %H:%M:%S %Z')}")
            print("~"*85)

            # <-- MODIFIED: Loop through each defined index
            for index_name, ticker_list in indices_to_run:
                
                # <-- MODIFIED: Reset lists for each index
                results_summary = []
                data_summary = [] # <-- NEW: List to hold the raw data
                anomaly_reports = []
                success_count = 0
                
                print(f"\nProcessing {index_name} ({len(ticker_list)} stocks)...")

                # Iterate through all tickers in the *current* list
                for i, ticker in enumerate(ticker_list):
                    print(f"  Processing Ticker {i+1}/{len(ticker_list)}: {ticker}...", end='\r')
                    
                    try:
                        # 1. Fetch data using dynamic parameters
                        df = pull_history(ticker, interval, period)
                        
                        # 2. ISOLATE THE LAST COMPLETE BAR (Core logic to prevent using today's incomplete bar)
                        df_to_analyze = df.copy()
                        
                        # If market is closed AND we have at least 2 bars, discard the last row.
                        # This logic is mainly for intraday intervals when the market just closed.
                        if not is_open and interval != '1d' and len(df_to_analyze) >= 2:
                            df_to_analyze = df_to_analyze.iloc[:-1]
                        elif len(df_to_analyze) < 1:
                            # Skip if no data remains
                            print(f"  {ticker} skipped: No data after pre-analysis.")
                            continue

                        # 3. Compute indicators on the cleaned or current dataset
                        df_computed = compute_indicators(df_to_analyze)

                        try:
                            # This now uses the last available data row regardless of NaNs
                            features = normalize_features(df_computed)
                        except Exception as e:
                            print(f"  {ticker} Failed: Critical Error in feature normalization, skipping: {e}")
                            continue
                        
                        latest_row = df_computed.iloc[-1]
                        
                        # DIAGNOSTIC CHECK
                        valid_count = get_valid_indicator_count(latest_row, INDICATOR_COLS)
                        
                        if valid_count < 8: # <— threshold for usable technical context
                            print(f"  {ticker} skipped: too few valid indicators ({valid_count}).")
                            continue
                        
                        # Ensure features dict gets the latest Z-scores
                        features["RET_Z"] = latest_row.get("RET_Z", 0)
                        features["VOL_Z"] = latest_row.get("VOL_Z", 0)

                        weights = BASE_WEIGHTS.copy()
                        weights = adapt_weights(weights, features, df_computed)

                        score_raw, breakdown = aggregate_score(features, weights)
                        
                        # Apply EWMA smoothing
                        prev_score = smoothed_scores.get(ticker) # <-- MODIFIED: .get() works perfectly with an empty dict
                        # <-- FIX: Correctly handle None or NaN for initialization
                        if prev_score is None or pd.isna(prev_score):
                            smoothed_scores[ticker] = score_raw
                        else:
                            smoothed_scores[ticker] = EWMA_ALPHA * score_raw + (1 - EWMA_ALPHA) * prev_score


                        confidence = compute_confidence(breakdown, features)
                        signal = recommend_signal(smoothed_scores[ticker], confidence, latest_row, breakdown)
                        stop_price = smart_stop(latest_row, signal)

                        # --- BUILD DATA FOR BOTH TABLES ---

                        # 1. Append to Score Table
                        results_summary.append({
                            "Ticker": ticker,
                            "Price": latest_row['Close'],
                            "Score": smoothed_scores[ticker],
                            "Conf": confidence,
                            "Signal": signal,
                            "Stop": stop_price,
                            "Trend_Contribution": breakdown.get("SMA_trend", 0.0) + breakdown.get("EMA_trend", 0.0) + breakdown.get("MACD", 0.0)
                        })
                        
                        # 2. Append to Data Table
                        data_summary.append({
                            "Ticker": ticker,
                            "Price": latest_row['Close'],
                            "Open": latest_row.get('Open', 0.0),
                            "High": latest_row.get('High', 0.0),
                            "Low": latest_row.get('Low', 0.0),
                            "Volume": latest_row.get('Volume', 0),
                            "%Chg": latest_row.get('RET', 0.0) * 100.0 # Convert return to percentage
                        })
                        
                        success_count += 1
                        # Note the timestamp of the bar being analyzed (last complete bar)
                        # <-- FIX: Added safe try/except for strftime
                        try:
                            last_bar_time = latest_row.name.strftime('%Y-%m-%d %H:%M:%S')
                        except AttributeError:
                            last_bar_time = str(latest_row.name) # Fallback if index isn't datetime

                        print(f"  Processing Ticker {i+1}/{len(ticker_list)}: {ticker}... SUCCESS (Price: {latest_row['Close']:.2f}, Last Bar: {last_bar_time}, Valid Indicators: {valid_count}/{len(INDICATOR_COLS)})")
                        
                        # Check for anomalies and store report
                        if abs(features.get("RET_Z", 0)) > ANOMALY_Z_THRESHOLD:
                            anomaly_reports.append(f"!!! {ticker} Anomaly: return z-score high: {features['RET_Z']:.2f}")
                        if abs(features.get("VOL_Z", 0)) > ANOMALY_Z_THRESHOLD:
                            anomaly_reports.append(f"!!! {ticker} Anomaly: volume z-score high: {features['VOL_Z']:.2f}")

                    except Exception as e:
                        print(f"  {ticker} Failed: Error processing ticker data ({e}).")
                        
                
                # --- CLEAN OUTPUT GENERATION (FOR THIS INDEX) ---
                
                print("\n" + "="*85)
                print(f"{index_name} COMPLETE: Processed {success_count}/{len(ticker_list)} stocks.")
                print("="*85)

                if results_summary: # Check if we have *any* data to print
                    t = dt.datetime.now(MARKET_TIMEZONE).strftime("%Y-%m-%d %H:%M:%S %Z")

                    # --- 1. DATA TABLE ---
                    df_data = pd.DataFrame(data_summary)
                    df_data = df_data.sort_values(by='Ticker').reset_index(drop=True)
                    
                    print(f"\n[{t}] {index_name} DATA SUMMARY ({data_mode})")
                    # Adjust width based on columns
                    print("-"*(len(df_data.columns) * 12)) 
                    print(df_data.to_string(
                        index=False,
                        formatters={
                            'Price': '{:,.2f}'.format,
                            'Open': '{:,.2f}'.format,
                            'High': '{:,.2f}'.format,
                            'Low': '{:,.2f}'.format,
                            'Volume': '{:,.0f}'.format, # No decimals for volume
                            '%Chg': '{:+.2f}'.format   # 2 decimals for % change, with sign
                        }
                    ))
                    print("-"*(len(df_data.columns) * 12))


                    # --- 2. SCORE TABLE ---
                    df_score = pd.DataFrame(results_summary)
                    df_score = df_score.sort_values(by='Score', ascending=False)
                    df_score = df_score.drop(columns=['Trend_Contribution']).reset_index(drop=True)
                    
                    print(f"\n[{t}] {index_name} TECHNICAL SCOREBOARD ({data_mode} - Sorted by Score)")
                    print("-"*(len(df_score.columns) * 12 + 10)) 
                    print(df_score.to_string(index=False, float_format="%.2f")) # Existing format is fine here
                    print("-"*(len(df_score.columns) * 12 + 10))

                    # --- 3. ANOMALY REPORTS ---
                    if anomaly_reports:
                        print(f"\n--- {index_name} ANOMALY REPORTS (High Volatility/Returns) ---")
                        for report in anomaly_reports:
                            print(report)
                        print("-------------------------------------------------")
                else:
                    print(f"\n[{dt.datetime.now(MARKET_TIMEZONE).strftime('%Y-%m-%d %H:%M:%S %Z')}] No stocks could be processed for {index_name} in this cycle.")

            # <-- MODIFIED: Sleep only *after* all indices are processed
            print(f"\nFULL CYCLE COMPLETE. Waiting {poll_interval} seconds...")
            time.sleep(poll_interval)
        
        except KeyboardInterrupt:
            print("\nUser requested stop. Exiting...")
            break
        except Exception as e:
            print(f"FATAL ERROR in main loop: {e}. Restarting loop in {poll_interval}s...")
            time.sleep(poll_interval)


if __name__ == "__main__":
    # <-- MODIFIED: No longer passes tickers list
    run_realtime()