# stock_analyzer/analysis.py
# This file is the "brain" that connects the data fetcher,
# calculator, and scorer.

import pandas as pd
import numpy as np
from typing import Optional

# Import this project's other files
from .fetcher import fetch_financial_data
from .scoring import score_fundamentals, recommendation_from_score
# Import constants from the root folder
import sys, os
# This line allows this file to import 'constants.py' from the parent directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from Analytics.Fundamentals.constants import NIFTY_50, NIFTY_NEXT_50, SENSEX_30


def _safe_div(a, b):
    """Internal safe division helper"""
    try:
        if pd.isna(a) or pd.isna(b) or b == 0:
            return np.nan
        return a / b
    except Exception:
        return np.nan

# ---------- Metric calculator (keeps original metric names) ----------
class FundamentalAnalyzer:
    def __init__(self, ticker):
        self.ticker = ticker.upper()
        self.data = fetch_financial_data(self.ticker)
        if self.data is None:
            raise ValueError(f"Could not retrieve financial data for {ticker}")

    def calculate_all_metrics(self):
        d = self.data

        # Use our internal _safe_div
        eps_t_calc = _safe_div(d['Net_Income_T'], d['Shares_Outstanding'])
        eps_t = d['trailingEps'] if not pd.isna(d['trailingEps']) else eps_t_calc
        
        eps_t_minus_1_calc = _safe_div(d['Net_Income_T_minus_1'], d['Shares_Outstanding'])

        bvps_calc_manual = _safe_div((d['Total_Assets'] - d['Total_Liabilities']), d['Shares_Outstanding'])
        bvps = d['Book_Value_per_Share'] if not pd.isna(d['Book_Value_per_Share']) else bvps_calc_manual
        
        p_e_ratio_calc = _safe_div(d['Stock_Price'], eps_t)
        p_e_ratio = d['trailingPE'] if not pd.isna(d['trailingPE']) else p_e_ratio_calc
        
        p_b_ratio_calc_manual = _safe_div(d['Stock_Price'], bvps_calc_manual)
        p_b_ratio_info = d['Price_to_Book_Ratio']
        bvps_info = d['Book_Value_per_Share']
        p_b_ratio_calc_from_bvps_info = _safe_div(d['Stock_Price'], bvps_info)
        
        p_b_ratio = p_b_ratio_info if not pd.isna(p_b_ratio_info) else \
                    (p_b_ratio_calc_from_bvps_info if not pd.isna(p_b_ratio_calc_from_bvps_info) else \
                     p_b_ratio_calc_manual)

        revenue_per_share_manual = _safe_div(d['Total_Revenue_T'], d['Shares_Outstanding'])
        p_s_ratio_calc_manual = _safe_div(d['Stock_Price'], revenue_per_share_manual)
        p_s_ratio_info = d['priceToSalesTrailing12Months']
        revenue_per_share_info = d['revenuePerShare']
        p_s_ratio_calc_from_rps_info = _safe_div(d['Stock_Price'], revenue_per_share_info)
        
        p_s_ratio = p_s_ratio_info if not pd.isna(p_s_ratio_info) else \
                    (p_s_ratio_calc_from_rps_info if not pd.isna(p_s_ratio_calc_from_rps_info) else \
                     p_s_ratio_calc_manual)

        eps_growth_rate_pct_info = d['earningsGrowth'] * 100 if not pd.isna(d['earningsGrowth']) else np.nan
        
        eps_growth_rate_pct_calc = np.nan
        if pd.isna(eps_growth_rate_pct_info) and not pd.isna(eps_t) and not pd.isna(eps_t_minus_1_calc) and eps_t_minus_1_calc != 0:
            if eps_t_minus_1_calc < 0:
                 eps_growth_rate_pct_calc = (eps_t - eps_t_minus_1_calc) / abs(eps_t_minus_1_calc) * 100
            else:
                 eps_growth_rate_pct_calc = (eps_t - eps_t_minus_1_calc) / eps_t_minus_1_calc * 100
        
        eps_growth_rate_pct = eps_growth_rate_pct_info if not pd.isna(eps_growth_rate_pct_info) else eps_growth_rate_pct_calc

        eps_t_minus_1_from_growth = np.nan
        if not pd.isna(eps_t) and not pd.isna(eps_growth_rate_pct) and (1 + (eps_growth_rate_pct / 100)) != 0:
             eps_t_minus_1_from_growth = eps_t / (1 + (eps_growth_rate_pct / 100))
        
        eps_t_minus_1 = eps_t_minus_1_from_growth if not pd.isna(eps_t_minus_1_from_growth) else eps_t_minus_1_calc
        
        peg_ratio = _safe_div(p_e_ratio, eps_growth_rate_pct) if not pd.isna(eps_growth_rate_pct) and eps_growth_rate_pct > 0 else np.nan

        roe = (_safe_div(d['Net_Income_T'], d['Shareholders_Equity'])) * 100 if not pd.isna(d['Shareholders_Equity']) else np.nan
        roa = (_safe_div(d['Net_Income_T'], d['Total_Assets'])) * 100 if not pd.isna(d['Total_Assets']) else np.nan
        net_profit_margin = (_safe_div(d['Net_Income_T'], d['Total_Revenue_T'])) * 100 if not pd.isna(d['Total_Revenue_T']) else np.nan

        d_e_ratio = _safe_div(d['Total_Debt'], d['Shareholders_Equity'])
        current_ratio = _safe_div(d['Current_Assets'], d['Current_Liabilities'])
        interest_coverage_ratio = _safe_div(d['EBIT'], d['Interest_Expense'])

        fcf_manual = np.nan
        if not pd.isna(d['Op_Cash_Flow']):
            try:
                capex_val = d['CapEx']
                if pd.isna(capex_val):
                    fcf_manual = d['Op_Cash_Flow']
                elif capex_val > 0:
                     fcf_manual = d['Op_Cash_Flow'] - capex_val
                else:
                     fcf_manual = d['Op_Cash_Flow'] + capex_val
            except Exception:
                fcf_manual = np.nan

        fcf_from_info = d['freeCashflow']
        fcf_manual_total = fcf_manual if not pd.isna(fcf_manual) else np.nan
        fcf = fcf_from_info if not pd.isna(fcf_from_info) else fcf_manual_total
        fcf_per_share = _safe_div(fcf, d['Shares_Outstanding'])

        metrics = {
            'EPS_T': eps_t,
            'EPS_T_minus_1': eps_t_minus_1,
            'P/E': p_e_ratio,
            'P/B': p_b_ratio,
            'P/S': p_s_ratio,
            'PEG': peg_ratio,
            'ROE_pct': roe,
            'ROA_pct': roa,
            'Net_Profit_Margin_pct': net_profit_margin,
            'Debt_to_Equity': d_e_ratio,
            'Current_Ratio': current_ratio,
            'Interest_Coverage': interest_coverage_ratio,
            'EPS_Growth_pct': eps_growth_rate_pct,
            'FCF_per_share': fcf_per_share
        }
        return pd.Series(metrics, name=self.ticker)

