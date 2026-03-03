from sqladmin import Admin, ModelView
from src.model import User, FitnessRecord, FitnessReport

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

def setup_admin(app, engine):
    admin = Admin(app, engine, title="Fitness AI Admin Dashboard")
    admin.add_view(UserAdmin)
    admin.add_view(FitnessRecordAdmin)
    admin.add_view(FitnessReportAdmin)
    return admin