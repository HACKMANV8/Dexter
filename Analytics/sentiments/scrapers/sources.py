#!/usr/bin/env python3
"""
sources.py - All source-specific scraping functions.

Each function is wrapped in robust error handling to ensure that
a single scraper failure does not stop the entire analysis.
"""

import time
import re
import logging
from bs4 import BeautifulSoup
from typing import List, Tuple

# Use absolute imports from the root 'sentiments' package
from sentiments.utils import safe_get, normalize_text, parse_common_date

# --- Module-level Configuration ---
logger = logging.getLogger(__name__)

# ----------------------------------------------------------
# Each scraper returns: List[(title, snippet, source_name, publish_dt_or_None)]
# ----------------------------------------------------------

def et_topic_scrape(company_name: str, pages: int = 4) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "-")
        for p in range(1, pages + 1):
            url = f"https://economictimes.indiatimes.com/topic/{slug}/news?sort=date&page={p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for each in soup.select(".eachStory"):
                a = each.find("a")
                ptag = each.find("p")
                ttag = each.find("time")
                title = normalize_text(a.get_text()) if a else ""
                snippet = normalize_text(ptag.get_text()) if ptag else ""
                dt = parse_common_date(ttag.get_text()) if ttag else None
                if title:
                    out.append((title, snippet, "EconomicTimes", dt))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'et_topic_scrape' failed for {company_name}: {e}")
    return out


def moneycontrol_tag_scrape(company_name: str, pages: int = 3) -> List[Tuple]:
    out = []
    try:
        slug = company_name.lower().replace(" ", "-")
        for p in range(1, pages + 1):
            url = f"https://www.moneycontrol.com/news/tags/{slug}-{p}.html"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for li in soup.select("li.clearfix"):
                a = li.find("a")
                span = li.find("span", class_="dateline")
                title = normalize_text(a.get_text()) if a else ""
                snippet = ""
                dt = parse_common_date(span.get_text()) if span else None
                if title:
                    out.append((title, snippet, "Moneycontrol", dt))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'moneycontrol_tag_scrape' failed for {company_name}: {e}")
    return out


def business_standard_topic(company_name: str, pages: int = 3) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "-")
        for p in range(1, pages + 1):
            url = f"https://www.business-standard.com/topic/{slug}?page={p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for item in soup.select(".listing-txt"):
                h = item.find("h2")
                ptag = item.find("p")
                time_tag = item.find("span", class_="listing-time")
                title = normalize_text(h.get_text()) if h else ""
                snippet = normalize_text(ptag.get_text()) if ptag else ""
                dt = parse_common_date(time_tag.get_text()) if time_tag else None
                if title:
                    out.append((title, snippet, "BusinessStandard", dt))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'business_standard_topic' failed for {company_name}: {e}")
    return out


