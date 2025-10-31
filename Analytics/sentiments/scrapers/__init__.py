

# Import the main list of all scrapers
from .sources import SOURCE_FUNCS

# Import the specific scrapers needed by the analyzer's fallback logic
from .sources import (
    google_news_search,
    timesofindia_search,
    indianexpress_search,
    bloombergquint_search
)

# Define what is "public" when importing from this package
__all__ = [
    "SOURCE_FUNCS",
    "google_news_search",
    "timesofindia_search",
    "indianexpress_search",
    "bloombergquint_search"
]

