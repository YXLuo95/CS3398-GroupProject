from fastapi import APIRouter, Request
from src.core.supplement_engine import get_supplement_recommendations

router = APIRouter()

@router.post("/api/supplements")
async def get_supplements(request: Request):
    data = await request.json()
    supplements = get_supplement_recommendations(data)
    return {"supplements": supplements}