from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app instance
app = FastAPI(
    title="AlphaFusion API",
    description="Backend for stock sentiment, fundamental, and technical analysis",
    version="1.0.0"
)

# Allow frontend (React, etc.) to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can replace * with your frontend URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "AlphaFusion backend is running successfully 🚀"}

# Example endpoint for testing JSON data
@app.get("/api/stocks")
def get_stock_data():
    # Example static data (replace with your logic later)
    data = {
        "NIFTY50": {"value": 21987.50, "change": "+0.65%"},
        "SENSEX": {"value": 73123.22, "change": "+0.48%"},
        "recommended": ["TCS", "Infosys", "HDFC Bank"]
    }
    return data

# Example POST endpoint (for future use)
@app.post("/api/analyze")
def analyze_stock(stock: str):
    return {"stock": stock, "status": "Analysis complete"}
