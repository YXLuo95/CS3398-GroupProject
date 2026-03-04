# configure key for authentication and project settings
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # project name and API version string for consistent API endpoint definitions and documentation.
    PROJECT_NAME: str = "Fitness Advice and Tracking Service"
    API_V1_STR: str = "/api/v1"

    # JWT settings for authentication and authorization, 
    # including the secret key used for signing tokens, the algorithm used for token encoding, and the token expiration time in minutes.
    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM (Large Language Model) configuration settings, 
    # including a flag to enable or disable the use of LLMs in the application, and a configuration option for specifying the name of the local model to use if LLMs are enabled. This allows for flexibility in choosing between using a local model or an external API for generating fitness reports based on user data.
    ENABLE_LLM_MODEL: bool = True
    # LOCAL_MODEL_NAME is set to "llama3" as a placeholder, 
    # and can be updated to the actual name of the local model being used in the application (e.g., "gpt-4", "llama3", etc.) when the LLM integration is implemented.
    LOCAL_MODEL_NAME: str = "llama3" 

    # Redis configuration settings, including the host, port, and password for connecting to the Redis server, 
    # as well as the database indices for different purposes (authentication, LLM rate limiting, and task queue management). This allows for organized and efficient use of Redis for various functionalities in the application.
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None

    # === Redis port settings ===
    REDIS_DB_AUTH: int = 0   # 0 for authentication-related data, such as storing user session information or token blacklists.
    REDIS_DB_LLM: int = 1    # 1 for LLM-related data, such as caching LLM responses or storing temporary data for rate limiting LLM usage.
    REDIS_DB_QUEUE: int = 2  # for task queue management, such as storing background job data or managing asynchronous tasks related to fitness report generation.
    
    class Config:
        env_file = ".env"
        # lock the settings to prevent accidental modification at runtime
        case_sensitive = True
        extra = "ignore"

# create a global settings instance that can be imported and used throughout the application
settings = Settings()