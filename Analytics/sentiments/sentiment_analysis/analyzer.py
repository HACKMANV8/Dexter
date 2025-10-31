import logging
from datetime import datetime
from sentiments.scrapers.sources import SOURCE_FUNCS
from sentiments.utils import normalize_text, hash_text, is_in_current_month
from sentiments.config import MONTH_LOWER, MONTH_UPPER

def recency_weight(published_dt):
    if not published_dt:
        return 0.5
    days = (datetime.now() - published_dt).days
    if published_dt < MONTH_LOWER or published_dt >= MONTH_UPPER:
        return 0.01
    total_days = (MONTH_UPPER - MONTH_LOWER).days or 30
    w = 1.0 - (days / total_days) * 0.8
    return max(0.2, min(1.0, w))

def article_weight(source_weight, published_dt):
    return source_weight * recency_weight(published_dt)

def gather_articles_for_company(company_name):
    articles = []
    for func, src_name, src_w in SOURCE_FUNCS:
        try:
            for title, snippet, sname, dt in func(company_name):
                articles.append({
                    "title": normalize_text(title),
                    "snippet": normalize_text(snippet),
                    "source": sname or src_name,
                    "source_weight": src_w,
                    "published": dt,
                })
        except Exception as e:
            logging.debug(f"Source {func.__name__} failed for {company_name}: {e}")

    unique = {hash_text(a["title"] + "|" + (a["snippet"] or "")): a for a in articles if a["title"]}
    return list(unique.values())

def analyze_company(ticker, company_name, classifier):
    arts = gather_articles_for_company(company_name)
    filtered = [a for a in arts if a["published"] is None or is_in_current_month(a["published"])]

    if not filtered:
        filtered = [{"title": company_name, "snippet": "", "source": "Fallback", "source_weight": 0.3, "published": None}]

    texts = [((a["title"] + ". " + a["snippet"]).strip()[:512], a) for a in filtered]

    weighted_sum = total_weight = 0.0
    for text, a in texts:
        pred = classifier(text)[0]
        lbl = pred["label"].lower()
        polarity = 1 if "positive" in lbl else -1 if "negative" in lbl else 0
        w = article_weight(a["source_weight"], a["published"])
        weighted_sum += polarity * w
        total_weight += w

    return {ticker: round(weighted_sum / total_weight if total_weight else 0.0, 3)}