# ---------- Index baseline computation ----------
def compute_index_baselines(index_name: str):
    if index_name.upper() == 'NIFTY50':
        tickers = NIFTY_50
    elif index_name.upper() == 'NIFTYNEXT50':
        tickers = NIFTY_NEXT_50
    elif index_name.upper() == 'SENSEX30':
        tickers = SENSEX_30
    else:
        raise ValueError("Index must be 'NIFTY50', 'NIFTYNEXT50', or 'SENSEX30'")

    rows = []
    print(f"Fetching data for {index_name} constituents...")
    for t in tickers:
        try:
            fa = FundamentalAnalyzer(t)
            rows.append(fa.calculate_all_metrics())
        except Exception as e:
            print(f"Skipping {t}: {e}")
            continue

    if not rows:
        raise RuntimeError("No data fetched for index constituents.")
    df = pd.DataFrame(rows)
    baselines = df.quantile([0.25, 0.5, 0.75]).T
    baselines.columns = ['P25', 'P50', 'P75']
    return baselines, df

def analyze_ticker(ticker: str, index_compare: Optional[str] = None):
    fa = FundamentalAnalyzer(ticker)
    metrics = fa.calculate_all_metrics()
    subs = score_fundamentals(metrics)
    rec = recommendation_from_score(subs['Composite_Score'])
    result = {'Ticker': ticker.upper(), 'Metrics': metrics, 'Scores': subs, 'Recommendation': rec}

    if index_compare:
        try:
            baselines, df_index = compute_index_baselines(index_compare)
            result['Index_Baselines'] = baselines
            per_metric_pct = {}
            for col in df_index.columns:
                try:
                    metric_val = metrics[col]
                    if pd.isna(metric_val):
                         per_metric_pct[col] = 0.0
                         continue
                    
                    lib_metrics = ['P/E', 'P/B', 'P/S', 'PEG', 'Debt_to_Equity']
                    
                    if col in lib_metrics:
                        percentile = (df_index[col] > metric_val).sum() / len(df_index) * 100
                    else:
                        percentile = (df_index[col] < metric_val).sum() / len(df_index) * 100
                    
                    per_metric_pct[col] = float(percentile)
                except Exception:
                    per_metric_pct[col] = 0.0
            result['Percentile_vs_Index'] = per_metric_pct
        except Exception as e:
            result['Index_Compare_Error'] = str(e)

    return result
