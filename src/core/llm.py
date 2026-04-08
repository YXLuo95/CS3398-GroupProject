from typing import Optional, List
import json
import re
import logging
import ollama
from src.core.config import settings

logger = logging.getLogger("uvicorn.info")

# ==========================================
# LLM Integration Logic
# ==========================================

MOCK_REPORT = """
[System Notice] Local LLM generation is disabled or temporarily unavailable.
This is a mock fitness report to ensure the system remains functional.
Please enable the LLM in settings to receive real, personalized fitness reports.
"""


async def generate_fitness_report(user_age: int, gender: str, data_summary: str) -> Optional[str]:
    """
    Call the local LLM to generate a fitness report.
    """
    if not settings.ENABLE_LLM_MODEL:
        logger.info("[LLM Service] LLM disabled by config, returning mock report.")
        return MOCK_REPORT

    try:
        logger.info(f"[LLM Service] Generating real report using {settings.LOCAL_MODEL_NAME}...")

        system_prompt = (
            "You are a highly professional, rigorous, yet encouraging personal fitness coach and nutritionist based in the US. "
            "Your task is to provide scientific, safe, and highly actionable assessments and recommendations based on the user's recent body metric changes. "
            "Rules you MUST follow: "
            "1. Be direct and concise. Avoid fluff. "
            "2. Use bullet points and bold text for readability. "
            "3. Format your entire response strictly in Markdown. "
            "4. Only provide the report, do not add introductory conversational phrases like 'Sure, here is your report'. "
            "5. ALWAYS use Imperial units (lbs, inches) in your response. "
            "6. Structure your report with these sections: "
            "7. Use ONLY the numbers provided in the data summary. Do NOT calculate or estimate any values yourself."
            "   - **Progress Summary**: Analyze the weight trend and overall progress. "
            "   - **Body Composition Analysis**: BMI context, estimated body fat if possible. "
            "   - **Nutrition Plan**: Daily calorie target, macro split, meal timing suggestions. "
            "   - **Training Plan**: Weekly workout split based on their goal and activity level. "
            "   - **Next Milestone**: Set a realistic short-term goal for the next 2-4 weeks."
        )

        user_prompt = (
            f"Client Profile: {user_age} years old, {gender}.\n"
            f"Recent Data Summary: {data_summary}\n\n"
            "Please generate a professional periodic assessment and provide the next phase of training and dietary recommendations."
        )

        client = ollama.AsyncClient(host=settings.OLLAMA_HOST)

        response = await client.chat(
            model=settings.LOCAL_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.7,
                "num_predict": 1024,
            },
        )

        logger.info("[LLM Service] Report generated successfully!")
        return response['message']['content']

    except Exception as e:
        logger.error(f"[LLM Service] LLM invocation failed: {str(e)}")
        logger.info("[LLM Service] Returning mock report due to LLM failure.")
        return MOCK_REPORT


def _extract_json(raw: str) -> dict:
    """
    Try to extract a JSON object from LLM output.
    Handles cases where LLM wraps JSON in markdown code blocks.
    """
    # Strip markdown code fences if present
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Last resort: find first { ... } block
    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return {}


