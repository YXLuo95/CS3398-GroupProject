def format_supplement_response(user, supplements):
    goal = user.get("goal", "").replace("_", " ")

    intro = f"Based on your goal of {goal}, here are some supplements that can support you:\n\n"

    body = ""
    for s in supplements:
        body += f"- {s['name']}: {s['description']}\n"

    closing = "\nStay consistent with your training and nutrition to get the best results."

    return intro + body + closing