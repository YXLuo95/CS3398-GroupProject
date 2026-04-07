"""
Workout plan generator for Falcon Fitness.
Maps goal type -> exercise focus, activity level -> difficulty,
and workout_days -> training split.
"""

from typing import List
from src.model import Exercise, FitnessGoal

_GH_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

# Maps exercise name -> free-exercise-db folder slug (partial coverage, others get None)
_IMAGE_MAP: dict = {
    "Incline Push-Up":           "Incline_Push-Up",
    "Dumbbell Bench Press":      "Dumbbell_Bench_Press",
    "Barbell Bench Press":       "Barbell_Bench_Press_-_Medium_Grip",
    "Decline Dumbbell Press":    "Decline_Dumbbell_Bench_Press",
    "Bent-Over Dumbbell Row":    "Bent_Over_Two-Dumbbell_Row",
    "Superman Hold":             "Superman",
    "Seated Cable Row":          "Seated_Cable_Rows",
    "Barbell Deadlift":          "Barbell_Deadlift",
    "Dumbbell Shoulder Press":   "Dumbbell_Shoulder_Press",
    "Arnold Press":              "Arnold_Dumbbell_Press",
    "Face Pull":                 "Face_Pull",
    "Hammer Curl":               "Alternate_Hammer_Curl",
    "Barbell Curl":              "Barbell_Curl",
    "Incline Dumbbell Curl":     "Incline_Dumbbell_Curl",
    "Spider Curl":               "Spider_Curl",
    "Skull Crusher":             "Decline_Close-Grip_Bench_To_Skull_Crusher",
    "Bodyweight Squat":          "Bodyweight_Squat",
    "Goblet Squat":              "Goblet_Squat",
    "Glute Bridge":              "Single_Leg_Glute_Bridge",
    "Walking Lunge":             "Bodyweight_Walking_Lunge",
    "Barbell Back Squat":        "Barbell_Full_Squat",
    "Barbell Romanian Deadlift": "Romanian_Deadlift",
    "Bulgarian Split Squat":     "Barbell_Bulgarian_Split_Squat",
    "Plank":                     "Plank",
    "Dead Bug":                  "Dead_Bug",
    "Russian Twist":             "Russian_Twist",
    "Hanging Leg Raise":         "Hanging_Leg_Raise",
    "Bicycle Crunch":            "Bicycle_Crunch",
    "Box Jump":                  "Box_Jump_(Multiple_Response)",
    "Burpee":                    "Burpees",
    "Jump Rope":                 "Tire_Jump",
}

def _image_url(name: str) -> str | None:
    slug = _IMAGE_MAP.get(name)
    if not slug:
        return None
    return f"{_GH_BASE}/{slug}/0.jpg"


