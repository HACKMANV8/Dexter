# stock_analyzer/fetcher.py
# This file's only job is to fetch data from yfinance.

import pandas as pd
import numpy as np
import yfinance as yf
from typing import Optional

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

        # Price (try multiple fallbacks)
        price = info.get('currentPrice') or info.get('regularMarketPrice') or None
        # Shares outstanding
        shares_out = info.get('sharesOutstanding') or np.nan

        # yfinance returns financials/balance_sheet/cashflow as DataFrames (columns are periods)
        fin = None
        bal = None
        cf = None
        try:
            fin = tk.financials
        except Exception:
            fin = None
        try:
            bal = tk.balance_sheet
        except Exception:
            bal = None
        try:
            cf = tk.cashflow
        except Exception:
            cf = None

        # Income statement candidates
        net_income_cands = [
            'Net Income', 'Net Income Common Stockholders', 'Net Income Applicable To Common Shares',
            'NetIncome', 'NetIncomeLoss'
        ]
        revenue_cands = ['Total Revenue', 'Revenue', 'Net sales', 'totalRevenue', 'RevenueNet']

        # Balance sheet candidates
        total_assets_cands = ['Total Assets', 'totalAssets']
        total_liab_cands = ['Total Liab', 'Total Liabilities', 'totalLiab', 'Total Liabilities Net Minority Interest']
        equity_cands = ['Total Stockholder Equity', 'Total Shareholders\' Equity', 'totalStockholderEquity', 'Total stockholders\' equity', 'stockholdersEquity', 'Stockholders Equity']
        current_assets_cands = ['Total Current Assets', 'totalCurrentAssets', 'Current Assets']
        current_liab_cands = ['Total Current Liabilities', 'totalCurrentLiabilities', 'Current Liabilities']
        
        # Candidates for debt calculation
        long_term_debt_cands = ['Long Term Debt', 'longTermDebt', 'Non Current Debt']
        current_debt_cands = ['Current Debt', 'shortTermDebt', 'Short Term Debt', 'Current Debt And Capital Lease Obligation']

        # Cashflow candidates
        op_cash_cands = ['Total Cash From Operating Activities', 'Total cash from operating activities', 'Net Cash Provided by Operating Activities', 'Total Cash From Operating Activities', 'operatingCashflow']
        capex_cands = ['Capital Expenditures', 'capitalExpenditures']

        # Other candidates
        ebit_cands = ['Ebit', 'EBIT', 'Operating Income', 'OperatingIncomeLoss', 'operatingIncome']
        interest_exp_cands = ['Interest Expense', 'interestExpense']

        # extract values (most recent column) using helper
        net_income = _find_value_from_df(fin, net_income_cands)
        revenue = _find_value_from_df(fin, revenue_cands)
        total_assets = _find_value_from_df(bal, total_assets_cands)
        total_liab = _find_value_from_df(bal, total_liab_cands)
        shareholders_equity = _find_value_from_df(bal, equity_cands)
        current_assets = _find_value_from_df(bal, current_assets_cands)
        current_liab = _find_value_from_df(bal, current_liab_cands)
        op_cash = _find_value_from_df(cf, op_cash_cands)
        capex = _find_value_from_df(cf, capex_cands)
        ebit = _find_value_from_df(fin, ebit_cands)
        interest_exp = info.get('interestExpense') or _find_value_from_df(fin, interest_exp_cands) or _find_value_from_df(bal, interest_exp_cands)

        # More robust Total Debt calculation
        total_debt = info.get('totalDebt') or np.nan
        
        if pd.isna(total_debt):
            long_term_debt = _find_value_from_df(bal, long_term_debt_cands)
            current_debt = _find_value_from_df(bal, current_debt_cands)
            
            if not pd.isna(long_term_debt) or not pd.isna(current_debt):
                total_debt = (long_term_debt if not pd.isna(long_term_debt) else 0) + \
                             (current_debt if not pd.isna(current_debt) else 0)
            else:
                 total_debt_cands_old = ['Total Debt', 'TotalDebt', 'Total debt']
                 total_debt = _find_value_from_df(bal, total_debt_cands_old)

        # If many values are still nan, try alternate sources in info (some fields exist in info dict)
        if pd.isna(net_income):
            net_income = info.get('netIncomeToCommon') or info.get('netIncome') or np.nan
        if pd.isna(revenue):
            revenue = info.get('totalRevenue') or info.get('revenue') or np.nan
        if pd.isna(total_assets):
            total_assets = info.get('totalAssets') or np.nan
        if pd.isna(total_liab):
            total_liab = info.get('totalLiab') or np.nan
        if pd.isna(shareholders_equity):
            shareholders_equity = info.get('totalStockholderEquity') or np.nan
        if pd.isna(current_assets):
            current_assets = info.get('totalCurrentAssets') or np.nan
        if pd.isna(current_liab):
            current_liab = info.get('totalCurrentLiabilities') or np.nan
        if pd.isna(op_cash):
            op_cash = info.get('operatingCashflow') or np.nan
        if pd.isna(capex):
            capex = info.get('capitalExpenditures') or np.nan

        # Build result series
        data = {
            'Stock_Price': float(price) if price is not None else np.nan,
            'Shares_Outstanding': float(shares_out) if not pd.isna(shares_out) else np.nan,
            'Net_Income_T': float(net_income) if not pd.isna(net_income) else np.nan,
            'Net_Income_T_minus_1': np.nan,
            'Total_Revenue_T': float(revenue) if not pd.isna(revenue) else np.nan,
            'Total_Revenue_T_minus_1': np.nan,
            'Total_Assets': float(total_assets) if not pd.isna(total_assets) else np.nan,
            'Total_Liabilities': float(total_liab) if not pd.isna(total_liab) else np.nan,
            'Total_Debt': float(total_debt) if not pd.isna(total_debt) else np.nan,
            'Shareholders_Equity': float(shareholders_equity) if not pd.isna(shareholders_equity) else np.nan,
            'Current_Assets': float(current_assets) if not pd.isna(current_assets) else np.nan,
            'Current_Liabilities': float(current_liab) if not pd.isna(current_liab) else np.nan,
            'EBIT': float(ebit) if not pd.isna(ebit) else np.nan,
            'Interest_Expense': float(interest_exp) if not pd.isna(interest_exp) else np.nan,
            'Op_Cash_Flow': float(op_cash) if not pd.isna(op_cash) else np.nan,
            'CapEx': float(capex) if not pd.isna(capex) else np.nan,
            'Book_Value_per_Share': info.get('bookValue') or np.nan,
            'Price_to_Book_Ratio': info.get('priceToBook') or np.nan,
            'trailingEps': info.get('trailingEps') or np.nan,
            'trailingPE': info.get('trailingPE') or np.nan,
            'earningsGrowth': info.get('earningsGrowth') or np.nan,
            'freeCashflow': info.get('freeCashflow') or np.nan,
            'priceToSalesTrailing12Months': info.get('priceToSalesTrailing12Months') or np.nan,
            'revenuePerShare': info.get('revenuePerShare') or np.nan,
        }

        # Attempt to fill T-1 values from second column (if present)
        try:
            if tk.financials is not None and not tk.financials.empty and tk.financials.shape[1] >= 2:
                prev_col = tk.financials.columns[1]
                # net income prev
                for cand in net_income_cands:
                    if cand in tk.financials.index:
                        val = tk.financials.loc[cand, prev_col]
                        data['Net_Income_T_minus_1'] = float(val) if not pd.isna(val) else data['Net_Income_T_minus_1']
                        break
                # revenue prev
                for cand in revenue_cands:
                    if cand in tk.financials.index:
                        val = tk.financials.loc[cand, prev_col]
                        data['Total_Revenue_T_minus_1'] = float(val) if not pd.isna(val) else data['Total_Revenue_T_minus_1']
                        break
        except Exception:
            pass

        return pd.Series(data)
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return None
