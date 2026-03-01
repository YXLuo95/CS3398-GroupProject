# src/core/llm.py
from typing import Optional
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
            "1. Be direct and concise. Avoid fluff."
            "2. Use bullet points and bold text for readability."
            "3. Format your entire response strictly in Markdown."
            "4. Only provide the report, do not add introductory conversational phrases like 'Sure, here is your report'."
            "5. ALWAYS use Imperial units (lbs, inches) in your response."
        )
        
        # pull data from DB , feed into the prompt
        user_prompt = (
            f"Client Profile: {user_age} years old, {gender}.\n"
            f"Recent Data Summary: {data_summary}\n\n"
            "Please generate a professional periodic assessment and provide the next phase of training and dietary recommendations."
        )

        # initialize ollama client
        # Notes: change locolhost to actual host before making docker file.
        client = ollama.AsyncClient(host='http://localhost:11434')
        
        # sent a chat request to the local LLM, 
        # passing in the system and user prompts, and specifying the model to use based on the settings. 
        # The response is expected to be in a structured format defined by the system prompt, 
        # and we extract the content of the message from the response to return as the fitness report.
        response = await client.chat(
            model=settings.LOCAL_MODEL_NAME, 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        )
        
        logger.info("[LLM Service] Report generated successfully!")
        return response['message']['content']
        
    except Exception as e:
        logger.error(f"[LLM Service] LLM invocation failed: {str(e)}")
        # 发生任何网络或模型错误时，优雅降级，返回 mock 报告保证后端不崩溃
        return MOCK_REPORT