async def generate_exercise_instructions(
    exercise_names: List[str],
    difficulty: str,
    goal_type: str,
) -> dict:
    """
    Given a list of exercise names, returns a dict mapping each name
    to a 3-step instruction string. Falls back to empty dict on failure.
    """
    if not settings.ENABLE_LLM_MODEL:
        return {}

    try:
        logger.info(f"[LLM Service] Generating exercise instructions for {len(exercise_names)} exercises...")

        system_prompt = (
            "You are a certified personal trainer. "
            "For each exercise provided, write exactly 3 concise steps on how to perform it correctly. "
            "Tailor the language to a " + difficulty + " level athlete whose goal is to " + goal_type.replace("_", " ") + ". "
            "Rules you MUST follow: "
            "1. Respond ONLY with a valid JSON object. No extra text, no markdown, no code blocks. "
            "2. Keys are exercise names exactly as given. Values are a single string with steps separated by ' | '. "
            "3. Each step must be under 20 words. "
            "4. Example format: {\"Push-Up\": \"Step 1 | Step 2 | Step 3\"}"
        )

        user_prompt = "Generate instructions for these exercises: " + ", ".join(exercise_names)

        client = ollama.AsyncClient(host=settings.OLLAMA_HOST)
        response = await client.chat(
            model=settings.LOCAL_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.3,
                "num_predict": 2048,
            },
        )

        raw = response['message']['content'].strip()
        instructions = _extract_json(raw)

        if instructions:
            logger.info(f"[LLM Service] Exercise instructions generated for {len(instructions)}/{len(exercise_names)} exercises.")
        else:
            logger.warning("[LLM Service] Could not parse any instructions from LLM response.")

        return instructions

    except Exception as e:
        logger.error(f"[LLM Service] Exercise instruction generation failed: {str(e)}")
        return {}
    


#added for demo2 - 
async def generate_nutrition_plan(data_summary: str) -> Optional[str]:
    """
    Call the local LLM to generate a personalized daily nutrition plan
    based on the user's quiz data, macros, and dietary preferences.
    """
    if not settings.ENABLE_LLM_MODEL:
        logger.info("[LLM Service] LLM disabled, returning mock nutrition plan.")
        return (
            "## Daily Nutrition Plan (Mock)\n\n"
            "**LLM is currently disabled.** Enable it in settings to receive a real, personalized nutrition plan.\n\n"
            "### General Guidelines\n"
            "- Eat sufficient protein spread across the day\n"
            "- Prioritize whole, unprocessed foods\n"
            "- Stay hydrated with at least 3L of water daily\n"
            "- Time carbs around your workouts for best performance"
        )
 
    try:
        logger.info(f"[LLM Service] Generating nutrition plan using {settings.LOCAL_MODEL_NAME}...")
 
        system_prompt = (
            "You are a certified sports nutritionist based in the US. "
            "Your task is to create a practical, personalized daily nutrition plan based on the user's profile data. "
            "Rules you MUST follow: "
            "1. Be direct and actionable. No fluff or generic advice. "
            "2. Format your entire response strictly in Markdown. "
            "3. Only provide the plan — no introductory phrases like 'Sure, here is your plan'. "
            "4. Use Imperial units (lbs, oz) and common US food items. "
            "5. Use ONLY the macro targets provided in the data. Do NOT recalculate them yourself. "
            "6. Structure your plan with these sections: "
            "   - **Daily Overview**: Summarize the macro targets and overall strategy in 2-3 sentences. "
            "   - **Food Recommendations**: List 10-15 specific foods that fit this plan, grouped by protein sources, carb sources, fat sources, and vegetables. Include approximate portion sizes. "
            "   - **Hydration**: Water intake target and timing. "
            "   - **Supplement Suggestions**: 2-3 evidence-based supplements if relevant to the goal. "
            "   - **Key Tips**: 3-4 practical tips specific to the user's goal and preferences. "
            "7. If the user has dietary preferences or allergies, ALL food recommendations MUST respect them. "
            "8. Keep the entire response under 600 words."
        )
 
        user_prompt = (
            f"User Profile & Targets:\n{data_summary}\n\n"
            "Generate a complete daily nutrition plan for this user."
        )
 
        client = ollama.AsyncClient(host=settings.OLLAMA_HOST)
 
        response = await client.chat(
            model=settings.LOCAL_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            options={
                "temperature": 0.7,
                "num_predict": 1024,
            },
        )
 
        logger.info("[LLM Service] Nutrition plan generated successfully!")
        return response['message']['content']
 
    except Exception as e:
        logger.error(f"[LLM Service] Nutrition plan generation failed: {str(e)}")
        return (
            "## Daily Nutrition Plan\n\n"
            "⚠️ The AI nutritionist encountered an error. "
            "Please try again later or contact support.\n\n"
            "In the meantime, focus on hitting your protein target "
            "and eating whole, unprocessed foods."
        )