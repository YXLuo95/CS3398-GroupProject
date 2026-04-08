"""
Workout plan generator for Falcon Fitness.
Maps goal type -> exercise focus, activity level -> difficulty,
and workout_days -> training split.

Exercise data comes from the free-exercise-db dataset via exercise_db.py.
"""

from typing import List, Optional
from src.model import Exercise, FitnessGoal
from src.core import exercise_db


# ---------------------------------------------------------------------------
# Day schedules per split
# ---------------------------------------------------------------------------
_FULL_BODY = {
    1: ["chest", "back", "legs", "core"],
    2: ["shoulders", "back", "legs", "core"],
}

_UPPER_LOWER = {
    1: ["chest", "back", "shoulders", "biceps", "triceps"],
    2: ["legs", "core"],
    3: ["chest", "back", "shoulders", "biceps", "triceps"],
    4: ["legs", "core"],
}

_PPL = {
    1: ["chest", "shoulders", "triceps"],
    2: ["back", "biceps"],
    3: ["legs", "core"],
    4: ["chest", "shoulders", "triceps"],
    5: ["back", "biceps"],
    6: ["legs", "core"],
    7: ["chest", "back", "legs", "core"],
}

# Cardio exercises to append per day based on goal
_CARDIO_PER_DAY = {
    "lose_weight":       2,
    "improve_endurance": 3,
    "maintain":          1,
    "gain_muscle":       0,
}

# Strength exercises to pick per muscle group based on goal
_EXERCISES_PER_GROUP = {
    "lose_weight":       1,
    "improve_endurance": 1,
    "maintain":          2,
    "gain_muscle":       2,
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_difficulty(activity_level: str) -> str:
    if activity_level in ("sedentary", "lightly_active"):
        return "beginner"
    if activity_level == "moderately_active":
        return "intermediate"
    return "advanced"


def _get_schedule(workout_days: int) -> dict:
    if workout_days <= 2:
        base = _FULL_BODY
    elif workout_days <= 4:
        base = _UPPER_LOWER
    else:
        base = _PPL
    return {day: groups for day, groups in base.items() if day <= workout_days}


def _to_exercise(entry: dict, day: int) -> Exercise:
    return Exercise(
        name=entry["name"],
        muscle_group=entry["muscle_group"],
        sets=entry["sets"],
        reps=entry["reps"],
        difficulty=entry["difficulty"],
        day=day,
        youtube_url=entry.get("youtube_url"),
        image_url=entry.get("image_url"),
        instructions=entry.get("instructions"),
    )


# ---------------------------------------------------------------------------
# Swap helper — used by the swap endpoint
# ---------------------------------------------------------------------------

def get_swap_exercise(
    muscle_group: str,
    difficulty: str,
    exclude_name: str,
    equipment_available: Optional[List[str]] = None,
    limitations: Optional[str] = None,
) -> Optional[tuple]:
    """Return (name, image_url) for a random alternative exercise, or None."""
    entry = exercise_db.get_random_swap(
        muscle_group=muscle_group,
        difficulty=difficulty,
        exclude_name=exclude_name,
        equipment_available=equipment_available or [],
        limitations=limitations,
    )
    if not entry:
        return None
    return entry["name"], entry.get("image_url")


# ---------------------------------------------------------------------------
# Main plan generation — fallback (used when LLM is disabled or fails)
# ---------------------------------------------------------------------------

def generate_workout_plan(fitness_goal: FitnessGoal) -> List[Exercise]:
    """
    Generate a workout plan using the free-exercise-db dataset.
    Respects user's activity level, goal type, equipment, and limitations.
    Used as fallback when LLM-based generation fails or is disabled.
    """
    difficulty          = _get_difficulty(fitness_goal.activity_level)
    schedule            = _get_schedule(fitness_goal.workout_days)
    goal                = fitness_goal.goal_type
    exercises_per_group = _EXERCISES_PER_GROUP.get(goal, 2)
    cardio_count        = _CARDIO_PER_DAY.get(goal, 1)
    equipment           = getattr(fitness_goal, "equipment_available", []) or []
    limitations         = getattr(fitness_goal, "limitations", None)

    result: List[Exercise] = []

    for day, muscle_groups in schedule.items():
        for group in muscle_groups:
            entries = exercise_db.filter_exercises(
                muscle_group=group,
                difficulty=difficulty,
                equipment_available=equipment,
                limitations=limitations,
                count=exercises_per_group,
            )
            for entry in entries:
                result.append(_to_exercise(entry, day))

        # append cardio exercises for the day
        if cardio_count > 0:
            cardio_entries = exercise_db.filter_exercises(
                muscle_group="cardio",
                difficulty=difficulty,
                equipment_available=equipment,
                limitations=limitations,
                count=cardio_count,
            )
            for entry in cardio_entries:
                result.append(_to_exercise(entry, day))

    return result


# ---------------------------------------------------------------------------
# Catalog helpers — used by LLM-based generation in llm.py
# ---------------------------------------------------------------------------

def get_catalog_for_llm(
    difficulty: str,
    equipment_available: Optional[List[str]] = None,
    limitations: Optional[str] = None,
) -> List[dict]:
    """Return filtered exercise pool for the LLM to select from."""
    return exercise_db.get_all_for_llm(
        equipment_available=equipment_available or [],
        limitations=limitations,
        difficulty=difficulty,
    )


def build_exercise_from_db(name: str, day: int, instructions: Optional[str] = None) -> Optional[Exercise]:
    """Build an Exercise object from db data by name. Used by LLM path."""
    entry = exercise_db.get_exercise_by_name(name)
    if not entry:
        return None
    return Exercise(
        name=entry["name"],
        muscle_group=entry["muscle_group"],
        sets=entry["sets"],
        reps=entry["reps"],
        difficulty=entry["difficulty"],
        day=day,
        youtube_url=entry.get("youtube_url"),
        image_url=entry.get("image_url"),
        instructions=instructions or entry.get("instructions"),
    )
