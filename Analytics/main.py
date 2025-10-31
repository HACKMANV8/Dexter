# main.py
# This is the main entry point for the program.
# To run: python main.py

# Import the main analysis function from our package
from stock_analyzer import analyze_ticker
# Import the list of tickers from our constants file
from Analytics.Fundamentals.constants import tickers_to_test

if __name__ == '__main__':
    
    print("--- Fundamental Analysis Score Report ---")
    print(f"Analyzing {len(tickers_to_test)} unique stocks from NIFTY 50, NIFTY NEXT 50, and SENSEX 30...")
    print("This will take several minutes. Press Ctrl+C to stop.")
    print(f"\n{'Stock':<15} | {'Score':<10} | {'Recommendation'}")
    print("-" * 60)

    # Added try/except KeyboardInterrupt to allow user to stop the script
    try:
        for ticker in tickers_to_test:
            try:
                # We run the full analysis, but will only print the final results
                # Set index_compare to None to speed it up.
                out = analyze_ticker(ticker, index_compare=None)
                
                stock_name = out['Ticker']
                final_score = out['Scores']['Composite_Score']
                recommendation = out['Recommendation']
                
                print(f"{stock_name:<15} | {final_score:<10.2f} | {recommendation}")

            except Exception as e:
                print(f"Could not analyze {ticker}: {str(e)[:50]}...") # Print truncated error
    
    except KeyboardInterrupt:
        print("\n--- Analysis stopped by user ---")

    print("-" * 60)
    print("Score Legend: 80+ (Strong Buy), 65+ (Buy), 50+ (Hold), 35+ (Reduce), <35 (Strong Sell)")
