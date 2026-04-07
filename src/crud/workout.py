"""CRUD operations for WorkoutPlan, Exercise, and CompletedWorkout."""

from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.model import WorkoutPlan, Exercise, CompletedWorkout


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
    """Delete workout plan, its exercises, and all completion records."""
    statement = select(Exercise).where(Exercise.plan_id == plan.id)
    result = await session.execute(statement)
    for exercise in result.scalars().all():
        await session.delete(exercise)

    completions = await session.execute(
        select(CompletedWorkout).where(CompletedWorkout.plan_id == plan.id)
    )
    for completion in completions.scalars().all():
        await session.delete(completion)

    await session.delete(plan)
    await session.commit()


async def create_completion(
    session: AsyncSession,
    user_id: int,
    plan_id: int,
    day: int,
) -> CompletedWorkout:
    """Record a completed workout day."""
    completion = CompletedWorkout(user_id=user_id, plan_id=plan_id, day=day)
    session.add(completion)
    await session.commit()
    await session.refresh(completion)
    return completion


async def get_completions_by_user(
    session: AsyncSession,
    user_id: int,
    plan_id: int,
) -> List[CompletedWorkout]:
    """Return all completions for the current plan within the current calendar week."""
    today = datetime.now(timezone.utc)
    week_start = today - timedelta(days=today.weekday())
    week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)

    statement = (
        select(CompletedWorkout)
        .where(CompletedWorkout.user_id == user_id)
        .where(CompletedWorkout.plan_id == plan_id)
        .where(CompletedWorkout.completed_at >= week_start)
    )
    result = await session.execute(statement)
    return result.scalars().all()


async def delete_completion(session: AsyncSession, completion: CompletedWorkout) -> None:
    """Remove a completed workout day record."""
    await session.delete(completion)
    await session.commit()


async def get_completion_for_day(
    session: AsyncSession,
    user_id: int,
    plan_id: int,
    day: int,
) -> Optional[CompletedWorkout]:
    """Check if a specific day is already marked complete."""
    statement = (
        select(CompletedWorkout)
        .where(CompletedWorkout.user_id == user_id)
        .where(CompletedWorkout.plan_id == plan_id)
        .where(CompletedWorkout.day == day)
    )
    result = await session.execute(statement)
    return result.scalars().first()
