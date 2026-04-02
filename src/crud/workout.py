"""CRUD operations for WorkoutPlan and Exercise."""

from typing import Optional, List
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.model import WorkoutPlan, Exercise


async def get_plan_by_user_id(session: AsyncSession, user_id: int) -> Optional[WorkoutPlan]:
    """Fetch user's workout plan with all exercises loaded."""
    statement = (
        select(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id)
        .options(selectinload(WorkoutPlan.exercises))
    )
    result = await session.execute(statement)
    return result.scalars().first()


async def create_plan(
    session: AsyncSession,
    plan: WorkoutPlan,
    exercises: List[Exercise],
) -> WorkoutPlan:
    """Save WorkoutPlan and its exercises, returns plan with exercises loaded."""
    session.add(plan)
    await session.flush()  # get plan.id before inserting exercises

    for exercise in exercises:
        exercise.plan_id = plan.id
        session.add(exercise)

    await session.commit()

    # reload with exercises
    return await get_plan_by_user_id(session, plan.user_id)


async def delete_plan(session: AsyncSession, plan: WorkoutPlan) -> None:
    """Delete workout plan and all its exercises."""
    # load exercises if not already loaded
    statement = select(Exercise).where(Exercise.plan_id == plan.id)
    result = await session.execute(statement)
    exercises = result.scalars().all()

    for exercise in exercises:
        await session.delete(exercise)

    await session.delete(plan)
    await session.commit()
