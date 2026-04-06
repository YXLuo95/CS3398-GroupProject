from sqladmin import Admin, ModelView
from src.model import User, FitnessRecord, FitnessReport , FitnessGoal
from starlette.requests import Request
from sqladmin.authentication import AuthenticationBackend
from src.core.config import settings
from src.model import User, FitnessRecord, FitnessReport, FitnessGoal, UserProfile
from src.model import User, FitnessRecord, FitnessReport, FitnessGoal, UserProfile, ChatMessage

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

def setup_admin(app, engine):
    auth = AdminAuth(secret_key=settings.SECRET_KEY)
    admin = Admin(app, engine, title="Blue Falcon Admin Dashboard", authentication_backend=auth)
    admin.add_view(UserAdmin)
    admin.add_view(FitnessRecordAdmin)
    admin.add_view(FitnessReportAdmin)
    admin.add_view(FitnessGoalAdmin)
    admin.add_view(UserProfileAdmin)
    admin.add_view(ChatMessageAdmin)
    return admin