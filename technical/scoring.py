# scoring.py
# Contains functions for weighting features and calculating score/confidence.

import math
import pandas as pd
from config import BASE_WEIGHTS

def adapt_weights(base_weights, features, df):
    w = base_weights.copy()
    # <-- FIX: Ensure ADX is retrieved safely as a float
    adx_val = float(features.get("ADX", 0)) 
    trend_boost = max(0, adx_val)
    
    if trend_boost > 0.3:
        for k in ["SMA_trend", "EMA_trend", "MACD"]:
            if k in w:
                w[k] *= 1.0 + 0.5 * trend_boost
        if "BOLL" in w:
            w["BOLL"] *= max(0.4, 1.0 - 0.8 * trend_boost)
    else:
        if "BOLL" in w:
            w["BOLL"] *= 1.0 + 0.8 * (0.3 - trend_boost)
        if "RSI" in w:
            w["RSI"] *= 1.0 + 0.3 * (0.3 - trend_boost)
            
    s = sum([v for v in w.values() if not math.isnan(v)])
    if s > 1e-9:
        for k in w:
            w[k] = w[k] / s
    return w


def aggregate_score(features, weights):
    s = 0.0
    breakdown = {}
    for k, w in weights.items():
        val = features.get(k, 0.0)
        # Ensure val is a float, not NaN or Inf
        if not isinstance(val, (int, float)) or pd.isna(val) or not math.isfinite(val):
            val = 0.0
        contr = w * val
        breakdown[k] = contr
        s += contr
        
    score = (s + 1.0) / 2.0 * 100.0
    
    # Final check: If the score still resolves to NaN (e.g., if s was NaN), use fallback.
    if pd.isna(score) or not math.isfinite(score):
        score = 50.0
        
    return score, breakdown


def compute_confidence(breakdown, features):
    mag = sum(abs(v) for v in breakdown.values())
    adx_bias = abs(features.get("ADX", 0))
    
    # Confidence is a mix of magnitude (conviction) and trend strength (ADX)
    # <-- FIX: Use len(BASE_WEIGHTS) for a stable denominator
    num_features = len(BASE_WEIGHTS) if len(BASE_WEIGHTS) > 0 else 1
    conf = (mag / num_features) * 0.8 + adx_bias * 0.2
    
    conf = max(0.0, min(1.0, conf))
    return conf