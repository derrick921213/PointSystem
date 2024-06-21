from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas import UserOut
from dependencies import get_db
from models import User
from core.security import validate_token

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
async def read_users(db: Session = Depends(get_db)):
    return db.query(User).all()
    # return {"message": "This is the users endpoint"}

# @router.get("/{user}")
# async def read_user(user: str, db: Session = Depends(get_db)):
#     # return db.query(User).filter(User.username == user).first()
#     pw = get_password_hash("password")
#     return {"message": f"{pw}"}

@router.get("/dashboard/")
async def protected_route(user: User = Depends(validate_token)):
    username = user.username
    return {"message": f"Hello {username}, you are authorized"}

# @router.get("/protected-route", response_model=UserOut)
# async def protected_route(user: User = Depends(validate_token)):
#     # 假设 validate_token 返回一个 User 模型实例
#     return user 