# ---------------------------------------------------------------------------
# Exercise library — (name, muscle_group, sets, reps, difficulty, youtube_url)
# ---------------------------------------------------------------------------
_LIBRARY: dict = {
    "chest": {
        "beginner": [
            ("Push-Up",          "chest", "3", "10", "beginner", None),
            ("Incline Push-Up",  "chest", "3", "12", "beginner", None),
            ("Wall Push-Up",     "chest", "3", "15", "beginner", None),
        ],
        "intermediate": [
            ("Dumbbell Bench Press", "chest", "4", "10", "intermediate", None),
            ("Dumbbell Flye",        "chest", "3", "12", "intermediate", None),
            ("Push-Up with Pause",   "chest", "3", "10", "intermediate", None),
        ],
        "advanced": [
            ("Barbell Bench Press",    "chest", "5", "5",  "advanced", None),
            ("Weighted Dip",           "chest", "4", "8",  "advanced", None),
            ("Decline Dumbbell Press", "chest", "4", "10", "advanced", None),
        ],
    },
    "back": {
        "beginner": [
            ("Bent-Over Dumbbell Row", "back", "3", "10",     "beginner", None),
            ("Superman Hold",          "back", "3", "30 sec", "beginner", None),
            ("Resistance Band Row",    "back", "3", "12",     "beginner", None),
        ],
        "intermediate": [
            ("Pull-Up",                  "back", "3", "6",  "intermediate", None),
            ("Seated Cable Row",         "back", "4", "10", "intermediate", None),
            ("Single-Arm Dumbbell Row",  "back", "3", "10", "intermediate", None),
        ],
        "advanced": [
            ("Weighted Pull-Up",  "back", "4", "6", "advanced", None),
            ("Barbell Deadlift",  "back", "5", "5", "advanced", None),
            ("T-Bar Row",         "back", "4", "8", "advanced", None),
        ],
    },
    "shoulders": {
        "beginner": [
            ("Dumbbell Lateral Raise",      "shoulders", "3", "12", "beginner", None),
            ("Overhead Press (light DB)",   "shoulders", "3", "10", "beginner", None),
            ("Front Raise",                 "shoulders", "3", "12", "beginner", None),
        ],
        "intermediate": [
            ("Dumbbell Shoulder Press", "shoulders", "4", "10", "intermediate", None),
            ("Arnold Press",            "shoulders", "3", "10", "intermediate", None),
            ("Face Pull",               "shoulders", "3", "15", "intermediate", None),
        ],
        "advanced": [
            ("Barbell Overhead Press",   "shoulders", "5", "5",  "advanced", None),
            ("Barbell Upright Row",      "shoulders", "4", "8",  "advanced", None),
            ("Lateral Raise Drop Set",   "shoulders", "4", "10", "advanced", None),
        ],
    },
    "biceps": {
        "beginner": [
            ("Dumbbell Curl", "biceps", "3", "12", "beginner", None),
            ("Hammer Curl",   "biceps", "3", "10", "beginner", None),
        ],
        "intermediate": [
            ("Barbell Curl",         "biceps", "3", "10", "intermediate", None),
            ("Incline Dumbbell Curl","biceps", "3", "10", "intermediate", None),
        ],
        "advanced": [
            ("EZ-Bar Preacher Curl", "biceps", "4", "8",  "advanced", None),
            ("Spider Curl",          "biceps", "3", "10", "advanced", None),
        ],
    },
    "triceps": {
        "beginner": [
            ("Bench Tricep Dip",              "triceps", "3", "10", "beginner", None),
            ("Overhead DB Tricep Extension",  "triceps", "3", "12", "beginner", None),
        ],
        "intermediate": [
            ("Cable Tricep Pushdown", "triceps", "3", "12", "intermediate", None),
            ("Skull Crusher",         "triceps", "3", "10", "intermediate", None),
        ],
        "advanced": [
            ("Close-Grip Bench Press", "triceps", "4", "8", "advanced", None),
            ("Weighted Tricep Dip",    "triceps", "4", "8", "advanced", None),
        ],
    },
    "legs": {
        "beginner": [
            ("Bodyweight Squat", "legs", "3", "15", "beginner", None),
            ("Reverse Lunge",    "legs", "3", "10", "beginner", None),
            ("Glute Bridge",     "legs", "3", "15", "beginner", None),
        ],
        "intermediate": [
            ("Goblet Squat",          "legs", "4", "10", "intermediate", None),
            ("Romanian Deadlift (DB)","legs", "3", "10", "intermediate", None),
            ("Walking Lunge",         "legs", "3", "12", "intermediate", None),
        ],
        "advanced": [
            ("Barbell Back Squat",        "legs", "5", "5", "advanced", None),
            ("Barbell Romanian Deadlift", "legs", "4", "8", "advanced", None),
            ("Bulgarian Split Squat",     "legs", "4", "8", "advanced", None),
        ],
    },
    "core": {
        "beginner": [
            ("Plank",       "core", "3", "20 sec", "beginner", None),
            ("Dead Bug",    "core", "3", "8",      "beginner", None),
            ("Knee Crunch", "core", "3", "15",     "beginner", None),
        ],
        "intermediate": [
            ("Plank",           "core", "3", "45 sec", "intermediate", None),
            ("Bicycle Crunch",  "core", "3", "20",     "intermediate", None),
            ("Russian Twist",   "core", "3", "20",     "intermediate", None),
        ],
        "advanced": [
            ("Ab Wheel Rollout",  "core", "4", "10", "advanced", None),
            ("Hanging Leg Raise", "core", "4", "12", "advanced", None),
            ("Dragon Flag",       "core", "3", "6",  "advanced", None),
        ],
    },
    "cardio": {
        "beginner": [
            ("Brisk Walk", "cardio", "1", "20 min", "beginner", None),
            ("Jump Rope",  "cardio", "3", "2 min",  "beginner", None),
            ("Step-Up",    "cardio", "3", "15",     "beginner", None),
        ],
        "intermediate": [
            ("Jogging",        "cardio", "1", "25 min", "intermediate", None),
            ("Jumping Jacks",  "cardio", "4", "30 sec", "intermediate", None),
            ("Box Jump",       "cardio", "4", "8",      "intermediate", None),
        ],
        "advanced": [
            ("Sprint Intervals",        "cardio", "8", "30 sec on / 30 sec off", "advanced", None),
            ("Burpee",                  "cardio", "5", "10",                     "advanced", None),
            ("Jump Rope Double Unders", "cardio", "5", "30 sec",                 "advanced", None),
        ],
    },
}


