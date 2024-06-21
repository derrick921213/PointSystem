from datetime import datetime, timedelta,timezone
from fastapi import Depends, HTTPException, Request, Security
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from dependencies import get_db
from models import User
from config import Config
from passlib.context import CryptContext
from sqlalchemy.orm import Session

SECRET_KEY = Config.secret_key
ALGORITHM = Config.algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = Config.access_token_expire_minutes
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_token_from_cookie(request: Request):
    token = request.cookies.get(Config.cookie_name)
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    return token

def validate_token(token: str = Depends(get_token_from_cookie),db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_name: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if user_name is None or user_id is None:
            raise HTTPException(status_code=402, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id,User.username == user_name).first()
        return user 
    except JWTError as e:
        # raise HTTPException(status_code=401, detail=e.__repr__())
        raise HTTPException(status_code=402, detail="Invalid token")