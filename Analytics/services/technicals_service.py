import yfinance as yf
import pandas as pd

def get_technical_data(symbol: str):
    stock = yf.Ticker(symbol)
    data = stock.history(period="1mo")
    
    if data.empty:
        return {"error": f"No data found for {symbol}"}
    
    latest_close = data["Close"].iloc[-1]
    ma_20 = data["Close"].rolling(window=20).mean().iloc[-1]
    rsi = 100 - (100 / (1 + (data["Close"].pct_change().dropna().mean() / data["Close"].pct_change().dropna().std())))
    
    return {
        "symbol": symbol,
        "latest_close": round(latest_close, 2),
        "moving_average_20": round(ma_20, 2),
        "rsi": round(rsi, 2)
    }
