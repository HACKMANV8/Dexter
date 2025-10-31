# File: E:\test2\backend\technical_analyzer\main.py
# This script will now run index analysis by default.

import json
import pandas as pd

# Import all our custom modules (with NO dots)
from config import NIFTY_50_TICKERS, NIFTY_NEXT_50_TICKERS, SENSEX_30_TICKERS, BASE_WEIGHTS, NIFTY_100_TICKERS
from utils import is_market_open, prepare_chart_data
from data_fetch import pull_history
from indicators import compute_indicators
from features import normalize_features
from scoring import adapt_weights, aggregate_score, compute_confidence
from signals import recommend_signal, smart_stop, interpret_score

def analyze_stock(ticker, print_results=True):
    """
    Runs the full analysis for a single stock ticker.
    - PRINTS the results if print_results=True.
    - RETURNS the key analysis data for aggregation.
    """
    try:
        # --- 1. Get Data for Scoring ---
        is_open = is_market_open()
        if is_open:
            interval = '1m'
            period = '7d'
            data_mode = "REAL-TIME (1m)"
        else:
            interval = '1d'
            period = '1y' 
            data_mode = "HISTORICAL (1d)"
            
        if print_results:
            print(f"\n--- Analyzing {ticker} ({data_mode}) ---")
        else:
            # Print a compact version for index analysis
            print(f"  > Analyzing {ticker}...", end='', flush=True)

        df = pull_history(ticker, interval, period)

        df_to_analyze = df.copy()
        if not is_open and interval != '1d' and len(df_to_analyze) >= 2:
            df_to_analyze = df_to_analyze.iloc[:-1]
        
        if df_to_analyze.empty:
            if print_results: print("No data to analyze.")
            return {"error": "No data to analyze."}

        # --- 2. Compute Score ---
        df_computed = compute_indicators(df_to_analyze)
        features = normalize_features(df_computed)
        latest_row = df_computed.iloc[-1]
        
        features["RET_Z"] = latest_row.get("RET_Z", 0)
        features["VOL_Z"] = latest_row.get("VOL_Z", 0)

        weights = adapt_weights(BASE_WEIGHTS.copy(), features, df_computed)
        final_score, breakdown = aggregate_score(features, weights)
        confidence = compute_confidence(breakdown, features)
        signal = recommend_signal(final_score, confidence, latest_row, breakdown)
        stop_price = smart_stop(latest_row, signal)

        # --- 3. Print All Results (if specified) ---
        if print_results:
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

            print("\n--- 🎯 TECHNICAL ANALYSIS ---")
            print(f"  Score (0-100):   {final_score:.2f}")
            print(f"  Interpretation:  {interpret_score(final_score)}")
            print(f"  Signal:          {signal}")
            print(f"  Confidence:      {confidence*100:.1f}%")
            print(f"  Smart Stop:      {stop_price:.2f}")

            print("\n--- ⚠️ IMPORTANT DISCLAIMER ---")
            print("  This analysis is purely TECHNICAL (based on price, volume, and momentum).")
            print("  It is NOT fundamental analysis (e.g., P/E, revenue, debt).")
            print("  'BUY'/'SELL' signals refer to technical indicators, not financial advice.")
            print("  Do your own research.")

            # --- 6. Fetch, Process, and SAVE Chart Data to JSON File ---
            print(f"\n📈 Preparing chart data for {ticker}...")
            
            try:
                df_chart_1d = pull_history(ticker, interval='5m', period='1d')
            except Exception as e:
                print(f"Could not fetch 1-Day chart data: {e}")
                df_chart_1d = pd.DataFrame() 

            try:
                df_chart_1y = pull_history(ticker, interval='1d', period='1y')
            except Exception as e:
                print(f"Could not fetch 1-Year chart data: {e}")
                df_chart_1y = pd.DataFrame()
                
            chart_data_dict = prepare_chart_data(ticker, df_chart_1d, df_chart_1y)
            chart_json = json.dumps(chart_data_dict, indent=2)

            output_filename = f"{ticker}_chart_data.json"
            try:
                with open(output_filename, "w") as f:
                    f.write(chart_json)
                print(f"\n✅ Successfully saved chart data to: {output_filename}")
            except Exception as e:
                print(f"\n❌ Failed to save chart data to file: {e}")
        
        # This print is for the index analysis progress
        if not print_results:
             print(" Done.")

        # --- 7. Return key data for index aggregation ---
        return {
            "score": final_score,
            "signal": signal
        }

    except Exception as e:
        if print_results:
            print(f"\n❌ An error occurred while analyzing {ticker}: {e}")
        else:
            print(f" Error: {e}")
        return {"error": str(e)}

