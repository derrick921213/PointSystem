from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from schemas import UserCreate, UserLogin
from dependencies import get_db
from core.security import create_access_token, validate_token, verify_password,pwd_context
from models import User
from config import Config
from sqlalchemy.exc import IntegrityError
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login/")
async def login_for_access_token(response: Response,form_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user.username,"user_id": user.id})
    response.set_cookie(key=Config.cookie_name, value=access_token, max_age=1800, domain=Config.domain_env, path="/", httponly=True, secure=False, samesite='Lax')
    # return {"access_token": access_token, "token_type": "bearer"}
    return {"message": "Login successful.","is_logged_in": True}

@router.post("/register/")
def register_user(Userdata: UserCreate, db: Session = Depends(get_db)):
    hashed_password = pwd_context.hash(Userdata.password)
    user = User(username=Userdata.username, email=Userdata.email, hashed_password=hashed_password)
    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="用戶名或郵件已存在。")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="內部伺服器錯誤。")
    return {"message": "User created successfully."}

@router.post("/logout/")
async def logoutWithAccess(response: Response,user: User = Depends(validate_token)):
    response.delete_cookie(key=Config.cookie_name, domain=Config.domain_env, path="/")
    return {"message": "Logout successful."}

@router.get("/isLogin/")
async def isLogin(user: User = Depends(validate_token)):
    return {"message": f"{user.username}","is_logged_in": True}