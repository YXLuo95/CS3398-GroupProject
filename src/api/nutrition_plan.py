"""
Nutrition plan endpoints.
Generate: queues an LLM task via Redis (one per day).
Get: returns all plans for the current user.
"""

import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List

from src.core.database import get_session
from src.core.auth import get_current_user
from src.model import User, FitnessGoal, FitnessRecord, NutritionPlan
from src.schemas import NutritionPlanRead
from src.crud.nutrition import get_plans_by_user_id, get_today_plan

router = APIRouter()


@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def enqueue_nutrition_plan(
    request: Request,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Queue a nutrition plan generation task.
    Limited to ONE plan per user per day.
    Requires quiz data to compute macros.
    """

    # ==========================================
    # 1. Daily limit check
    # ==========================================
    existing_today = await get_today_plan(session, current_user.id)
    if existing_today:
        raise HTTPException(
            status_code=429,
            detail="You have already generated a nutrition plan today. Come back tomorrow!"
        )

    # ==========================================
    # 2. Require quiz data
    # ==========================================
    goal_stmt = select(FitnessGoal).where(FitnessGoal.user_id == current_user.id)
    goal_result = await session.execute(goal_stmt)
    goal = goal_result.scalars().first()

    if not goal:
        raise HTTPException(
            status_code=400,
            detail="No fitness goal found. Complete the quiz first."
        )

    # ==========================================
    # 3. Compute macro targets from quiz data
    # ==========================================
    cal_target = round(goal.tdee) if goal.tdee else 2000
    if goal.goal_type == "lose_weight":
        cal_target -= 500
    elif goal.goal_type == "gain_muscle":
        cal_target += 300

    protein_g = round(goal.weight_lbs * 1.0)
    fat_g = round((cal_target * 0.25) / 9)
    carbs_g = round((cal_target - (protein_g * 4) - (fat_g * 9)) / 4)

    # ==========================================
    # 4. Build data summary for LLM
    # ==========================================
    data_summary = (
        f"Goal: {goal.goal_type.replace('_', ' ')}. "
        f"Age: {goal.age}, Gender: {goal.gender}. "
        f"Weight: {goal.weight_lbs} lbs, Height: {goal.height_in} in. "
        f"Activity level: {goal.activity_level.replace('_', ' ')}. "
        f"Workout days: {goal.workout_days}/week. "
        f"Daily targets: {cal_target} kcal, {protein_g}g protein, {fat_g}g fat, {carbs_g}g carbs."
    )

    if goal.target_weight:
        data_summary += f" Target weight: {goal.target_weight} lbs."
    if goal.dietary_preferences:
        data_summary += f" Dietary preferences: {', '.join(goal.dietary_preferences)}."
    if goal.allergies:
        data_summary += f" Allergies: {', '.join(goal.allergies)}."
    if goal.limitations:
        data_summary += f" Physical limitations: {goal.limitations}."

    # Also pull latest weight from records if available
    record_stmt = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == current_user.id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(1)
    )
    record_result = await session.execute(record_stmt)
    latest_record = record_result.scalars().first()
    if latest_record and latest_record.weight_lbs != goal.weight_lbs:
        data_summary += f" Latest recorded weight: {latest_record.weight_lbs} lbs."

    # ==========================================
    # 5. Push to Redis queue
    # ==========================================
    task_payload = {
        "type": "nutrition_plan",
        "user_id": current_user.id,
        "summary": data_summary,
        "calories": cal_target,
        "protein_g": protein_g,
        "fat_g": fat_g,
        "carbs_g": carbs_g,
    }

    try:
        await request.app.state.redis_queue.lpush(
            "nutrition_plan_queue",
            json.dumps(task_payload)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue task in Redis: {str(e)}"
        )

    return {
        "message": "Nutrition plan generation queued successfully!",
        "status": "pending",
        "macros": {
            "calories": cal_target,
            "protein_g": protein_g,
            "fat_g": fat_g,
            "carbs_g": carbs_g,
        },
    }


@router.get("", response_model=List[NutritionPlanRead])
async def get_my_nutrition_plans(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """Get all nutrition plans for the current user, newest first."""
    return await get_plans_by_user_id(session, current_user.id)