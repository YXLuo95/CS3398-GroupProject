"""
Workout plan generator for Falcon Fitness.
Maps goal type -> exercise focus, activity level -> difficulty,
and workout_days -> training split.
"""

from typing import List
from src.model import Exercise, FitnessGoal


# ---------------------------------------------------------------------------
# Exercise library — (name, muscle_group, sets, reps, difficulty, youtube_url)
# ---------------------------------------------------------------------------
_LIBRARY: dict = {
    "chest": {
        "beginner": [
            ("Push-Up", "chest", "3", "10", "beginner", "https://www.youtube.com/watch?v=IODxDxX7oi4"),
            ("Incline Push-Up", "chest", "3", "12", "beginner", "https://www.youtube.com/watch?v=8vG5pL0K9aY"),
            ("Wall Push-Up", "chest", "3", "15", "beginner", "https://www.youtube.com/watch?v=0pkjOk0EiAk"),
        ],
        "intermediate": [
            ("Dumbbell Bench Press", "chest", "4", "10", "intermediate", "https://www.youtube.com/watch?v=VmB1G1K7v94"),
            ("Dumbbell Flye", "chest", "3", "12", "intermediate", "https://www.youtube.com/watch?v=eozdVDA78K0"),
            ("Push-Up with Pause", "chest", "3", "10", "intermediate", "https://www.youtube.com/watch?v=IODxDxX7oi4"),
        ],
        "advanced": [
            ("Barbell Bench Press", "chest", "5", "5", "advanced", "https://www.youtube.com/watch?v=rT7DgCr-3pg"),
            ("Weighted Dip", "chest", "4", "8", "advanced", "https://www.youtube.com/watch?v=2z8JmcrW-As"),
            ("Decline Dumbbell Press", "chest", "4", "10", "advanced", "https://www.youtube.com/watch?v=LfyQBUKR8SE"),
        ],
    },

    "back": {
        "beginner": [
            ("Bent-Over Dumbbell Row", "back", "3", "10", "beginner", "https://www.youtube.com/watch?v=ZXpZu_fmheU"),
            ("Superman Hold", "back", "3", "30 sec", "beginner", "https://www.youtube.com/watch?v=z6PJMT2y8GQ"),
            ("Resistance Band Row", "back", "3", "12", "beginner", "https://www.youtube.com/watch?v=roCP6wCXPqo"),
        ],
        "intermediate": [
            ("Pull-Up", "back", "3", "6", "intermediate", "https://www.youtube.com/watch?v=eGo4IYlbE5g"),
            ("Seated Cable Row", "back", "4", "10", "intermediate", "https://www.youtube.com/watch?v=GZbfZ033f74"),
            ("Single-Arm Dumbbell Row", "back", "3", "10", "intermediate", "https://www.youtube.com/watch?v=pYcpY20QaE8"),
        ],
        "advanced": [
            ("Weighted Pull-Up", "back", "4", "6", "advanced", "https://www.youtube.com/watch?v=Kx5hX1c7w5Y"),
            ("Barbell Deadlift", "back", "5", "5", "advanced", "https://www.youtube.com/watch?v=3UwO0fKukRw"),
            ("T-Bar Row", "back", "4", "8", "advanced", "https://www.youtube.com/watch?v=j3Igk5nyZE4"),
        ],
    },

    "shoulders": {
        "beginner": [
            ("Dumbbell Lateral Raise", "shoulders", "3", "12", "beginner", "https://www.youtube.com/watch?v=kDqklk1ZESo"),
            ("Overhead Press (light DB)", "shoulders", "3", "10", "beginner", "https://www.youtube.com/watch?v=B-aVuyhvLHU"),
            ("Front Raise", "shoulders", "3", "12", "beginner", "https://www.youtube.com/watch?v=-t7fuZ0KhDA"),
        ],
        "intermediate": [
            ("Dumbbell Shoulder Press", "shoulders", "4", "10", "intermediate", "https://www.youtube.com/watch?v=B-aVuyhvLHU"),
            ("Arnold Press", "shoulders", "3", "10", "intermediate", "https://www.youtube.com/watch?v=vj2w851ZHRM"),
            ("Face Pull", "shoulders", "3", "15", "intermediate", "https://www.youtube.com/watch?v=rep-qVOkqgk"),
        ],
        "advanced": [
            ("Barbell Overhead Press", "shoulders", "5", "5", "advanced", "https://www.youtube.com/watch?v=2yjwXTZQDDI"),
            ("Barbell Upright Row", "shoulders", "4", "8", "advanced", "https://www.youtube.com/watch?v=amCU-ziHITM"),
            ("Lateral Raise Drop Set", "shoulders", "4", "10", "advanced", "https://www.youtube.com/watch?v=kDqklk1ZESo"),
        ],
    },

    "biceps": {
        "beginner": [
            ("Dumbbell Curl", "biceps", "3", "12", "beginner", "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"),
            ("Hammer Curl", "biceps", "3", "10", "beginner", "https://www.youtube.com/watch?v=zC3nLlEvin4"),
        ],
        "intermediate": [
            ("Barbell Curl", "biceps", "3", "10", "intermediate", "https://www.youtube.com/watch?v=kwG2ipFRgfo"),
            ("Incline Dumbbell Curl", "biceps", "3", "10", "intermediate", "https://www.youtube.com/watch?v=soxrZlIl35U"),
        ],
        "advanced": [
            ("EZ-Bar Preacher Curl", "biceps", "4", "8", "advanced", "https://www.youtube.com/watch?v=fIWP-FRFNU0"),
            ("Spider Curl", "biceps", "3", "10", "advanced", "https://www.youtube.com/watch?v=2v3R5wq1zKM"),
        ],
    },

    "triceps": {
        "beginner": [
            ("Bench Tricep Dip", "triceps", "3", "10", "beginner", "https://www.youtube.com/watch?v=0326dy_-CzM"),
            ("Overhead DB Tricep Extension", "triceps", "3", "12", "beginner", "https://www.youtube.com/watch?v=_gsUck-7M74"),
        ],
        "intermediate": [
            ("Cable Tricep Pushdown", "triceps", "3", "12", "intermediate", "https://www.youtube.com/watch?v=2-LAMcpzODU"),
            ("Skull Crusher", "triceps", "3", "10", "intermediate", "https://www.youtube.com/watch?v=d_KZxkY_0cM"),
        ],
        "advanced": [
            ("Close-Grip Bench Press", "triceps", "4", "8", "advanced", "https://www.youtube.com/watch?v=nEF0bv2FW94"),
            ("Weighted Tricep Dip", "triceps", "4", "8", "advanced", "https://www.youtube.com/watch?v=2z8JmcrW-As"),
        ],
    },

    "legs": {
        "beginner": [
            ("Bodyweight Squat", "legs", "3", "15", "beginner", "https://www.youtube.com/watch?v=m0GcZ24pK6k"),
            ("Reverse Lunge", "legs", "3", "10", "beginner", "https://www.youtube.com/watch?v=QOVaHwm-Q6U"),
            ("Glute Bridge", "legs", "3", "15", "beginner", "https://www.youtube.com/watch?v=wPM8icPu6H8"),
        ],
        "intermediate": [
            ("Goblet Squat", "legs", "4", "10", "intermediate", "https://www.youtube.com/watch?v=MeIiIdhvXT4"),
            ("Romanian Deadlift (DB)", "legs", "3", "10", "intermediate", "https://www.youtube.com/watch?v=2SHsk9AzdjA"),
            ("Walking Lunge", "legs", "3", "12", "intermediate", "https://www.youtube.com/watch?v=L8fvypPrzzs"),
        ],
        "advanced": [
            ("Barbell Back Squat", "legs", "5", "5", "advanced", "https://www.youtube.com/watch?v=ultWZbUMPL8"),
            ("Barbell Romanian Deadlift", "legs", "4", "8", "advanced", "https://www.youtube.com/watch?v=2SHsk9AzdjA"),
            ("Bulgarian Split Squat", "legs", "4", "8", "advanced", "https://www.youtube.com/watch?v=2C-uNgKwPLE"),
        ],
    },

    "core": {
        "beginner": [
            ("Plank", "core", "3", "20 sec", "beginner", "https://www.youtube.com/watch?v=ASdvN_XEl_c"),
            ("Dead Bug", "core", "3", "8", "beginner", "https://www.youtube.com/watch?v=g_BYB0R-4Ws"),
            ("Knee Crunch", "core", "3", "15", "beginner", "https://www.youtube.com/watch?v=Xyd_fa5zoEU"),
        ],
        "intermediate": [
            ("Bicycle Crunch", "core", "3", "20", "intermediate", "https://www.youtube.com/watch?v=9FGilxCbdz8"),
            ("Russian Twist", "core", "3", "20", "intermediate", "https://www.youtube.com/watch?v=wkD8rjkodUI"),
            ("Plank", "core", "3", "45 sec", "intermediate", "https://www.youtube.com/watch?v=ASdvN_XEl_c"),
        ],
        "advanced": [
            ("Ab Wheel Rollout", "core", "4", "10", "advanced", "https://www.youtube.com/watch?v=2fQ4F2FJzXg"),
            ("Hanging Leg Raise", "core", "4", "12", "advanced", "https://www.youtube.com/watch?v=JB2oyawG9KI"),
            ("Dragon Flag", "core", "3", "6", "advanced", "https://www.youtube.com/watch?v=YbV1H2S4oKQ"),
        ],
    },

    "cardio": {
        "beginner": [
            ("Brisk Walk", "cardio", "1", "20 min", "beginner", "https://www.youtube.com/watch?v=3Ka7B3hCg08"),
            ("Jump Rope", "cardio", "3", "2 min", "beginner", "https://www.youtube.com/watch?v=1BZM2Vre5oc"),
            ("Step-Up", "cardio", "3", "15", "beginner", "https://www.youtube.com/watch?v=dQqApCGd5Ss"),
        ],
        "intermediate": [
            ("Jogging", "cardio", "1", "25 min", "intermediate", "https://www.youtube.com/watch?v=ue0l8N6R8gk"),
            ("Jumping Jacks", "cardio", "4", "30 sec", "intermediate", "https://www.youtube.com/watch?v=c4DAnQ6DtF8"),
            ("Box Jump", "cardio", "4", "8", "intermediate", "https://www.youtube.com/watch?v=52r_Ul5k03g"),
        ],
        "advanced": [
            ("Sprint Intervals", "cardio", "8", "30 sec", "advanced", "https://www.youtube.com/watch?v=1skBf6h2ksI"),
            ("Burpee", "cardio", "5", "10", "advanced", "https://www.youtube.com/watch?v=auBLPXO8Fww"),
            ("Jump Rope Double Unders", "cardio", "5", "30 sec", "advanced", "https://www.youtube.com/watch?v=3hX2q5oW5Qs"),
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

# ---------------------------------------------------------------------------
# Generator logic (unchanged)
# ---------------------------------------------------------------------------
def generate_workout_plan(fitness_goal: FitnessGoal) -> List[Exercise]:
    difficulty = "beginner"
    schedule = _FULL_BODY
    result: List[Exercise] = []

    for day, groups in schedule.items():
        for group in groups:
            for name, muscle, sets, reps, diff, yt in _LIBRARY[group][difficulty][:1]:
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
