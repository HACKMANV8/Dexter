#!/usr/bin/env python3
"""
AlphaFusion — Full Indian Financial Sentiment (NIFTY100 + Sensex)

This is the main entry point for the sentiment analysis application.
It orchestrates the flow:
1. Loads constituent data (using caching)
2. Loads the sentiment analysis model (using GPU if available)
3. Runs analysis for all companies in parallel
4. Saves the final sentiment scores to a JSON file

To run this project, navigate to the directory *above* 'sentiments'
(e.g., your 'AlphaFusion' folder) and run it as a module:
    
    python -m sentiments.main
"""

import logging
import concurrent.futures
import json
import time
from pathlib import Path
from tqdm import tqdm
from typing import Dict

# Import from our project's modules using absolute paths
from sentiments.data import get_all_index_constituents
from sentiments.sentiment_analysis import load_sentiment_pipeline, analyze_company
from sentiments.config import MAX_WORKERS, OUTPUT_PREFIX, CACHE_DIR

# --- Configure Root Logger ---
# This is the ONLY file where logging.basicConfig() should be called.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        # You could add logging.FileHandler("app.log") here
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def ensure_directories_exist():
    """
    Ensures that all necessary directories (like the cache) exist.
    """
    try:
        Path(CACHE_DIR).mkdir(parents=True, exist_ok=True)
    except Exception as e:
        logger.error(f"Could not create directory {CACHE_DIR}: {e}")
        # This is a critical error, as caching will fail.
        raise

def main():
    """
    Main execution function.
    """
    start_time = time.time()
    logger.info("--- Starting AlphaFusion Sentiment Analysis ---")

    # 1. Setup
    ensure_directories_exist()

    # 2. Fetch Company Data
    # This now uses the cached function from data/__init__.py
    logger.info("Loading constituent data...")
    all_companies = get_all_index_constituents()
    
    if not all_companies:
        logger.critical("No company data loaded. Check 'data/constituents.py'. Exiting.")
        return
        
    logger.info(f"Loaded {len(all_companies)} unique companies.")

    # 3. Load Sentiment Model
    # This now uses the GPU-aware function from sentiment_analysis/model.py
    classifier = load_sentiment_pipeline()
    if classifier is None:
        logger.critical("Failed to load sentiment model. Exiting.")
        return

    # 4. Run Parallel Analysis
    sentiment_dict: Dict[str, float] = {}
    failed_companies: list[str] = []

    logger.info("Starting sentiment analysis...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Create a dictionary of {future: ticker}
        futures = {
            executor.submit(analyze_company, ticker, name, classifier): ticker
            for ticker, name in all_companies.items()
        }

        # Process results as they complete
        for fut in tqdm(concurrent.futures.as_completed(futures),
                        total=len(futures),
                        desc="Analyzing Companies"):
            
            ticker = futures[fut]
            try:
                res = fut.result()
                sentiment_dict.update(res)
            except Exception as e:
                logger.warning(f"Task for {ticker} failed with exception: {e}", exc_info=False)
                failed_companies.append(ticker)

    logger.info("Analysis complete.")

    # 5. Save Results
    # Use the output prefix from config.py for a dated filename
    output_file = Path(f"{OUTPUT_PREFIX}.json")
    try:
        with open(output_file, "w", encoding='utf-8') as f:
            json.dump(sentiment_dict, f, indent=2, ensure_ascii=False)
        logger.info(f"Successfully saved results to {output_file}")
    except Exception as e:
        logger.error(f"Failed to save results to {output_file}: {e}")

    # 6. Final Report
    if failed_companies:
        logger.warning(f"Failed to analyze {len(failed_companies)} companies: {failed_companies}")

    end_time = time.time()
    logger.info(f"--- Total execution time: {end_time - start_time:.2f} seconds ---")


if __name__ == "__main__":
    main()