def livemint_search(company_name: str, pages: int = 3) -> List[Tuple]:
    out = []
    try:
        slug = company_name.lower().replace(" ", "-")
        for p in range(1, pages + 1):
            url = f"https://www.livemint.com/Search/Link/Keyword/{slug}/page-{p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("h2.headline, h2.headline a"):
                title = normalize_text(h.get_text())
                if title:
                    out.append((title, "", "LiveMint", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'livemint_search' failed for {company_name}: {e}")
    return out


def financialexpress_tag(company_name: str, pages: int = 3) -> List[Tuple]:
    out = []
    try:
        slug = company_name.lower().replace(" ", "-")
        for p in range(1, pages + 1):
            url = f"https://www.financialexpress.com/tag/{slug}/page/{p}/"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("h3 a"):
                title = normalize_text(h.get_text())
                if title:
                    out.append((title, "", "FinancialExpress", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'financialexpress_tag' failed for {company_name}: {e}")
    return out


def cnbctv18_search(company_name: str) -> List[Tuple]:
    out = []
    try:
        slug = company_name.lower().replace(" ", "+")
        url = f"https://www.cnbctv18.com/search/?q={slug}"
        r = safe_get(url)
        if not r:
            return out
        soup = BeautifulSoup(r.text, "html.parser")
        for h in soup.select("a.headline, h2"):
            title = normalize_text(h.get_text())
            if title:
                out.append((title, "", "CNBCTV18", None))
    except Exception as e:
        logger.warning(f"Scraper 'cnbctv18_search' failed for {company_name}: {e}")
    return out


def reuters_search(company_name: str) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        url = f"https://www.reuters.com/site-search/?query={slug}&region=INDIA"
        r = safe_get(url)
        if not r:
            return out
        soup = BeautifulSoup(r.text, "html.parser")
        for h in soup.select("h3, h2"):
            title = normalize_text(h.get_text())
            if title:
                out.append((title, "", "Reuters", None))
    except Exception as e:
        logger.warning(f"Scraper 'reuters_search' failed for {company_name}: {e}")
    return out


def bloomberg_search(company_name: str) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        url = f"https://www.bloomberg.com/search?query={slug}"
        r = safe_get(url)
        if not r:
            return out
        soup = BeautifulSoup(r.text, "html.parser")
        for h in soup.select("h1, h2, h3"):
            title = normalize_text(h.get_text())
            if len(title) > 30:
                out.append((title, "", "Bloomberg", None))
    except Exception as e:
        logger.warning(f"Scraper 'bloomberg_search' failed for {company_name}: {e}")
    return out


def yahoo_finance_search(company_name: str) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        url = f"https://in.finance.yahoo.com/search?p={slug}"
        r = safe_get(url)
        if not r:
            return out
        soup = BeautifulSoup(r.text, "html.parser")
        for h in soup.select("h3 a"):
            title = normalize_text(h.get_text())
            if title:
                out.append((title, "", "YahooFinance", None))
    except Exception as e:
        logger.warning(f"Scraper 'yahoo_finance_search' failed for {company_name}: {e}")
    return out


def timesofindia_search(company_name: str, pages: int = 2) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        for p in range(1, pages + 1):
            url = f"https://timesofindia.indiatimes.com/topic/{slug}/{p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("a[href*='/articleshow/']"):
                title = normalize_text(h.get_text())
                if title:
                    out.append((title, "", "TimesOfIndia", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'timesofindia_search' failed for {company_name}: {e}")
    return out


def indianexpress_search(company_name: str, pages: int = 2) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        for p in range(1, pages + 1):
            url = f"https://indianexpress.com/?s={slug}&_paged={p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("h2.title, h3.title"):
                title = normalize_text(h.get_text())
                if title:
                    out.append((title, "", "IndianExpress", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'indianexpress_search' failed for {company_name}: {e}")
    return out


def thehindu_businessline_search(company_name: str, pages: int = 2) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        for p in range(1, pages + 1):
            url = f"https://www.thehindubusinessline.com/search/?q={slug}&page={p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("h2, h3, a"):
                title = normalize_text(h.get_text())
                if title and len(title) > 10:
                    out.append((title, "", "BusinessLine", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'thehindu_businessline_search' failed for {company_name}: {e}")
    return out


def bloombergquint_search(company_name: str, pages: int = 2) -> List[Tuple]:
    out = []
    try:
        slug = company_name.replace(" ", "+")
        for p in range(1, pages + 1):
            url = f"https://www.bloombergquint.com/search?query={slug}&page={p}"
            r = safe_get(url)
            if not r:
                continue
            soup = BeautifulSoup(r.text, "html.parser")
            for h in soup.select("h2, h3, a"):
                title = normalize_text(h.get_text())
                if title:
                    out.append((title, "", "BloombergQuint", None))
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"Scraper 'bloombergquint_search' failed for {company_name}: {e}")
    return out


def google_news_search(company_name: str, pages: int = 1) -> List[Tuple]:
    out = []
    try:
        q = company_name.replace(" ", "+")
        url = f"https://news.google.com/search?q={q}%20when:7d&hl=en-IN&gl=IN&ceid=IN:en"
        r = safe_get(url)
        if not r:
            return out
        soup = BeautifulSoup(r.text, "html.parser")
        for a in soup.find_all('a'):
            t = a.get_text()
            if t and len(t) > 20:
                out.append((normalize_text(t), "", "GoogleNews", None))
    except Exception as e:
        logger.warning(f"Scraper 'google_news_search' failed for {company_name}: {e}")
    return out


# ----------------------------------------------------------
# Registry: all sources with trust weights
# ----------------------------------------------------------
SOURCE_FUNCS = [
    (et_topic_scrape, "EconomicTimes", 1.0),
    (moneycontrol_tag_scrape, "Moneycontrol", 1.0),
    (business_standard_topic, "BusinessStandard", 0.9),
    (livemint_search, "LiveMint", 0.9),
    (financialexpress_tag, "FinancialExpress", 0.8),
    (cnbctv18_search, "CNBCTV18", 0.8),
    (reuters_search, "Reuters", 1.0),
    (bloomberg_search, "Bloomberg", 1.0),
    (yahoo_finance_search, "YahooFinance", 0.7),
    (timesofindia_search, "TimesOfIndia", 0.6),
    (indianexpress_search, "IndianExpress", 0.6),
    (thehindu_businessline_search, "BusinessLine", 0.7),
    (bloombergquint_search, "BloombergQuint", 0.7),
    (google_news_search, "GoogleNews", 0.9),
]
