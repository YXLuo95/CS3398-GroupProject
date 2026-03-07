"""
Health metric calculations for onboarding quiz.
Uses Mifflin-St Jeor formula for BMR.
Adapted for Imperial inputs (lbs, inches).
"""
# T3S-26 change to use imperial units and calculate BMI, BMR, TDEE based on quiz inputs

def calculate_bmi(weight_lbs: float, height_in: float) -> float:
    """
    BMI = (weight in lbs / (height in inches)²) * 703
    """
    if height_in <= 0:
        return 0.0
    return round((weight_lbs / (height_in ** 2)) * 703, 2)


def calculate_bmr(weight_lbs: float, height_in: float, age: int, gender: str) -> float:
    """
    BMR using Mifflin-St Jeor formula.
    Inputs are in Imperial (lbs, in), converted internally to Metric (kg, cm).
    Male:   (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
    Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
    Other:  Average of male and female
    """
    weight_kg = weight_lbs * 0.453592
    height_cm = height_in * 2.54

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