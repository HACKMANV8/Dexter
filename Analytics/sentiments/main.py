import logging, concurrent.futures
from tqdm import tqdm
from sentiments.data.constituents import get_nifty100_from_nse, get_nifty100_from_wikipedia, get_sensex_from_wikipedia
from sentiments.sentiment_analysis.model import load_sentiment_pipeline
from sentiments.sentiment_analysis.analyzer import analyze_company
from sentiments.config import MAX_WORKERS

def main():
    nifty100 = get_nifty100_from_nse() or get_nifty100_from_wikipedia()
    sensex = get_sensex_from_wikipedia()
    all_companies = {**nifty100, **{k:v for k,v in sensex.items() if k not in nifty100}}

    logging.info(f"Total companies to analyze: {len(all_companies)}")
    classifier = load_sentiment_pipeline()
    sentiment_dict = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futures = {ex.submit(analyze_company, t, n, classifier): t for t, n in all_companies.items()}
        for fut in tqdm(concurrent.futures.as_completed(futures), total=len(futures), desc="Companies"):
            res = fut.result()
            sentiment_dict.update(res)

    print("\nFinal sentiment dictionary:")
    print(sentiment_dict)

if __name__ == "__main__":
    main()
