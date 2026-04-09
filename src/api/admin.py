from sqladmin import Admin, ModelView
from starlette.requests import Request
from sqladmin.authentication import AuthenticationBackend
from src.core.config import settings




## import all tables at the same place
from src.model import (
    User, 
    FitnessRecord, 
    FitnessReport, 
    FitnessGoal, 
    UserProfile, 
    ChatMessage,
    WorkoutPlan,
    Exercise,
    CompletedWorkout,
    NutritionPlan, 
    WorkoutSet,   
)
class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        if form["username"] == "admin" and form["password"] == settings.ADMIN_PASSWORD:
            request.session.update({"authenticated": True})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("authenticated", False)


class UserAdmin(ModelView, model=User):

    column_list = ["id", "username", "email", "is_active", "created_at"]
    
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"

class FitnessRecordAdmin(ModelView, model=FitnessRecord):

    column_list = [
        "id", 
        "user_id", 
        "age", 
        "gender", 
        "weight_lbs", 
        "height_in", 
        "fitness_goal", 
        "created_at"
    ]
    
    name = "Record"
    name_plural = "Fitness Records"
    icon = "fa-solid fa-heart-pulse"

class FitnessReportAdmin(ModelView, model=FitnessReport):
    column_list = ["id", "user_id", "model_used", "created_at"]
    column_details_list = "__all__"
    
    name = "AI Report"
    name_plural = "AI Reports"
    icon = "fa-solid fa-file-medical"

class FitnessGoalAdmin(ModelView, model=FitnessGoal):
    column_list = [
        FitnessGoal.id, 
        FitnessGoal.user_id, 
        FitnessGoal.goal_type, 
        FitnessGoal.weight_lbs, 
        FitnessGoal.target_weight,
        FitnessGoal.quiz_completed,
        FitnessGoal.created_at
    ]
    column_details_exclude_list = [FitnessGoal.updated_at]
    name = "Fitness Goal"
    name_plural = "Fitness Goals"
    icon = "fa-solid fa-bullseye" 

class UserProfileAdmin(ModelView, model=UserProfile):
    column_list = [
        "id",
        "user_id",
        "first_name",
        "last_name",
        "phone",
        "city",
        "state",
        "created_at"
    ]
    name = "Profile"
    name_plural = "User Profiles"
    icon = "fa-solid fa-address-card"

class ChatMessageAdmin(ModelView, model=ChatMessage):
    column_list = ["id", "user_id", "username", "content", "created_at"]
    name = "Chat Message"
    name_plural = "Chat Messages"
    icon = "fa-solid fa-comments"


#new admin views for workout plans and exercises TS3-41
class WorkoutPlanAdmin(ModelView, model=WorkoutPlan):
    column_list = [
        "id", "user_id", "fitness_goal_id", "generated_at", "created_at"
    ]
    name = "Workout Plan"
    name_plural = "Workout Plans"
    icon = "fa-solid fa-calendar-days"

class ExerciseAdmin(ModelView, model=Exercise):
    column_list = [
        "id", "plan_id", "day", "name", "muscle_group", "difficulty"
    ]
    name = "Exercise"
    name_plural = "Exercises"
    icon = "fa-solid fa-dumbbell"

class CompletedWorkoutAdmin(ModelView, model=CompletedWorkout):
    column_list = [
        "id", "user_id", "plan_id", "day", "completed_at"
    ]
    name = "Completed Workout"
    name_plural = "Completed Workouts"
    icon = "fa-solid fa-check-double"

class NutritionPlanAdmin(ModelView, model=NutritionPlan):
    column_list = ["id", "user_id", "calories", "protein_g", "fat_g", "model_used", "created_at"]
    column_details_list = "__all__"
    name = "Nutrition Plan"
    name_plural = "Nutrition Plans"
    icon = "fa-solid fa-utensils"

class WorkoutSetAdmin(ModelView, model=WorkoutSet):
    column_list = ["id", "user_id", "exercise_id", "set_number", "completed_at"]
    name = "Workout Set"
    name_plural = "Workout Sets"
    icon = "fa-solid fa-list-check"










def setup_admin(app, engine):
    auth = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(app, engine, title="Blue Falcon Admin Dashboard", authentication_backend=auth)
    admin.add_view(UserAdmin)
    admin.add_view(FitnessRecordAdmin)
    admin.add_view(FitnessReportAdmin)
    admin.add_view(FitnessGoalAdmin)
    admin.add_view(UserProfileAdmin)
    admin.add_view(ChatMessageAdmin)
    #added admin views for workout plans and exercises TS3-41
    admin.add_view(WorkoutPlanAdmin)
    admin.add_view(ExerciseAdmin)
    admin.add_view(CompletedWorkoutAdmin)
    #added admin view for  feature/workout-plan 
    admin.add_view(NutritionPlanAdmin)
    admin.add_view(WorkoutSetAdmin)
    return admin