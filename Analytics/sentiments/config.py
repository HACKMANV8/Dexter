import logging
from datetime import datetime, timedelta

HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"}
REQUEST_TIMEOUT = 10
MAX_WORKERS = 10
MODEL_ID = "yiyanghkust/finbert-tone"

TODAY = datetime.now().date()
MONTH_START = TODAY.replace(day=1)
MONTH_END = (MONTH_START + timedelta(days=32)).replace(day=1) - timedelta(days=1)
MONTH_LOWER = datetime.combine(MONTH_START, datetime.min.time())
MONTH_UPPER = datetime.combine(MONTH_END + timedelta(days=1), datetime.min.time())

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
