import re, time, hashlib, requests, pandas as pd, logging
from datetime import datetime
from sentiments.config import HEADERS, REQUEST_TIMEOUT, MONTH_LOWER, MONTH_UPPER

def safe_get(url, tries=2, sleep=1.0):
    for attempt in range(tries):
        try:
            r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
            r.raise_for_status()
            return r
        except Exception as e:
            if attempt + 1 == tries:
                logging.debug(f"safe_get fail: {url} error: {e}")
                return None
            time.sleep(sleep)

def normalize_text(t):
    return re.sub(r"\s+", " ", t or "").strip()

def hash_text(t):
    return hashlib.md5(t.encode("utf8", "ignore")).hexdigest()

def parse_common_date(text):
    if not text:
        return None
    text = re.sub(r"(?i)published|updated|on\s+", "", text).strip()
    for fmt in ["%b %d, %Y", "%d %b %Y", "%B %d, %Y", "%Y-%m-%d"]:
        try:
            return datetime.strptime(text, fmt)
        except Exception:
            pass
    try:
        dt = pd.to_datetime(text, errors="coerce")
        return dt.to_pydatetime() if pd.notnull(dt) else None
    except Exception:
        return None

def is_in_current_month(dt):
    return dt and (MONTH_LOWER <= dt < MONTH_UPPER)
