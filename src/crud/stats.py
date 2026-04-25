"""Aggregate stats across existing tables for the monthly dashboard card."""
 
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from src.model import CompletedWorkout, FitnessRecord, FitnessGoal
 
 
def _start_of_month() -> datetime:
    now = datetime.now(timezone.utc)
    return datetime(now.year, now.month, 1, tzinfo=timezone.utc)
 
 
def _weeks_in_current_month() -> float:
    """How many weeks have elapsed in the current month (partial weeks count)."""
    now = datetime.now(timezone.utc)
    elapsed_days = (now - _start_of_month()).days + 1
    return max(1.0, elapsed_days / 7.0)
 
 
async def compute_monthly_stats(session: AsyncSession, user_id: int) -> dict:
    """Aggregate stats for the current calendar month."""
    month_start = _start_of_month()
 
    # -- 1. Workouts completed this month
    workouts_stmt = (
        select(CompletedWorkout)
        .where(CompletedWorkout.user_id == user_id)
        .where(CompletedWorkout.completed_at >= month_start)
    )
    workouts_result = await session.execute(workouts_stmt)
    workouts_completed = len(workouts_result.scalars().all())
 
    # -- 2. Target workouts this month (workout_days/week × weeks elapsed)
    goal_stmt = select(FitnessGoal).where(FitnessGoal.user_id == user_id)
    goal_result = await session.execute(goal_stmt)
    goal = goal_result.scalars().first()
 
    workouts_target = None
    target_weight = None
    if goal:
        workouts_target = int(round(goal.workout_days * _weeks_in_current_month()))
        target_weight = goal.target_weight
 
    # -- 3. Weight change this month (first record of month vs latest)
    weight_change = None
    weight_start_date = None
 
    first_stmt = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == user_id)
        .where(FitnessRecord.created_at >= month_start)
        .order_by(FitnessRecord.created_at.asc())
        .limit(1)
    )
    first_result = await session.execute(first_stmt)
    first_record = first_result.scalars().first()
 
    latest_stmt = (
        select(FitnessRecord)
        .where(FitnessRecord.user_id == user_id)
        .order_by(FitnessRecord.created_at.desc())
        .limit(1)
    )
    latest_result = await session.execute(latest_stmt)
    latest_record = latest_result.scalars().first()
 
    if first_record and latest_record:
        weight_change = round(latest_record.weight_lbs - first_record.weight_lbs, 1)
        weight_start_date = first_record.created_at.isoformat()
 
    # -- 4. Goal progress % (start_weight → target_weight, % traveled)
    goal_progress_pct = None
    if goal and target_weight and latest_record:
        # Use the earliest weight record as "starting point" (across all history)
        starting_stmt = (
            select(FitnessRecord)
            .where(FitnessRecord.user_id == user_id)
            .order_by(FitnessRecord.created_at.asc())
            .limit(1)
        )
        starting_result = await session.execute(starting_stmt)
        starting_record = starting_result.scalars().first()
 
        if starting_record:
            start_w = starting_record.weight_lbs
            current_w = latest_record.weight_lbs
            total_distance = abs(start_w - target_weight)
            traveled = abs(start_w - current_w)
 
            if total_distance > 0:
                # Clamp to 0-100
                pct = round(min(100, (traveled / total_distance) * 100))
                # If they moved in wrong direction, still show 0 (no negative %)
                direction_ok = (
                    (target_weight < start_w and current_w <= start_w)
                    or (target_weight > start_w and current_w >= start_w)
                    or (target_weight == start_w)
                )
                goal_progress_pct = pct if direction_ok else 0
 
    # -- 5. Streak (consecutive days with a CompletedWorkout, counted from today backwards)
    streak_days = 0
    all_workouts_stmt = (
        select(CompletedWorkout)
        .where(CompletedWorkout.user_id == user_id)
        .order_by(CompletedWorkout.completed_at.desc())
    )
    all_workouts_result = await session.execute(all_workouts_stmt)
    all_completions = all_workouts_result.scalars().all()
 
    if all_completions:
        # Build set of dates (UTC) on which user completed something
        completion_dates = set()
        for cw in all_completions:
            completion_dates.add(cw.completed_at.date())
 
        # Count backwards from today
        today = datetime.now(timezone.utc).date()
        cursor = today
        while cursor in completion_dates:
            streak_days += 1
            cursor = cursor - timedelta(days=1)
 
        # If nothing today but yesterday, count from yesterday
        if streak_days == 0 and (today - timedelta(days=1)) in completion_dates:
            cursor = today - timedelta(days=1)
            while cursor in completion_dates:
                streak_days += 1
                cursor = cursor - timedelta(days=1)
 
    return {
        "workouts_completed": workouts_completed,
        "workouts_target": workouts_target,
        "weight_change_lbs": weight_change,
        "weight_start_date": weight_start_date,
        "goal_progress_pct": goal_progress_pct,
        "streak_days": streak_days,
    }