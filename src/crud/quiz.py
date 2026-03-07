"""CRUD operations for FitnessGoal (quiz data)."""

from typing import Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.model import FitnessGoal


async def get_goal_by_user_id(session: AsyncSession, user_id: int) -> Optional[FitnessGoal]:
    """Fetch user's quiz data, returns None if not found."""
    statement = select(FitnessGoal).where(FitnessGoal.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().first()


async def create_goal(session: AsyncSession, goal: FitnessGoal) -> FitnessGoal:
    """Save new quiz submission to database."""
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return goal


async def update_goal(session: AsyncSession, goal: FitnessGoal) -> FitnessGoal:
    """Update existing quiz data."""
    await session.commit()
    await session.refresh(goal)
    return goal
