"""
exercise_db.py — Free Exercise DB integration for Falcon Fitness.

Loads and normalizes the free-exercise-db JSON dataset at startup.
Provides filtering and swap helpers used by workout_generator.py.

Dataset: https://github.com/yuhonas/free-exercise-db
"""

import json
import random
import os
from typing import Optional

_GH_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises"

# ---------------------------------------------------------------------------
# Field normalization maps
# ---------------------------------------------------------------------------

# DB level → our difficulty
_LEVEL_MAP = {
    "beginner":     "beginner",
    "intermediate": "intermediate",
    "expert":       "advanced",
}

# DB equipment string → our equipment list values
_EQUIPMENT_MAP = {
    "body only":    "bodyweight",
    "dumbbell":     "dumbbells",
    "barbell":      "barbell",
    "cable":        "cables",
    "bands":        "resistance_bands",
    "kettlebells":  "kettlebell",
    "machine":      "machine",
    "e-z curl bar": "barbell",
    "exercise ball":"exercise_ball",
    "foam roll":    "foam_roll",
    "medicine ball":"medicine_ball",
    "other":        "other",
}

# DB primaryMuscles values → our muscle_group
_MUSCLE_MAP = {
    "chest":        "chest",
    "biceps":       "biceps",
    "triceps":      "triceps",
    "shoulders":    "shoulders",
    "forearms":     "biceps",
    "neck":         "shoulders",
    "traps":        "shoulders",
    "lats":         "back",
    "middle back":  "back",
    "lower back":   "back",
    "abdominals":   "core",
    "abductors":    "legs",
    "adductors":    "legs",
    "quadriceps":   "legs",
    "hamstrings":   "legs",
    "glutes":       "legs",
    "calves":       "legs",
}

# DB category → our muscle_group (used when primaryMuscles is empty)
_CATEGORY_MUSCLE_MAP = {
    "cardio":                "cardio",
    "stretching":            "core",
    "plyometrics":           "cardio",
    "strongman":             "back",
    "powerlifting":          "legs",
    "olympic weightlifting": "legs",
    "strength":              None,  # use primaryMuscles
}

# muscle_group + force → contraindications
_CONTRAINDICATION_MAP = {
    "chest":     ["shoulder_injury", "wrist_pain"],
    "back":      ["lower_back_pain"],
    "shoulders": ["shoulder_injury"],
    "biceps":    ["wrist_pain"],
    "triceps":   ["wrist_pain", "shoulder_injury"],
    "legs":      ["knee_pain", "lower_back_pain"],
    "core":      ["lower_back_pain", "wrist_pain"],
    "cardio":    ["knee_pain"],
}

# Sets/reps defaults by difficulty + category
_SETS_MAP = {
    "beginner":     "3",
    "intermediate": "4",
    "advanced":     "5",
}

_REPS_MAP = {
    # (difficulty, goal_hint) → reps — goal_hint applied at filter time
    ("beginner",     "strength"):  "12",
    ("intermediate", "strength"):  "10",
    ("advanced",     "strength"):  "8",
    ("beginner",     "cardio"):    "2 min",
    ("intermediate", "cardio"):    "3 min",
    ("advanced",     "cardio"):    "4 min",
    ("beginner",     "stretching"):"30 sec",
    ("intermediate", "stretching"):"45 sec",
    ("advanced",     "stretching"):"60 sec",
    ("beginner",     "plyometrics"):"10",
    ("intermediate", "plyometrics"):"12",
    ("advanced",     "plyometrics"):"15",
}


def _normalize_equipment(raw: str) -> list[str]:
    normalized = _EQUIPMENT_MAP.get(raw.lower().strip(), "other")
    return [normalized]


def _normalize_muscle_group(primary_muscles: list, category: str) -> Optional[str]:
    for m in primary_muscles:
        mapped = _MUSCLE_MAP.get(m.lower())
        if mapped:
            return mapped
    # fallback to category
    return _CATEGORY_MUSCLE_MAP.get(category.lower())


def _get_sets_reps(difficulty: str, category: str) -> tuple[str, str]:
    sets = _SETS_MAP.get(difficulty, "3")
    cat = category.lower()
    if cat in ("cardio", "plyometrics"):
        cat_key = "cardio"
    elif cat == "stretching":
        cat_key = "stretching"
    else:
        cat_key = "strength"
    reps = _REPS_MAP.get((difficulty, cat_key), "10")
    return sets, reps


def _build_image_url(images: list) -> Optional[str]:
    if not images:
        return None
    return f"{_GH_BASE}/{images[0]}"


def _build_instructions(instructions_list: list) -> Optional[str]:
    if not instructions_list:
        return None
    steps = instructions_list[:3]
    return " | ".join(s.strip() for s in steps)


# ---------------------------------------------------------------------------
# Load & normalize at import time
# ---------------------------------------------------------------------------

