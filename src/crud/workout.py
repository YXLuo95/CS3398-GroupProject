"""CRUD operations for WorkoutPlan, Exercise, CompletedWorkout, and WorkoutSet."""

from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.model import WorkoutPlan, Exercise, CompletedWorkout, WorkoutSet


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


async def log_set(session: AsyncSession, user_id: int, exercise_id: int, set_number: int) -> WorkoutSet:
    """Log a completed set. Silently returns existing if already logged this week."""
    today = datetime.now(timezone.utc)
    week_start = (today - timedelta(days=today.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    existing = await session.execute(
        select(WorkoutSet)
        .where(WorkoutSet.user_id == user_id)
        .where(WorkoutSet.exercise_id == exercise_id)
        .where(WorkoutSet.set_number == set_number)
        .where(WorkoutSet.logged_at >= week_start)
    )
    row = existing.scalars().first()
    if row:
        return row
    ws = WorkoutSet(user_id=user_id, exercise_id=exercise_id, set_number=set_number)
    session.add(ws)
    await session.commit()
    await session.refresh(ws)
    return ws


async def unlog_set(session: AsyncSession, user_id: int, exercise_id: int, set_number: int) -> None:
    """Remove a logged set for the current week."""
    today = datetime.now(timezone.utc)
    week_start = (today - timedelta(days=today.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    result = await session.execute(
        select(WorkoutSet)
        .where(WorkoutSet.user_id == user_id)
        .where(WorkoutSet.exercise_id == exercise_id)
        .where(WorkoutSet.set_number == set_number)
        .where(WorkoutSet.logged_at >= week_start)
    )
    row = result.scalars().first()
    if row:
        await session.delete(row)
        await session.commit()


async def get_sets_for_plan(session: AsyncSession, user_id: int, exercise_ids: List[int]) -> List[WorkoutSet]:
    """Return all logged sets for given exercises in the current week."""
    today = datetime.now(timezone.utc)
    week_start = (today - timedelta(days=today.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
    result = await session.execute(
        select(WorkoutSet)
        .where(WorkoutSet.user_id == user_id)
        .where(WorkoutSet.exercise_id.in_(exercise_ids))
        .where(WorkoutSet.logged_at >= week_start)
    )
    return result.scalars().all()


async def swap_exercise(session: AsyncSession, exercise: Exercise, new_name: str, new_image_url: Optional[str], new_instructions: Optional[str] = None) -> Exercise:
    """Replace exercise name, image, and instructions in-place."""
    exercise.name = new_name
    exercise.image_url = new_image_url
    exercise.instructions = new_instructions
    session.add(exercise)
    await session.commit()
    await session.refresh(exercise)
    return exercise


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


async def get_workout_history(
    session: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 20,
) -> List[dict]:
    """
    Return all completed workout days across all weeks, newest first.
    For each completed day, include exercises done and sets logged that day.
    """
    # Fetch all completed workouts for this user, newest first
    completions_result = await session.execute(
        select(CompletedWorkout)
        .where(CompletedWorkout.user_id == user_id)
        .order_by(CompletedWorkout.completed_at.desc())
        .offset(skip)
        .limit(limit)
    )
    completions = completions_result.scalars().all()

    if not completions:
        return []

    history = []
    for completion in completions:
        # Get exercises for this plan day
        exercises_result = await session.execute(
            select(Exercise)
            .where(Exercise.plan_id == completion.plan_id)
            .where(Exercise.day == completion.day)
        )
        exercises = exercises_result.scalars().all()

        # Count sets logged on the completion date (same calendar day)
        day_start = completion.completed_at.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = completion.completed_at.replace(hour=23, minute=59, second=59, microsecond=999999)
        exercise_ids = [ex.id for ex in exercises]

        sets_count = 0
        if exercise_ids:
            sets_result = await session.execute(
                select(WorkoutSet)
                .where(WorkoutSet.user_id == user_id)
                .where(WorkoutSet.exercise_id.in_(exercise_ids))
                .where(WorkoutSet.logged_at >= day_start)
                .where(WorkoutSet.logged_at <= day_end)
            )
            sets_count = len(sets_result.scalars().all())

        history.append({
            "id":           completion.id,
            "day":          completion.day,
            "completed_at": completion.completed_at,
            "exercises": [
                {
                    "name":         ex.name,
                    "muscle_group": ex.muscle_group,
                    "sets":         ex.sets,
                    "reps":         ex.reps,
                }
                for ex in exercises
            ],
            "sets_logged": sets_count,
        })

    return history


async def get_workout_history_count(session: AsyncSession, user_id: int) -> int:
    """Total number of completed workout days for pagination."""
    result = await session.execute(
        select(CompletedWorkout).where(CompletedWorkout.user_id == user_id)
    )
    return len(result.scalars().all())
