"""
Onboarding quiz endpoints.
All endpoints require authentication.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.health_calculations import calculate_bmi, calculate_bmr, calculate_tdee
from src.model import User, FitnessGoal
from src.schemas import QuizSubmit, FitnessGoalRead, QuizStatusRead
from src.crud.quiz import get_goal_by_user_id, create_goal, update_goal

router = APIRouter()


@router.post("/quiz", response_model=FitnessGoalRead, status_code=status.HTTP_201_CREATED)
async def submit_quiz(
    quiz_data: QuizSubmit,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Submit quiz and calculate health metrics (BMI, BMR, TDEE)."""
    existing = await get_goal_by_user_id(session, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Quiz already submitted. Use PUT to update.")

    bmi = calculate_bmi(quiz_data.weight_kg, quiz_data.height_cm)
    bmr = calculate_bmr(quiz_data.weight_kg, quiz_data.height_cm, quiz_data.age, quiz_data.gender)
    tdee = calculate_tdee(bmr, quiz_data.activity_level)

    goal = FitnessGoal(
        user_id=current_user.id,
        goal_type=quiz_data.goal_type,
        age=quiz_data.age,
        gender=quiz_data.gender,
        height_cm=quiz_data.height_cm,
        weight_kg=quiz_data.weight_kg,
        target_weight=quiz_data.target_weight,
        activity_level=quiz_data.activity_level,
        workout_days=quiz_data.workout_days,
        dietary_preferences=json.dumps(quiz_data.dietary_preferences),
        allergies=json.dumps(quiz_data.allergies),
        limitations=quiz_data.limitations,
        bmi=bmi,
        bmr=bmr,
        tdee=tdee,
        quiz_completed=True,
    )

    return await create_goal(session, goal)


@router.get("/quiz", response_model=FitnessGoalRead)
async def get_quiz(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Get user's saved quiz data."""
    goal = await get_goal_by_user_id(session, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return goal


@router.put("/quiz", response_model=FitnessGoalRead)
async def update_quiz(
    quiz_data: QuizSubmit,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retake quiz and recalculate metrics."""
    goal = await get_goal_by_user_id(session, current_user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Quiz not found. Submit first.")

    bmi = calculate_bmi(quiz_data.weight_kg, quiz_data.height_cm)
    bmr = calculate_bmr(quiz_data.weight_kg, quiz_data.height_cm, quiz_data.age, quiz_data.gender)
    tdee = calculate_tdee(bmr, quiz_data.activity_level)

    goal.goal_type = quiz_data.goal_type
    goal.age = quiz_data.age
    goal.gender = quiz_data.gender
    goal.height_cm = quiz_data.height_cm
    goal.weight_kg = quiz_data.weight_kg
    goal.target_weight = quiz_data.target_weight
    goal.activity_level = quiz_data.activity_level
    goal.workout_days = quiz_data.workout_days
    goal.dietary_preferences = json.dumps(quiz_data.dietary_preferences)
    goal.allergies = json.dumps(quiz_data.allergies)
    goal.limitations = quiz_data.limitations
    goal.bmi = bmi
    goal.bmr = bmr
    goal.tdee = tdee

    return await update_goal(session, goal)


@router.get("/status", response_model=QuizStatusRead)
async def get_status(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Check if user has completed the quiz."""
    goal = await get_goal_by_user_id(session, current_user.id)
    return QuizStatusRead(completed=goal is not None and goal.quiz_completed)
