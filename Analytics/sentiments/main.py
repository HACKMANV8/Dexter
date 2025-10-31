#!/usr/bin/env python3
"""
AlphaFusion — Full Indian Financial Sentiment

Main entry point for the sentiment analysis process.
Run as a module: python -m sentiments.main
"""

import logging
import concurrent.futures
import json
import os
import time
from tqdm import tqdm
from typing import Dict

# --- Core Application Imports ---
# These are absolute imports from the 'sentiments' package
from sentiments.data import get_all_index_constituents
from sentiments.sentiment_analysis import load_sentiment_pipeline, analyze_company
from sentiments import config

# -----------------------------
# Logging Setup
# -----------------------------
# Set to ERROR to hide all [INFO] and [WARNING] logs
# You will only see the progress bar and critical failures.
logging.basicConfig(
    level=logging.ERROR,
    format="%(asctime)s [%(levelname)s] [%(name)s] - %(message)s",
    handlers=[
        logging.FileHandler(f"{config.OUTPUT_PREFIX}.log"), # Still log warnings to a file
        logging.StreamHandler() # Show ERROR/CRITICAL in terminal
    ]
)

logger = logging.getLogger(__name__)

def main():
    """
    Main execution function.
    """
    start_time = time.time()
    logger.info("--- AlphaFusion Sentiment Analysis Started ---")
    
    # Ensure cache directory exists
    try:
        os.makedirs(config.CACHE_DIR, exist_ok=True)
    except Exception as e:
        logger.error(f"Failed to create cache directory at {config.CACHE_DIR}: {e}")
        # This is not fatal, but caching will fail.

    # 1. Fetch company lists (uses cache)
    logger.info("Fetching all index constituents...")
    all_companies = get_all_index_constituents()
    if not all_companies:
        logger.critical("No companies fetched. Caching might be broken or sources are down. Exiting.")
        return

    logger.info(f"Total unique companies to analyze: {len(all_companies)}")

    # 2. Load the sentiment model (will auto-select GPU)
    classifier = load_sentiment_pipeline()
    if classifier is None:
        logger.critical("Failed to load sentiment model. Exiting.")
        return

    # 3. Run analysis concurrently
    sentiment_dict: Dict[str, float] = {}
    failed_companies: list[str] = []

    logger.info(f"Starting analysis with {config.MAX_WORKERS} workers...")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=config.MAX_WORKERS) as executor:
        # Create a future for each company analysis
        futures = {executor.submit(analyze_company, ticker, name, classifier): ticker
                   for ticker, name in all_companies.items()}
        
        # Process results as they complete with a TQDM progress bar
        for fut in tqdm(concurrent.futures.as_completed(futures),
                        total=len(futures),
                        desc="Analyzing Companies",
                        unit="stock"):
            ticker = futures[fut]
            try:
                res = fut.result()
                sentiment_dict.update(res)
            except Exception as e:
                # This will still log, as it's an ERROR
                logger.error(f"Task for {ticker} generated an unhandled exception: {e}", exc_info=True)
                failed_companies.append(ticker)

    # 4. Save final results
    output_file = f"{config.OUTPUT_PREFIX}.json"
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(sentiment_dict, f, indent=2, ensure_ascii=False)
        logger.info(f"Successfully saved results to {output_file}")
    except Exception as e:
        logger.error(f"Failed to save final JSON file to {output_file}: {e}")

    end_time = time.time()
    logger.info(f"--- Analysis Complete in {end_time - start_time:.2f} seconds ---")
    
    if failed_companies:
        logger.warning(f"Failed to get results for {len(failed_companies)} companies: {failed_companies}")

if __name__ == "__main__":
    main()

