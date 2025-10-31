from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/status")
def get_status():
    return {"status": "API is running successfully!"}

