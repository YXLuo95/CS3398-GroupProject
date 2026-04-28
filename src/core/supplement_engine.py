def get_supplement_recommendations(user):
    goal = user.get("goal")
    diet = user.get("diet")
    activity = user.get("activity_level")

    supplements = []

    # 🔹 MUSCLE GAIN
    if goal == "build_muscle":
        supplements.extend([
            {"name": "Whey Protein", "description": "Supports muscle growth"},
            {"name": "Creatine", "description": "Improves strength and power"},
            {"name": "BCAAs", "description": "Helps muscle recovery"},
            {"name": "Mass Gainer", "description": "Helps increase calorie intake"}
        ])

    # 🔹 FAT LOSS
    elif goal == "lose_weight":
        supplements.extend([
            {"name": "Green Tea Extract", "description": "Boosts metabolism"},
            {"name": "L-Carnitine", "description": "Supports fat metabolism"},
            {"name": "Caffeine", "description": "Increases energy and fat burn"}
        ])

    # 🔹 GENERAL HEALTH
    elif goal == "general_health":
        supplements.extend([
            {"name": "Multivitamin", "description": "Covers daily nutrients"},
            {"name": "Omega-3", "description": "Supports heart and brain health"},
            {"name": "Vitamin D", "description": "Supports immune system"}
        ])

    # 🔹 DIET-BASED
    if diet == "vegan":
        supplements.extend([
            {"name": "Vitamin B12", "description": "Essential for vegans"},
            {"name": "Iron", "description": "Supports oxygen transport"},
            {"name": "Plant Protein", "description": "Alternative to whey"}
        ])

    # 🔹 ACTIVITY-BASED
    if activity == "high":
        supplements.extend([
            {"name": "Electrolytes", "description": "Hydration support"},
            {"name": "Magnesium", "description": "Helps muscle recovery"},
            {"name": "Zinc", "description": "Supports recovery and immunity"}
        ])

    return supplements