# ---------------------------------------------------------------------------
# Day schedules per split — trimmed to workout_days at runtime
# ---------------------------------------------------------------------------
_FULL_BODY = {
    1: ["chest", "back", "legs", "core"],
    2: ["shoulders", "back", "legs", "core"],
}

_UPPER_LOWER = {
    1: ["chest", "back", "shoulders", "biceps", "triceps"],   # upper
    2: ["legs", "core"],                                        # lower
    3: ["chest", "back", "shoulders", "biceps", "triceps"],   # upper
    4: ["legs", "core"],                                        # lower
}

_PPL = {
    1: ["chest", "shoulders", "triceps"],        # push
    2: ["back", "biceps"],                        # pull
    3: ["legs", "core"],                          # legs
    4: ["chest", "shoulders", "triceps"],        # push
    5: ["back", "biceps"],                        # pull
    6: ["legs", "core"],                          # legs
    7: ["chest", "back", "legs", "core"],        # full body / active recovery
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


def _pick(muscle_group: str, difficulty: str, count: int, offset: int = 0) -> list:
    options = _LIBRARY.get(muscle_group, {}).get(difficulty, [])
    if not options:
        return []
    return [options[(offset + i) % len(options)] for i in range(min(count, len(options)))]


def generate_workout_plan(fitness_goal: FitnessGoal) -> List[Exercise]:
    """
    Generate a list of Exercise objects for a given FitnessGoal.
    plan_id is not set here — the caller assigns it after saving the WorkoutPlan.
    """
    difficulty          = _get_difficulty(fitness_goal.activity_level)
    schedule            = _get_schedule(fitness_goal.workout_days)
    goal                = fitness_goal.goal_type
    exercises_per_group = _EXERCISES_PER_GROUP.get(goal, 2)
    cardio_count        = _CARDIO_PER_DAY.get(goal, 1)

    result: List[Exercise] = []

    for day, muscle_groups in schedule.items():
        for i, group in enumerate(muscle_groups):
            for raw in _pick(group, difficulty, exercises_per_group, offset=i):
                name, muscle, sets, reps, diff, yt = raw
                result.append(Exercise(
                    name=name,
                    muscle_group=muscle,
                    sets=sets,
                    reps=reps,
                    difficulty=diff,
                    day=day,
                    youtube_url=yt,
                    image_url=_image_url(name),
                ))

        cardio_options = _LIBRARY["cardio"][difficulty]
        for i in range(cardio_count):
            name, muscle, sets, reps, diff, yt = cardio_options[i % len(cardio_options)]
            result.append(Exercise(
                name=name,
                muscle_group=muscle,
                sets=sets,
                reps=reps,
                difficulty=diff,
                day=day,
                youtube_url=yt,
            ))

    return result