def _load_db() -> list[dict]:
    db_path = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "data", "exercises.json")
    )

    with open(db_path, "r") as f:
        raw = json.load(f)

    exercises = []
    for e in raw:
        difficulty = _LEVEL_MAP.get(e.get("level", "beginner"), "beginner")
        category   = e.get("category", "strength")
        muscle_group = _normalize_muscle_group(e.get("primaryMuscles", []), category)

        if not muscle_group:
            continue  # skip exercises we can't categorize

        equipment    = _normalize_equipment(e.get("equipment") or "body only")
        sets, reps   = _get_sets_reps(difficulty, category)
        image_url    = _build_image_url(e.get("images", []))
        instructions = _build_instructions(e.get("instructions", []))
        contraindications = _CONTRAINDICATION_MAP.get(muscle_group, [])

        exercises.append({
            "id":               e.get("id", ""),
            "name":             e.get("name", ""),
            "muscle_group":     muscle_group,
            "difficulty":       difficulty,
            "category":         category,
            "equipment":        equipment,
            "contraindications": contraindications,
            "sets":             sets,
            "reps":             reps,
            "image_url":        image_url,
            "instructions":     instructions,
            "youtube_url":      None,
        })

    return exercises


# Module-level cache — loaded once at startup
_EXERCISES: list[dict] = _load_db()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def filter_exercises(
    muscle_group: str,
    difficulty: str,
    equipment_available: list[str],
    limitations: Optional[str],
    count: int = 2,
) -> list[dict]:
    """
    Return up to `count` exercises matching the given profile.
    Filters by muscle_group, difficulty, equipment, and contraindications.
    """
    limitation_flags = _parse_limitations(limitations)

    matches = [
        e for e in _EXERCISES
        if e["muscle_group"] == muscle_group
        and e["difficulty"] == difficulty
        and _equipment_ok(e["equipment"], equipment_available)
        and not any(c in limitation_flags for c in e["contraindications"])
    ]

    # fallback: relax difficulty one level if nothing found
    if not matches:
        fallback_diff = {"advanced": "intermediate", "intermediate": "beginner"}.get(difficulty)
        if fallback_diff:
            matches = [
                e for e in _EXERCISES
                if e["muscle_group"] == muscle_group
                and e["difficulty"] == fallback_diff
                and _equipment_ok(e["equipment"], equipment_available)
                and not any(c in limitation_flags for c in e["contraindications"])
            ]

    random.shuffle(matches)
    return matches[:count]


def get_random_swap(
    muscle_group: str,
    difficulty: str,
    exclude_name: str,
    equipment_available: list[str],
    limitations: Optional[str],
) -> Optional[dict]:
    """Return a random alternative exercise, excluding the current one."""
    limitation_flags = _parse_limitations(limitations)

    options = [
        e for e in _EXERCISES
        if e["muscle_group"] == muscle_group
        and e["difficulty"] == difficulty
        and e["name"] != exclude_name
        and _equipment_ok(e["equipment"], equipment_available)
        and not any(c in limitation_flags for c in e["contraindications"])
    ]

    if not options:
        # relax difficulty
        fallback_diff = {"advanced": "intermediate", "intermediate": "beginner"}.get(difficulty)
        if fallback_diff:
            options = [
                e for e in _EXERCISES
                if e["muscle_group"] == muscle_group
                and e["difficulty"] == fallback_diff
                and e["name"] != exclude_name
                and _equipment_ok(e["equipment"], equipment_available)
            ]

    return random.choice(options) if options else None


def get_all_for_llm(
    equipment_available: list[str],
    limitations: Optional[str],
    difficulty: str,
) -> list[dict]:
    """
    Return the filtered exercise pool for LLM-based selection.
    Strips image/instruction fields — LLM only needs selection metadata.
    """
    limitation_flags = _parse_limitations(limitations)

    matches = [
        e for e in _EXERCISES
        if e["difficulty"] == difficulty
        and _equipment_ok(e["equipment"], equipment_available)
        and not any(c in limitation_flags for c in e["contraindications"])
    ]

    return [
        {
            "name":          e["name"],
            "muscle_group":  e["muscle_group"],
            "sets":          e["sets"],
            "reps":          e["reps"],
            "difficulty":    e["difficulty"],
            "equipment":     e["equipment"],
            "contraindications": e["contraindications"],
        }
        for e in matches
    ]


def get_exercise_by_name(name: str) -> Optional[dict]:
    """Lookup a normalized exercise by exact name."""
    for e in _EXERCISES:
        if e["name"] == name:
            return e
    return None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _parse_limitations(limitations: Optional[str]) -> set[str]:
    """Convert free-text limitations string to a set of contraindication flags."""
    if not limitations:
        return set()
    text = limitations.lower()
    flags = set()
    if any(w in text for w in ["back", "spine", "lumbar"]):
        flags.add("lower_back_pain")
    if any(w in text for w in ["knee", "knees"]):
        flags.add("knee_pain")
    if any(w in text for w in ["shoulder", "rotator"]):
        flags.add("shoulder_injury")
    if any(w in text for w in ["wrist", "wrists"]):
        flags.add("wrist_pain")
    if any(w in text for w in ["neck", "cervical"]):
        flags.add("neck_pain")
    return flags


def _equipment_ok(exercise_equipment: list[str], available: list[str]) -> bool:
    """
    Return True if the exercise can be done with available equipment.
    Bodyweight exercises are always allowed.
    If user provided no equipment list, allow everything.
    """
    if not available:
        return True
    if "bodyweight" in exercise_equipment:
        return True
    return any(eq in available for eq in exercise_equipment)
