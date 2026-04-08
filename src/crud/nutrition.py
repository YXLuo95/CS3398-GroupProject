"""CRUD operations for NutritionPlan."""

from typing import Optional, List
from datetime import datetime, date
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import NutritionPlan


async def get_plans_by_user_id(
    session: AsyncSession, user_id: int
) -> List[NutritionPlan]:
    """Fetch all nutrition plans for a user, newest first."""
    statement = (
        select(NutritionPlan)
        .where(NutritionPlan.user_id == user_id)
        .order_by(NutritionPlan.created_at.desc())
    )
    result = await session.execute(statement)
    return result.scalars().all()


async def get_today_plan(
    session: AsyncSession, user_id: int
) -> Optional[NutritionPlan]:
    """Check if user already has a nutrition plan generated today."""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())

    statement = (
        select(NutritionPlan)
        .where(NutritionPlan.user_id == user_id)
        .where(NutritionPlan.created_at >= today_start)
        .where(NutritionPlan.created_at <= today_end)
    )
    result = await session.execute(statement)
    return result.scalars().first()


async def create_nutrition_plan(
    session: AsyncSession, plan: NutritionPlan
) -> NutritionPlan:
    """Save a new nutrition plan to the database."""
    session.add(plan)
    await session.commit()
    await session.refresh(plan)
    return plan