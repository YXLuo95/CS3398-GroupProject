"""
Health metric calculations for onboarding quiz.
Uses Mifflin-St Jeor formula for BMR.
"""


def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """BMI = weight / (height in meters)²"""
    height_m = height_cm / 100
    return round(weight_kg / (height_m ** 2), 2)


def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """
    BMR using Mifflin-St Jeor formula:
    Male:   (10 × weight) + (6.25 × height) - (5 × age) + 5
    Female: (10 × weight) + (6.25 × height) - (5 × age) - 161
    Other:  Average of male and female
    """
    base = (10 * weight_kg) + (6.25 * height_cm) - (5 * age)
    if gender == "male":
        return round(base + 5, 2)
    elif gender == "female":
        return round(base - 161, 2)
    else:
        male_bmr = base + 5
        female_bmr = base - 161
        return round((male_bmr + female_bmr) / 2, 2)


def calculate_tdee(bmr: float, activity_level: str) -> float:
    """TDEE = BMR × activity multiplier"""
    multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extra_active": 1.9,
    }
    multiplier = multipliers.get(activity_level, 1.2)
    return round(bmr * multiplier, 2)
