import json
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy import func, cast, Date

# importing dependencies for database session management and user authentication    
from src.core.database import get_session
from src.core.auth import get_current_user
from src.core.config import settings
from typing import List

#added to improve data summary
from src.model import User, FitnessRecord, FitnessReport, FitnessGoal

router = APIRouter()

@router.post("/generate", status_code=status.HTTP_202_ACCEPTED)
async def enqueue_fitness_report(
    request: Request, 
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    Queue a fitness report generation task for the current user.
    This endpoint extracts recent data and delegates the heavy LLM inference to a Redis background worker.
    Limited to ONE report per user per day.
    """
    
    # ==========================================
    # 0. Daily Limit Check — one report per day
    # ==========================================
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    
    existing_today = await session.execute(
        select(FitnessReport)
        .where(FitnessReport.user_id == current_user.id)
        .where(FitnessReport.created_at >= today_start)
        .where(FitnessReport.created_at <= today_end)
    )
    if existing_today.scalars().first():
        raise HTTPException(
            status_code=429, 
            detail="You have already generated a report today. Come back tomorrow!"
        )

    # ==========================================
    # 1. Pre processing & Data Extraction
    # ==========================================
    
    # Pull recent fitness records
    statement = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == current_user.id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(10)
    )
    result = await session.execute(statement)
    records = result.scalars().all()

    if not records:
        raise HTTPException(status_code=400, detail="No fitness records found. Please log your data on the dashboard first.")
    
    latest_record = records[0]

    # Build weight trend summary
    if len(records) == 1:
        data_summary = (
            f"Current baseline: Weight {latest_record.weight_lbs} lbs, "
            f"Height {latest_record.height_in} inches. "
            f"Goal: {latest_record.fitness_goal}. "
            f"Activity Level: {latest_record.activity_level}."
        )
    else:
        oldest_record = records[-1]
        total_change = latest_record.weight_lbs - oldest_record.weight_lbs
        total_trend = "gained" if total_change > 0 else "lost"

        weight_timeline = ", ".join(
            f"{r.weight_lbs} lbs ({r.created_at.strftime('%m/%d')})"
            for r in reversed(records)
        )

        data_summary = (
            f"Current: Weight {latest_record.weight_lbs} lbs, "
            f"Height {latest_record.height_in} inches. "
            f"Weight history (oldest to newest): {weight_timeline}. "
            f"Over {len(records)} records, the user has {total_trend} "
            f"{abs(total_change):.1f} lbs total. "
            f"Goal: {latest_record.fitness_goal}. "
            f"Activity Level: {latest_record.activity_level}."
        )

    # Pull user's fitness goal for richer context
    goal_statement = select(FitnessGoal).where(FitnessGoal.user_id == current_user.id)
    goal_result = await session.execute(goal_statement)
    goal = goal_result.scalars().first()

    if goal:
        if goal.target_weight:
            data_summary += f" Target weight: {goal.target_weight} lbs."
        if goal.workout_days:
            data_summary += f" Workout days per week: {goal.workout_days}."
        if goal.bmi or goal.bmr or goal.tdee:
            data_summary += f" BMI: {goal.bmi}, BMR: {goal.bmr}, TDEE: {goal.tdee}."
        if goal.dietary_preferences:
            data_summary += f" Dietary preferences: {', '.join(goal.dietary_preferences)}."
        if goal.allergies:
            data_summary += f" Allergies: {', '.join(goal.allergies)}."
        if goal.limitations:
            data_summary += f" Physical limitations: {goal.limitations}."
        if goal.target_weight and latest_record:
            weight_to_go = latest_record.weight_lbs - goal.target_weight
            direction = "lose" if weight_to_go > 0 else "gain"
            data_summary += (
                f" Target weight: {goal.target_weight} lbs."
                f" User needs to {direction} {abs(weight_to_go):.1f} lbs to reach target."
            )

    # ==========================================
    # 2. Push Task to Redis Queue (Producer)
    # ==========================================
    task_payload = {
        "user_id": current_user.id,
        "age": latest_record.age,
        "gender": latest_record.gender,
        "summary": data_summary
    }
    
    try:
        await request.app.state.redis_queue.lpush(
            "fitness_report_queue", 
            json.dumps(task_payload)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue task in Redis: {str(e)}")

    # ==========================================
    # 3. Return Immediate Response
    # ==========================================
    return {
        "message": "Fitness report generation queued successfully!",
        "status": "pending",
        "action_required": "Please check your report history in a few moments."
    }

# ==========================================
# GETTER: This is the bridge for React to see the DB data
# ==========================================
@router.get("", response_model=List[FitnessReport])
async def get_my_reports(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    """
    React calls this to pull the latest report from the Database.
    """
    statement = (
        select(FitnessReport)
        .where(FitnessReport.user_id == current_user.id)
        .order_by(FitnessReport.created_at.desc())
    )
    result = await session.execute(statement)
    return result.scalars().all()