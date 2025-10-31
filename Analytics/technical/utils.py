import datetime as dt
from config import MARKET_TIMEZONE, MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE

def is_market_open():
    """Checks if NSE market is currently open (9:15 AM to 3:30 PM IST, Mon-Fri)."""
    now_ist = dt.datetime.now(MARKET_TIMEZONE)
    if now_ist.weekday() >= 5: # Saturday or Sunday
        return False
    market_open = now_ist.replace(hour=MARKET_OPEN_HOUR, minute=MARKET_OPEN_MINUTE, second=0, microsecond=0)
    market_close = now_ist.replace(hour=MARKET_CLOSE_HOUR, minute=MARKET_CLOSE_MINUTE, second=0, microsecond=0)
    return market_open <= now_ist < market_close

def prepare_chart_data(ticker, df_1d_intraday, df_1y_daily):
    """
    Generates 1D, 1M, 6M, and 1Y price-only chart data and returns as a dict.
    The format is: [ { "date": "...", "price": ... }, ... ]
    """
    chart_data = {}

    # --- 1. 1-Day (Intraday Chart) ---
    try:
        if not df_1d_intraday.empty:
            df_1d = df_1d_intraday.dropna(subset=["Close"])
            data_1d = []
            for index, row in df_1d.iterrows():
                # isoformat() is a standard way to represent dates as strings
                data_1d.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1D'] = data_1d
        else:
            chart_data['1D'] = [] # Send empty list if no data
    except Exception as e:
        print(f"Could not process 1-Day chart data: {e}")
        chart_data['1D'] = []

    # --- 2. 1-Month, 6-Month, 1-Year (Daily Charts) ---
    try:
        if not df_1y_daily.empty:
            df_1y = df_1y_daily.dropna(subset=["Close"])
            
            # Slice for other timeframes
            df_6m = df_1y.last('6M')
            df_1m = df_1y.last('1M')

            # Process 1M
            data_1m = []
            for index, row in df_1m.iterrows():
                data_1m.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1M'] = data_1m
            
            # Process 6M
            data_6m = []
            for index, row in df_6m.iterrows():
                data_6m.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['6M'] = data_6m

            # Process 1Y
            data_1y = []
            for index, row in df_1y.iterrows():
                data_1y.append({"date": index.isoformat(), "price": row['Close']})
            chart_data['1Y'] = data_1y
            
        else:
            # Send empty lists if no data
            chart_data['1M'] = []
            chart_data['6M'] = []
            chart_data['1Y'] = []
            
    except Exception as e:
        print(f"Could not process daily chart data: {e}")
        chart_data['1M'] = []
        chart_data['6M'] = []
        chart_data['1Y'] = []

    return chart_data