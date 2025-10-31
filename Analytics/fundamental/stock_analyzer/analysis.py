import pandas as pd
import numpy as np
import yfinance as yf
from typing import Optional

from .fetcher import fetch_financial_data, _find_value_from_df
from .scoring import score_fundamentals, recommendation_from_score
from constants import NIFTY_50, NIFTY_NEXT_50, SENSEX_30

def safe_div(a, b):
    try:
        if pd.isna(a) or pd.isna(b) or b == 0:
            return np.nan
        return a / b
    except Exception:
        return np.nan

# ---------- Metric calculator ----------
class FundamentalAnalyzer:
    def __init__(self, ticker):
        self.ticker = ticker.upper()
        self.data = fetch_financial_data(self.ticker)
        if self.data is None:
            raise ValueError(f"Could not retrieve financial data for {ticker}")

    def calculate_all_metrics(self):
        d = self.data

        # === Get Most Recent (T) values from annual data ===
        net_income_t = d['Net_Income_Annual'].get('P0', np.nan)
        net_income_t_minus_1 = d['Net_Income_Annual'].get('P1', np.nan)
        net_income_t_minus_2 = d['Net_Income_Annual'].get('P2', np.nan) # For user request
        
        revenue_t = d['Total_Revenue_Annual'].get('P0', np.nan)
        
        assets_t = d['Total_Assets_Annual'].get('P0', np.nan)
        assets_t_minus_1 = d['Total_Assets_Annual'].get('P1', np.nan)
        assets_t_minus_2 = d['Total_Assets_Annual'].get('P2', np.nan)

        liab_t = d['Total_Liabilities_Annual'].get('P0', np.nan)
        
        debt_t = d['Total_Debt_Annual'].get('P0', np.nan)
        debt_t_minus_1 = d['Total_Debt_Annual'].get('P1', np.nan)
        debt_t_minus_2 = d['Total_Debt_Annual'].get('P2', np.nan)
        
        equity_t = d['Shareholders_Equity_Annual'].get('P0', np.nan)
        equity_t_minus_1 = d['Shareholders_Equity_Annual'].get('P1', np.nan)
        equity_t_minus_2 = d['Shareholders_Equity_Annual'].get('P2', np.nan)

        current_assets = np.nan 
        current_liab = np.nan
        try:
            # Use _find_value_from_df helper
            current_assets = _find_value_from_df(yf.Ticker(self.ticker).balance_sheet, ['Total Current Assets', 'totalCurrentAssets', 'Current Assets'])
            current_liab = _find_value_from_df(yf.Ticker(self.ticker).balance_sheet, ['Total Current Liabilities', 'totalCurrentLiabilities', 'Current Liabilities'])
        except Exception:
            pass 

        ebit_t = d['EBIT_Annual'].get('P0', np.nan)
        interest_exp_t = d['Interest_Expense_Annual'].get('P0', np.nan)
        op_cash_t = d['Op_Cash_Flow_Annual'].get('P0', np.nan)
        capex_t = d['CapEx_Annual'].get('P0', np.nan)

        # === Standard Metrics Calculation (using TTM / P0 data) ===
        
        eps_t_calc = safe_div(net_income_t, d['Shares_Outstanding'])
        eps_t = d['trailingEps'] if not pd.isna(d['trailingEps']) else eps_t_calc
        
        eps_t_minus_1_calc = safe_div(net_income_t_minus_1, d['Shares_Outstanding'])
        
        bvps_calc_manual = safe_div(equity_t, d['Shares_Outstanding'])
        bvps = d['Book_Value_per_Share'] if not pd.isna(d['Book_Value_per_Share']) else bvps_calc_manual
        
        p_e_ratio_calc = safe_div(d['Stock_Price'], eps_t)
        p_e_ratio = d['trailingPE'] if not pd.isna(d['trailingPE']) else p_e_ratio_calc
        
        p_b_ratio_calc_manual = safe_div(d['Stock_Price'], bvps_calc_manual)
        p_b_ratio_info = d['Price_to_Book_Ratio']
        bvps_info = d['Book_Value_per_Share']
        p_b_ratio_calc_from_bvps_info = safe_div(d['Stock_Price'], bvps_info)
        
        p_b_ratio = p_b_ratio_info if not pd.isna(p_b_ratio_info) else \
                    (p_b_ratio_calc_from_bvps_info if not pd.isna(p_b_ratio_calc_from_bvps_info) else \
                     p_b_ratio_calc_manual)

        revenue_per_share_manual = safe_div(revenue_t, d['Shares_Outstanding'])
        p_s_ratio_calc_manual = safe_div(d['Stock_Price'], revenue_per_share_manual)
        p_s_ratio_info = d['priceToSalesTrailing12Months']
        revenue_per_share_info = d['revenuePerShare']
        p_s_ratio_calc_from_rps_info = safe_div(d['Stock_Price'], revenue_per_share_info)
        
        p_s_ratio = p_s_ratio_info if not pd.isna(p_s_ratio_info) else \
                    (p_s_ratio_calc_from_rps_info if not pd.isna(p_s_ratio_calc_from_rps_info) else \
                     p_s_ratio_calc_manual)

        eps_growth_rate_pct_info = d['earningsGrowth'] * 100 if not pd.isna(d['earningsGrowth']) else np.nan
        eps_growth_rate_pct_calc = np.nan
        if not pd.isna(eps_t) and not pd.isna(eps_t_minus_1_calc) and eps_t_minus_1_calc != 0:
            if eps_t_minus_1_calc < 0:
                 eps_growth_rate_pct_calc = (eps_t - eps_t_minus_1_calc) / abs(eps_t_minus_1_calc) * 100
            else:
                 eps_growth_rate_pct_calc = (eps_t - eps_t_minus_1_calc) / eps_t_minus_1_calc * 100
        
        eps_growth_rate_pct = eps_growth_rate_pct_info if not pd.isna(eps_growth_rate_pct_info) else eps_growth_rate_pct_calc

        eps_t_minus_1_from_growth = np.nan
        if not pd.isna(eps_t) and not pd.isna(eps_growth_rate_pct) and (1 + (eps_growth_rate_pct / 100)) != 0:
             eps_t_minus_1_from_growth = eps_t / (1 + (eps_growth_rate_pct / 100))
        
        eps_t_minus_1 = eps_t_minus_1_from_growth if not pd.isna(eps_t_minus_1_from_growth) else eps_t_minus_1_calc

        peg_ratio = safe_div(p_e_ratio, eps_growth_rate_pct) if not pd.isna(eps_growth_rate_pct) and eps_growth_rate_pct > 0 else np.nan

        roe = (safe_div(net_income_t, equity_t)) * 100
        roa = (safe_div(net_income_t, assets_t)) * 100
        net_profit_margin = (safe_div(net_income_t, revenue_t)) * 100

        d_e_ratio = safe_div(debt_t, equity_t)
        current_ratio = safe_div(current_assets, current_liab)
        interest_coverage_ratio = safe_div(ebit_t, interest_exp_t)

        fcf_manual = np.nan
        if not pd.isna(op_cash_t):
            try:
                capex_val = capex_t
                if pd.isna(capex_val):
                    fcf_manual = op_cash_t 
                elif capex_val > 0:
                     fcf_manual = op_cash_t - capex_val
                else:
                     fcf_manual = op_cash_t + capex_val 
            except Exception:
                fcf_manual = np.nan

        fcf_from_info = d['freeCashflow']
        fcf = fcf_from_info if not pd.isna(fcf_from_info) else fcf_manual
        fcf_per_share = safe_div(fcf, d['Shares_Outstanding'])
        
        # === NEW FUNCTIONALITIES (as requested) ===
        
        equity_3mo_ago = d['Equity_Quarterly'].get('P0', np.nan) 
        equity_6mo_ago = d['Equity_Quarterly'].get('P1', np.nan) 
        equity_12mo_ago = d['Equity_Quarterly'].get('P3', np.nan) 
        
        is_in_debt = bool(debt_t > 0)
        
        equity_dilution_trend_q = d['Shares_Issued_Quarterly']
        
        asset_acquisition_ttm = d['Asset_Acquisition_Quarterly'].sum()
        
        profit_t_minus_1 = net_income_t_minus_1
        profit_t_minus_2 = net_income_t_minus_2
        
        d_e_ratio_t_minus_1 = safe_div(debt_t_minus_1, equity_t_minus_1)
        d_e_ratio_t_minus_2 = safe_div(debt_t_minus_2, equity_t_minus_2)
        
        d_a_ratio_t = safe_div(debt_t, assets_t)
        d_a_ratio_t_minus_1 = safe_div(debt_t_minus_1, assets_t_minus_1)
        d_a_ratio_t_minus_2 = safe_div(debt_t_minus_2, assets_t_minus_2)


        metrics = {
            # --- Standard Metrics (TTM) ---
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
            'FCF_per_share': fcf_per_share,
            
            # --- NEW: Requested Functionalities ---
            'Equity_3mo_ago (Q1)': equity_3mo_ago,
            'Equity_6mo_ago (Q2)': equity_6mo_ago,
            'Equity_12mo_ago (Q4)': equity_12mo_ago,
            'Total_Debt_T': debt_t,
            'Is_in_Debt': is_in_debt,
            'Asset_Acquisition_TTM': asset_acquisition_ttm,
            'Profit_T_minus_1': profit_t_minus_1,
            'Profit_T_minus_2': profit_t_minus_2,
            'Debt_to_Equity_T_minus_1': d_e_ratio_t_minus_1,
            'Debt_to_Equity_T_minus_2': d_e_ratio_t_minus_2,
            'Debt_to_Asset_T': d_a_ratio_t,
            'Debt_to_Asset_T_minus_1': d_a_ratio_t_minus_1,
            'Debt_to_Asset_T_minus_2': d_a_ratio_t_minus_2,
            
            'Dilution_Shares_Q1': equity_dilution_trend_q.get('P0', np.nan),
            'Dilution_Shares_Q2': equity_dilution_trend_q.get('P1', np.nan),
            'Dilution_Shares_Q3': equity_dilution_trend_q.get('P2', np.nan),
            'Dilution_Shares_Q4': equity_dilution_trend_q.get('P3', np.nan),
        }
        return pd.Series(metrics, name=self.ticker)


# ---------- Index baseline computation ----------
def compute_index_baselines(index_name: str):
    if index_name.upper() == 'NIFTY50': tickers = NIFTY_50
    elif index_name.upper() == 'NIFTYNEXT50': tickers = NIFTY_NEXT_50
    elif index_name.upper() == 'SENSEX30': tickers = SENSEX_30
    else: raise ValueError("Index must be 'NIFTY50', 'NIFTYNEXT50', or 'SENSEX30'")
    rows = []
    print(f"Fetching data for {index_name} constituents...")
    for t in tickers:
        try:
            fa = FundamentalAnalyzer(t)
            rows.append(fa.calculate_all_metrics())
        except Exception as e:
            print(f"Skipping {t}: {e}")
            continue
    if not rows: raise RuntimeError("No data fetched for index constituents.")
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