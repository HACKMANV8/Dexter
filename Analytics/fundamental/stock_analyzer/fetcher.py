import pandas as pd
import numpy as np
import yfinance as yf
from typing import Optional, List

# Import the candidate lists from constants.py
from constants import (
    NET_INCOME_CANDS, REVENUE_CANDS, TOTAL_ASSETS_CANDS, TOTAL_LIAB_CANDS,
    EQUITY_CANDS, LONG_TERM_DEBT_CANDS, CURRENT_DEBT_CANDS,
    TOTAL_DEBT_CANDS_OLD, EBIT_CANDS, INTEREST_EXP_CANDS, OP_CASH_CANDS,
    CAPEX_CANDS, SHARES_ISSUED_CANDS, ASSET_ACQ_CANDS
)

# ---------- Helpers to find rows with different name variants ----------
def _find_value_from_df(df: pd.DataFrame, candidates):
    """Return first matching value from df (most recent column)."""
    if df is None or df.empty:
        return np.nan
    cols = df.columns
    if len(cols) == 0:
        return np.nan
    # use the most recent column (first column in yfinance dataframes is latest)
    col = cols[0]
    for name in candidates:
        if name in df.index:
            val = df.loc[name, col]
            # convert pandas NA-like to np.nan
            try:
                return float(val) if not pd.isna(val) else np.nan
            except Exception:
                return np.nan
    return np.nan

def _find_historical_row(df: pd.DataFrame, candidates: List[str], num_periods: int = 4) -> pd.Series:
    """
    Find the first matching row from candidates and return a Series
    containing the data for the first 'num_periods'.
    """
    nan_series = pd.Series([np.nan] * num_periods, index=[f'P{i}' for i in range(num_periods)])
    if df is None or df.empty:
        return nan_series

    found_row = None
    for name in candidates:
        if name in df.index:
            found_row = df.loc[name]
            break
    
    if found_row is None:
        return nan_series

    # Ensure we have enough data, pad with NaN if not
    values = found_row.values
    if len(values) < num_periods:
        padded_values = np.pad(values, (0, num_periods - len(values)), 'constant', constant_values=np.nan)
    else:
        padded_values = values[:num_periods]
        
    return pd.Series(padded_values, index=[f'P{i}' for i in range(num_periods)], dtype=float)


# ---------- Core fetcher using yfinance ----------
def fetch_financial_data(ticker: str) -> Optional[pd.Series]:
    """
    Fetch financial data from yfinance and return a Series with required fields.
    Ticker should include market suffix (e.g., 'INFY.NS').
    """
    try:
        tk = yf.Ticker(ticker)
        info = {}
        try:
            info = tk.info or {}
        except Exception:
            info = {}

        price = info.get('currentPrice') or info.get('regularMarketPrice') or None
        shares_out = info.get('sharesOutstanding') or np.nan

        fin_a, bal_a, cf_a = None, None, None
        fin_q, bal_q, cf_q = None, None, None
        
        try: fin_a = tk.financials
        except Exception: pass
        try: bal_a = tk.balance_sheet
        except Exception: pass
        try: cf_a = tk.cashflow
        except Exception: pass
        
        try: fin_q = tk.quarterly_financials
        except Exception: pass
        try: bal_q = tk.quarterly_balance_sheet
        except Exception: pass
        try: cf_q = tk.quarterly_cashflow
        except Exception: pass
        
        # --- Get Annual Data (T, T-1, T-2, T-3) ---
        net_income_hist_a = _find_historical_row(fin_a, NET_INCOME_CANDS, 4)
        revenue_hist_a = _find_historical_row(fin_a, REVENUE_CANDS, 4)
        assets_hist_a = _find_historical_row(bal_a, TOTAL_ASSETS_CANDS, 4)
        liab_hist_a = _find_historical_row(bal_a, TOTAL_LIAB_CANDS, 4)
        equity_hist_a = _find_historical_row(bal_a, EQUITY_CANDS, 4)
        ebit_hist_a = _find_historical_row(fin_a, EBIT_CANDS, 4)
        interest_hist_a = _find_historical_row(fin_a, INTEREST_EXP_CANDS, 4)
        op_cash_hist_a = _find_historical_row(cf_a, OP_CASH_CANDS, 4)
        capex_hist_a = _find_historical_row(cf_a, CAPEX_CANDS, 4)
        
        long_debt_a = _find_historical_row(bal_a, LONG_TERM_DEBT_CANDS, 4)
        short_debt_a = _find_historical_row(bal_a, CURRENT_DEBT_CANDS, 4)
        total_debt_a = (long_debt_a.fillna(0) + short_debt_a.fillna(0))
        if total_debt_a.isna().all():
             total_debt_a = _find_historical_row(bal_a, TOTAL_DEBT_CANDS_OLD, 4)
        if pd.isna(total_debt_a['P0']):
             total_debt_a['P0'] = info.get('totalDebt') or np.nan


        # --- Get Quarterly Data (Q-1, Q-2, Q-3, Q-4) ---
        equity_hist_q = _find_historical_row(bal_q, EQUITY_CANDS, 4)
        shares_issued_hist_q = _find_historical_row(bal_q, SHARES_ISSUED_CANDS, 4)
        asset_acq_hist_q = _find_historical_row(cf_q, ASSET_ACQ_CANDS, 4)
        
        data = {
            'Stock_Price': float(price) if price is not None else np.nan,
            'Shares_Outstanding': float(shares_out) if not pd.isna(shares_out) else np.nan,
            
            'Net_Income_Annual': net_income_hist_a,
            'Total_Revenue_Annual': revenue_hist_a,
            'Total_Assets_Annual': assets_hist_a,
            'Total_Liabilities_Annual': liab_hist_a,
            'Total_Debt_Annual': total_debt_a,
            'Shareholders_Equity_Annual': equity_hist_a,
            'EBIT_Annual': ebit_hist_a,
            'Interest_Expense_Annual': interest_hist_a,
            'Op_Cash_Flow_Annual': op_cash_hist_a,
            'CapEx_Annual': capex_hist_a,
            
            'Equity_Quarterly': equity_hist_q,
            'Shares_Issued_Quarterly': shares_issued_hist_q,
            'Asset_Acquisition_Quarterly': asset_acq_hist_q,

            'Book_Value_per_Share': info.get('bookValue') or np.nan,
            'Price_to_Book_Ratio': info.get('priceToBook') or np.nan,
            'trailingEps': info.get('trailingEps') or np.nan,
            'trailingPE': info.get('trailingPE') or np.nan,
            'earningsGrowth': info.get('earningsGrowth') or np.nan,
            'freeCashflow': info.get('freeCashflow') or np.nan,
            'priceToSalesTrailing12Months': info.get('priceToSalesTrailing12Months') or np.nan,
            'revenuePerShare': info.get('revenuePerShare') or np.nan,
        }
        
        return pd.Series(data)
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None