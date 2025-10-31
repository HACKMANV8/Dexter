# fundamental_analyzer_yf.py
import pandas as pd
import numpy as np
import yfinance as yf
import math
import json  # --- NEW ---: Imported for JSON output
from typing import Optional, List

# ----------------------------
# Fundamental Analyzer using yfinance (improved)
# ----------------------------

NIFTY_50 = [
    "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS", "ASIANPAINT.NS", "AXISBANK.NS",
    "BAJAJ-AUTO.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BPCL.NS", "BHARTIARTL.NS",
    "BRITANNIA.NS", "CIPLA.NS", "COALINDIA.NS", "DIVISLAB.NS", "DRREDDY.NS",
    "EICHERMOT.NS", "GRASIM.NS", "HCLTECH.NS", "HDFCBANK.NS", "HDFCLIFE.NS",
    "HEROMOTOCO.NS", "HINDALCO.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "ITC.NS",
    "INDUSINDBK.NS", "INFY.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LTIM.NS",
    "LT.NS", "M&M.NS", "MARUTI.NS", "NTPC.NS", "NESTLEIND.NS", "ONGC.NS",
    "POWERGRID.NS", "RELIANCE.NS", "SBILIFE.NS", "SHREECEM.NS", "SBIN.NS",
    "SUNPHARMA.NS", "TCS.NS", "TATACONSUM.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
    "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS"
]

NIFTY_NEXT_50 = [
    "ACC.NS", "ADANIENSOL.NS", "ADANIGREEN.NS", "ADANIPOWER.NS", "ATGL.NS",
    "AMBUJACEM.NS", "AUROPHARMA.NS", "DMART.NS", "BAJAJHLDNG.NS", "BANKBARODA.NS",
    "BERGEPAINT.NS", "BEL.NS", "CANBK.NS", "CHOLAFIN.NS", "COLPAL.NS",
    "DLF.NS", "GAIL.NS", "GODREJCP.NS", "HAVELLS.NS", "HDFCAMC.NS",
    "HAL.NS", "ICICIGI.NS", "ICICIPRULI.NS", "IOC.NS", "IGL.NS",
    "INDUSTOWER.NS", "JIOFIN.NS", "JSWENERGY.NS", "JINDALSTEL.NS", "LICI.NS",
    "MRF.NS", "MARICO.NS", "MUTHOOTFIN.NS", "NMDC.NS", "PETRONET.NS",
    "PIDILITIND.NS", "PNB.NS", "PGHH.NS", "SAMVARDHANA.NS", "SRF.NS",
    "SIEMENS.NS", "SAIL.NS", "SHRIRAMFIN.NS", "TVSMOTOR.NS", "TRENT.NS",
    "UPL.NS", "VBL.NS", "VEDL.NS", "YESBANK.NS", "ZOMATO.NS"
]

SENSEX_30 = [
    "ASIANPAINT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "BHARTIARTL.NS",
    "HCLTECH.NS", "HDFCBANK.NS", "HINDUNILVR.NS", "ICICIBANK.NS", "INDUSINDBK.NS",
    "INFY.NS", "ITC.NS", "JSWSTEEL.NS", "KOTAKBANK.NS", "LT.NS", "M&M.NS",
    "MARUTI.NS", "NESTLEIND.NS", "NTPC.NS", "POWERGRID.NS", "RELIANCE.NS",
    "SBIN.NS", "SUNPHARMA.NS", "TCS.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
    "TECHM.NS", "TITAN.NS", "ULTRACEMCO.NS", "WIPRO.NS"
]

# --- Candidate lists for fetching ---

# Annual Candidates
NET_INCOME_CANDS = [
    'Net Income', 'Net Income Common Stockholders', 'Net Income Applicable To Common Shares',
    'NetIncome', 'NetIncomeLoss'
]
REVENUE_CANDS = ['Total Revenue', 'Revenue', 'Net sales', 'totalRevenue', 'RevenueNet']
TOTAL_ASSETS_CANDS = ['Total Assets', 'totalAssets']
TOTAL_LIAB_CANDS = ['Total Liab', 'Total Liabilities', 'totalLiab', 'Total Liabilities Net Minority Interest']
EQUITY_CANDS = ['Total Stockholder Equity', 'Total Shareholders\' Equity', 'totalStockholderEquity', 'Total stockholders\' equity', 'stockholdersEquity', 'Stockholders Equity']
LONG_TERM_DEBT_CANDS = ['Long Term Debt', 'longTermDebt', 'Non Current Debt']
CURRENT_DEBT_CANDS = ['Current Debt', 'shortTermDebt', 'Short Term Debt', 'Current Debt And Capital Lease Obligation']
TOTAL_DEBT_CANDS_OLD = ['Total Debt', 'TotalDebt', 'Total debt'] # Fallback
EBIT_CANDS = ['Ebit', 'EBIT', 'Operating Income', 'OperatingIncomeLoss', 'operatingIncome']
INTEREST_EXP_CANDS = ['Interest Expense', 'interestExpense']
OP_CASH_CANDS = ['Total Cash From Operating Activities', 'Total cash from operating activities', 'Net Cash Provided by Operating Activities', 'Total Cash From Operating Activities', 'operatingCashflow']
CAPEX_CANDS = ['Capital Expenditures', 'capitalExpenditures']

# Quarterly Candidates
SHARES_ISSUED_CANDS = ['Share Issued', 'Common Stock', 'sharesIssued']
ASSET_ACQ_CANDS = ['Acquisitions Net', 'Purchase Of Business', 'Purchase Of Ppe', 'Purchase Of Investment']