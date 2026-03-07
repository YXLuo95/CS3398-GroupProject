#using methods from passlib to hash the password before storing it in the database, 
# and to verify the password during login.
from datetime import datetime, timedelta
from typing import Any, Union
from passlib.context import CryptContext

#this function will be used to hash the password before storing it in the database, and to verify the password during login.
#from passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:

    #this function will be used to verify the password during login, by comparing the plain text password with the hashed password stored in the database.
    #param plain_password: the plain text password provided by the user during login
    #param hashed_password: the hashed password stored in the database for the user

    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)