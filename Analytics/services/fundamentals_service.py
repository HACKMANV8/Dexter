import yfinance as yf

def get_fundamentals(symbol: str):
    stock = yf.Ticker(symbol)
    info = stock.info
    return {
        "symbol": symbol,
        "company": info.get("longName"),
        "sector": info.get("sector"),
        "marketCap": info.get("marketCap"),
        "trailingPE": info.get("trailingPE"),
        "dividendYield": info.get("dividendYield"),
        "fiftyTwoWeekHigh": info.get("fiftyTwoWeekHigh"),
        "fiftyTwoWeekLow": info.get("fiftyTwoWeekLow"),
    }
