"""
Workout plan endpoints.
All endpoints require authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.workout_generator import generate_workout_plan
from src.model import User, WorkoutPlan
from src.schemas import WorkoutPlanRead
from src.crud.quiz import get_goal_by_user_id
from src.crud.workout import get_plan_by_user_id, create_plan, delete_plan

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
    return plan


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
