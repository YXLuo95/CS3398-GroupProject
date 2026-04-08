"""
Workout plan endpoints.
All endpoints require authentication.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.workout_generator import generate_workout_plan, get_swap_exercise
from src.model import User, WorkoutPlan, Exercise
from src.schemas import WorkoutPlanRead, CompletedWorkoutCreate, CompletedWorkoutRead, ExerciseRead, WorkoutSetCreate, WorkoutSetRead
from src.crud.quiz import get_goal_by_user_id
from src.crud.workout import (
    get_plan_by_user_id, create_plan, delete_plan,
    create_completion, get_completions_by_user, get_completion_for_day, delete_completion,
    log_set, unlog_set, get_sets_for_plan, swap_exercise,
)

router = APIRouter()


@router.post("/plan", response_model=WorkoutPlanRead, status_code=status.HTTP_201_CREATED)
async def generate_plan(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Generate and save a personalized workout plan based on the user's fitness goal."""
    goal = await get_goal_by_user_id(session, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="No fitness goal found. Complete the quiz first.")

    existing = await get_plan_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Plan already exists. Delete it first to regenerate.")

    exercises = generate_workout_plan(goal)

    plan = WorkoutPlan(
        user_id=current_user.id,
        fitness_goal_id=goal.id,
    )

    return await create_plan(session, plan, exercises)


@router.get("/plan", response_model=WorkoutPlanRead)
async def get_plan(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get user's saved workout plan with all exercises."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found. Generate one first.")
    goal = await get_goal_by_user_id(session, current_user.id)
    plan_read = WorkoutPlanRead.model_validate(plan)
    if goal and goal.updated_at > plan.generated_at:
        plan_read.stale = True
    return plan_read


@router.delete("/plan", status_code=status.HTTP_204_NO_CONTENT)
async def remove_plan(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Delete workout plan so the user can regenerate."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found.")
    await delete_plan(session, plan)


@router.post("/complete", response_model=CompletedWorkoutRead, status_code=status.HTTP_201_CREATED)
async def mark_complete(
    data: CompletedWorkoutCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Mark a workout day as complete."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found.")

    already_done = await get_completion_for_day(session, current_user.id, plan.id, data.day)
    if already_done:
        raise HTTPException(status_code=400, detail=f"Day {data.day} already marked complete.")

    return await create_completion(session, current_user.id, plan.id, data.day)


@router.delete("/complete/{day}", status_code=status.HTTP_204_NO_CONTENT)
async def unmark_complete(
    day: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Unmark a workout day as complete."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found.")
    completion = await get_completion_for_day(session, current_user.id, plan.id, day)
    if not completion:
        raise HTTPException(status_code=404, detail=f"Day {day} is not marked complete.")
    await delete_completion(session, completion)


@router.get("/complete", response_model=List[CompletedWorkoutRead])
async def get_completions(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get all completed workout days for the current plan and week."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        return []
    return await get_completions_by_user(session, current_user.id, plan.id)


# ── Sets tracker ──────────────────────────────────────────────────────────────

@router.post("/sets", response_model=WorkoutSetRead, status_code=status.HTTP_201_CREATED)
async def log_set_endpoint(
    data: WorkoutSetCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Log a completed set for an exercise."""
    return await log_set(session, current_user.id, data.exercise_id, data.set_number)


@router.delete("/sets/{exercise_id}/{set_number}", status_code=status.HTTP_204_NO_CONTENT)
async def unlog_set_endpoint(
    exercise_id: int,
    set_number: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Remove a logged set."""
    await unlog_set(session, current_user.id, exercise_id, set_number)


@router.get("/sets", response_model=List[WorkoutSetRead])
async def get_sets_endpoint(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get all logged sets for current plan this week."""
    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan:
        return []
    exercise_ids = [ex.id for ex in plan.exercises]
    return await get_sets_for_plan(session, current_user.id, exercise_ids)


# ── Exercise swap ─────────────────────────────────────────────────────────────

@router.put("/exercise/{exercise_id}/swap", response_model=ExerciseRead)
async def swap_exercise_endpoint(
    exercise_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Replace an exercise with a random alternative of the same muscle group and difficulty."""
    result = await session.execute(select(Exercise).where(Exercise.id == exercise_id))
    exercise = result.scalars().first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found.")

    plan = await get_plan_by_user_id(session, current_user.id)
    if not plan or exercise.plan_id != plan.id:
        raise HTTPException(status_code=403, detail="Not your exercise.")

    goal = await get_goal_by_user_id(session, current_user.id)
    equipment  = getattr(goal, "equipment_available", []) if goal else []
    limitations = getattr(goal, "limitations", None) if goal else None

    alt = get_swap_exercise(exercise.muscle_group, exercise.difficulty, exercise.name, equipment, limitations)
    if not alt:
        raise HTTPException(status_code=400, detail="No alternatives available for this exercise.")

    new_name, new_image = alt
    return await swap_exercise(session, exercise, new_name, new_image)
