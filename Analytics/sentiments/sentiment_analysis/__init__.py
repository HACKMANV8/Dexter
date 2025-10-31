"""
This file makes the 'sentiment_analysis' directory a Python package
and exposes its primary functions.
"""

from .analyzer import analyze_company
from .model import load_sentiment_pipeline

__all__ = [
    "analyze_company",
    "load_sentiment_pipeline"
]

