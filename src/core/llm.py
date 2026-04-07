from typing import Optional, List
import json
import logging
import ollama
from src.core.config import settings

logger = logging.getLogger("uvicorn.info")

# ==========================================
# LLM Integration Logic
# ==========================================

# decouple for team members who can not run LLM, 
MOCK_REPORT = """
[System Notice] Local LLM generation is disabled or temporarily unavailable.
This is a mock fitness report to ensure the system remains functional.
Please enable the LLM in settings to receive real, personalized fitness reports.
"""

async def generate_fitness_report(user_age: int, gender: str, data_summary: str) -> Optional[str]:
    """
    call the local LLM to generate a fitness report based on the
    """
    
    # extra check to ensure LLM is enabled, in case the config is changed at runtime or there are issues with the LLM service initialization. This provides an additional layer of robustness to prevent crashes and ensure a graceful fallback to the mock report if the LLM is not available.
    if not settings.ENABLE_LLM_MODEL:
        logger.info("[LLM Service] LLM disabled by config, returning mock report.")
        return MOCK_REPORT

    # 2. refer ollama's documentation for how to construct the system and user prompts,
    #  and how to call the chat endpoint asynchronously. The system prompt should define the AI's persona, tone, and output format constraints,
    #  while the user prompt should provide the actual data summary and request for recommendations. 
    # The response from the LLM will be extracted and returned as the fitness report content.
    try:
        logger.info(f"[LLM Service] Generating real report using {settings.LOCAL_MODEL_NAME}...") # log for later use
        
        # force LLM to generate reports in a specific manner
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
            "7. Use ONLY the numbers provided in the data summary. Do NOT calculate or estimate any values yourself."           ## important to prevent hallucination,  LLM can not do math
            "   - **Progress Summary**: Analyze the weight trend and overall progress. "
            "   - **Body Composition Analysis**: BMI context, estimated body fat if possible. "
            "   - **Nutrition Plan**: Daily calorie target, macro split, meal timing suggestions. "
            "   - **Training Plan**: Weekly workout split based on their goal and activity level. "
            "   - **Next Milestone**: Set a realistic short-term goal for the next 2-4 weeks."
        )
        
        # pull data from DB , feed into the prompt
        user_prompt = (
            f"Client Profile: {user_age} years old, {gender}.\n"
            f"Recent Data Summary: {data_summary}\n\n"
            "Please generate a professional periodic assessment and provide the next phase of training and dietary recommendations."
        )

        # initialize ollama client
        # Notes: change locolhost to actual host before making docker file.
        client = ollama.AsyncClient(host=settings.OLLAMA_HOST)
        
        # sent a chat request to the local LLM, 
        # passing in the system and user prompts, and specifying the model to use based on the settings. 
        # The response is expected to be in a structured format defined by the system prompt, 
        # and we extract the content of the message from the response to return as the fitness report.
        response = await client.chat(
            model=settings.LOCAL_MODEL_NAME, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
             options={
            "temperature": 0.7,    # harness creativity while maintaining coherence
            "num_predict": 1024,   # limit response length to ensure concise reports
            },
        )
        
        logger.info("[LLM Service] Report generated successfully!")
        return response['message']['content']
        
    except Exception as e:
        logger.error(f"[LLM Service] LLM invocation failed: {str(e)}")
        logger.info("[LLM Service] Returning mock report due to LLM failure.")
        return MOCK_REPORT


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
                "temperature": 0.3,   # low temp for consistent structured output
                "num_predict": 2048,
            },
        )

        raw = response['message']['content'].strip()
        instructions = json.loads(raw)
        logger.info("[LLM Service] Exercise instructions generated successfully.")
        return instructions

    except json.JSONDecodeError:
        logger.error("[LLM Service] Failed to parse LLM response as JSON. Falling back to no instructions.")
        return {}
    except Exception as e:
        logger.error(f"[LLM Service] Exercise instruction generation failed: {str(e)}")
        return {}