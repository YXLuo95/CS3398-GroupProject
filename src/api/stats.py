"""Stats aggregation endpoints for the Dashboard."""
 
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
 
from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User
from src.schemas import MonthlyStatsRead
from src.crud.stats import compute_monthly_stats
 
router = APIRouter()
 
 
@router.get("/monthly", response_model=MonthlyStatsRead)
async def get_monthly_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Return aggregated stats for the current month."""
    data = await compute_monthly_stats(session, current_user.id)
    return data
 