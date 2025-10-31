import pandas as pd
import numpy as np

# ---------- Scoring and recommendation ----------
def _hib_normalize(val, good, excellent):
    """Higher is Better (HIB) normalization"""
    if pd.isna(val):
        return 50.0 # Neutral if unknown
    val = float(val)
    if val <= 0 and good > 0: # Handle negative values for HIB metrics (e.g., negative ROE)
        return 0.0
    if val >= excellent:
        return 100.0
    if val <= good:
        # If good is 0, any positive value is a good start
        if good == 0:
             return 50.0 if val > 0 else 0.0
        return (val / good) * 50.0
    # val is between good and excellent
    return 50.0 + ((val - good) / (excellent - good)) * 50.0

def _lib_normalize(val, fair, excellent):
    """Lower is Better (LIB) normalization"""
    if pd.isna(val):
        return 50.0 # Neutral if unknown
    val = float(val)
    if val <= excellent:
        return 100.0
    if val >= fair:
        return 0.0
    # val is between excellent and fair
    return (fair - val) / (fair - excellent) * 100.0

def score_fundamentals(metrics):
    # Valuation
    pe_s = _lib_normalize(metrics['P/E'], fair=50, excellent=15)
    pb_s = _lib_normalize(metrics['P/B'], fair=10, excellent=1.5)
    ps_s = _lib_normalize(metrics['P/S'], fair=6, excellent=1.5)
    peg_val = metrics['PEG']
    if pd.isna(peg_val) or peg_val <= 0:
        peg_val = 999 # Treat as very high (bad)
    peg_s = _lib_normalize(peg_val, fair=2.5, excellent=0.5)
    val_score = np.nanmean([pe_s, pb_s, ps_s, peg_s])

    # Profitability
    roe_s = _hib_normalize(metrics['ROE_pct'], good=15, excellent=30)
    roa_s = _hib_normalize(metrics['ROA_pct'], good=7, excellent=15)
    npm_s = _hib_normalize(metrics['Net_Profit_Margin_pct'], good=10, excellent=25)
    prof_score = np.nanmean([roe_s, roa_s, npm_s])

    # Health
    de_s = _lib_normalize(metrics['Debt_to_Equity'], fair=1.5, excellent=0.2)
    curr_s = _hib_normalize(metrics['Current_Ratio'], good=1.2, excellent=3)
    ic_s = _hib_normalize(metrics['Interest_Coverage'], good=5, excellent=20)
    health_score = np.nanmean([de_s, curr_s, ic_s])

    # Growth
    epsg_s = _hib_normalize(metrics['EPS_Growth_pct'], good=10, excellent=25)
    fcf_s = _hib_normalize(metrics['FCF_per_share'], good=30, excellent=70)
    growth_score = np.nanmean([epsg_s, fcf_s])

    composite = val_score * 0.30 + prof_score * 0.30 + health_score * 0.20 + growth_score * 0.20

    subs = {
        'Valuation_Score': val_score,
        'Profitability_Score': prof_score,
        'Health_Score': health_score,
        'Growth_Score': growth_score,
        'Composite_Score': composite
    }
    return subs

def recommendation_from_score(score):
    if pd.isna(score):
        return 'N/A (Could not calculate score)'
    if score >= 80:
        return 'Strong Buy (Fundamentals look excellent)'
    if score >= 65:
        return 'Buy (Fundamentals look solid)'
    if score >= 50:
        return 'Hold (Fundamentals are average)'
    if score >= 35:
        return 'Reduce / Sell (Fundamentals look weak)'
    return 'Strong Sell / Avoid (Fundamentals look poor)'