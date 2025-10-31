# Analytics/api/app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .router import router as analytics_router

app = FastAPI(title="AlphaFusion Analytics API", version="1.0")

# allow your vite dev server (change if hosting elsewhere)
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
def root():
    return {"message": "AlphaFusion Analytics API running"}