def analyze_index(ticker_list: list):
    """
    Analyzes all stocks in a given list and returns an aggregated score.
    """
    valid_stocks = 0
    total_score = 0
    signal_counts = { "BUY": 0, "HOLD": 0, "TIGHTEN_STOP": 0, "EXIT": 0, "VIGILANCE_HIGH_VOL": 0, "EXIT_ANOMALY": 0 }
    total_stocks_in_list = len(ticker_list)
    
    for i, ticker in enumerate(ticker_list):
        print(f"\nAnalyzing {i+1}/{total_stocks_in_list}: ", end='', flush=True)
        
        # Call analyze_stock, but tell it NOT to print the full report
        analysis = analyze_stock(ticker, print_results=False) 
        
        if "error" not in analysis:
            total_score += analysis.get('score', 50)
            signal = analysis.get('signal', 'HOLD')
            if signal in signal_counts:
                signal_counts[signal] += 1
            else:
                signal_counts[signal] = 1 # Should not happen, but safe
            valid_stocks += 1
        # Error is already printed by analyze_stock

    if valid_stocks == 0:
        return {"error": "Could not analyze any stocks in the index."}

    average_score = total_score / valid_stocks
    overall_interpretation = interpret_score(average_score)
    
    # Return the final summary
    return {
        "total_stocks_in_list": total_stocks_in_list,
        "total_stocks_analyzed": valid_stocks,
        "average_score": average_score,
        "overall_interpretation": overall_interpretation,
        "signal_distribution": signal_counts
    }

def print_index_summary(summary, name):
    """Prints a clean summary for the index analysis."""
    if "error" in summary:
        print(f"\n❌ Error analyzing {name}: {summary['error']}")
        return
    
    print("\n" + "="*40)
    print(f"    {name} - ANALYSIS SUMMARY")
    print("="*40)
    print(f"  Stocks Analyzed: {summary['total_stocks_analyzed']} / {summary['total_stocks_in_list']}")
    print(f"  Average Score:   {summary['average_score']:.2f} / 100")
    print(f"  Interpretation:  {summary['overall_interpretation']}")
    print("\n  --- Signal Distribution ---")
    for signal, count in summary['signal_distribution'].items():
        if count > 0:
            print(f"  {signal:<18}: {count}")
    print("="*40)

# --- THIS IS THE NEW MAIN EXECUTION BLOCK ---
if __name__ == "__main__":
    
    # --- 1. DEFAULT ANALYSIS (RUNS ONCE) ---
    print("="*50)
    print("   RUNNING DEFAULT INDEX ANALYSIS (NIFTY 50/100, SENSEX)")
    print("="*50)

    # Run NIFTY 50
    print("\nAnalyzing NIFTY 50... This will take a moment.")
    n50_summary = analyze_index(NIFTY_50_TICKERS)
    print_index_summary(n50_summary, "NIFTY 50")

    # Run NIFTY 100
    print("\nAnalyzing NIFTY 100... This will take several minutes.")
    n100_summary = analyze_index(NIFTY_100_TICKERS)
    print_index_summary(n100_summary, "NIFTY 100")

    # Run SENSEX 30
    print("\nAnalyzing SENSEX 30... This will take a moment.")
    sensex_summary = analyze_index(SENSEX_30_TICKERS)
    print_index_summary(sensex_summary, "SENSEX 30")

    print("\n" + "="*50)
    print("           DEFAULT ANALYSIS COMPLETE")
    print("="*50)
    
    # --- 2. ON-DEMAND ANALYSIS (LOOPS) ---
    while True:
        print("\n" + "="*50)
        print("         OPTIONAL: ANALYZE A SINGLE STOCK")
        print("="*50)
        ticker_input = input("Enter a stock ticker (e.g., RELIANCE.NS) or 'q' to quit: ")
        
        if ticker_input.lower() == 'q':
            print("Exiting...")
            break # Exit the while loop and the script
            
        if not ticker_input:
            print("Invalid input.")
            continue # Ask again
        
        # Standardize ticker
        ticker = ticker_input.upper().strip()
        
        # Auto-suffixing logic
        if ".NS" not in ticker and ".BO" not in ticker and not any(c.isdigit() for c in ticker):
            if ticker in (t.split('.')[0] for t in NIFTY_50_TICKERS) or \
               ticker in (t.split('.')[0] for t in NIFTY_NEXT_50_TICKERS):
                 ticker += ".NS"
                 print(f"(Auto-suffixed to {ticker})")
            elif ticker in (t.split('.')[0] for t in SENSEX_30_TICKERS):
                 ticker += ".BO"
                 print(f"(Auto-suffixed to {ticker})")
        
        # Call analyze_stock and tell it to print the full report
        analyze_stock(ticker, print_results=True)