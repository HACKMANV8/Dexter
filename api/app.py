from fastapi import FastAPI
from .router import router

app = FastAPI(title="Main API")

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API root"}

