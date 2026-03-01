###defines how data is structured when returned from the API endpoints,
# and also for validating incoming data if needed in the future.

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

# ==========================================
# 1. User Schemas 
# ==========================================
class UserBase(BaseModel):
    email: str = Field(..., description="email address")
    username: str = Field(..., description="username")
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="user's password")

class UserRead(UserBase):
    id: int
    created_at: datetime
    
    # including the id field in the UserRead schema to allow the API to return the user's unique identifier when fetching user data,
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. Fitness Record Schemas 
# ==========================================
class FitnessRecordBase(BaseModel):
    age: int = Field(..., gt=0, le=120, description="Age in years")
    gender: str = Field(..., description="Gender (e.g., Male, Female, Other)")
    
    # 彻底告别 cm 和 kg，统一使用 in 和 lbs
    height_in: float = Field(..., gt=0, description="Height in inches")
    weight_lbs: float = Field(..., gt=0, description="Weight in pounds (lbs)")
    
    activity_level: str = Field(..., description="Level of activity: sedentary, lightly_active, highly_active")
    fitness_goal: str = Field(..., description="Fitness goal: lose_weight, maintain, build_muscle")

class FitnessRecordCreate(FitnessRecordBase):
    pass 

class FitnessRecordRead(FitnessRecordBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. Fitness Report Schemas 
# ==========================================
class FitnessReportBase(BaseModel):
    analysis_start_date: Optional[datetime] = Field(None, description="start date for the data analysis period, used to track when the fitness report was generated")
    analysis_end_date: Optional[datetime] = Field(None, description="time stamp for the end of the data analysis period, used to track when the fitness report was generated")
    data_summary: Optional[str] = Field(None, description="key health metrics summary extracted from the user's fitness data, stored as TEXT in the database")
    model_used: Optional[str] = Field(None, description="LLM used for generating the report (e.g., 'gpt-4')")

class FitnessReportCreate(FitnessReportBase):
    report_content: str = Field(..., description="LLM generated report content, stored as TEXT in the database")

class FitnessReportRead(FitnessReportBase):
    id: int
    user_id: int
    report_content: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

#==========================================
# 4. Authentication Schemas
#==========================================
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None   