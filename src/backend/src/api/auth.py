from fastapi import APIRouter, HTTPException, Depends, Response, Request
from sqlalchemy.orm import Session
from dependencies import get_db
from core.security import create_access_token, validate_token
from models import User
from config import Config
from google.oauth2 import id_token
from google.auth.transport.requests import Request as GoogleRequest
from google_auth_oauthlib.flow import Flow
from fastapi.responses import RedirectResponse
import os
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
router = APIRouter(prefix="/auth", tags=["auth"])

flow = Flow.from_client_config(
    client_config={
        "web": {
            "client_id": Config.google_client_id,
            "client_secret": Config.google_client_secret,
            "redirect_uris": [Config.google_redirect_uri],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token"
        }
    },
    scopes=["openid", "email", "profile"],
    redirect_uri=Config.google_redirect_uri
)


@router.get("/login/")
async def google_login(request: Request):
    authorization_url, state = flow.authorization_url(
        prompt='consent', access_type='offline')
    request.session['state'] = state
    return RedirectResponse(authorization_url)


@router.get("/callback/")
async def google_auth_callback(request: Request, response: Response, db: Session = Depends(get_db)):
    if 'state' not in request.session:
        raise HTTPException(status_code=400, detail="無效的state参数")
    try:
        flow.fetch_token(authorization_response=str(request.url))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"獲取Token失敗: {e}")
    credentials = flow.credentials
    try:
        id_info = id_token.verify_oauth2_token(
            credentials.id_token, GoogleRequest(), Config.google_client_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID Token驗證失敗: {e}")

    if id_info["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(status_code=400, detail="發行者錯誤")

    if id_info["email"] not in Config.allowed_emails:
        return HTTPException(status_code=403, detail=f"User {id_info['email']} not allowed.")
        # return RedirectResponse(url="/auth/login/")

    user = db.query(User).filter(User.email == id_info["email"]).first()
    if not user:
        user = User(
            email=id_info["email"], username=id_info["name"], avatar_url=id_info["picture"])
        db.add(user)
        db.commit()
    else:
        user.avatar_url = id_info["picture"]
        db.commit()

    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "email": user.email})
    response = RedirectResponse(url=Config.frontend_redirect_uri)
    response.set_cookie(key=Config.cookie_name, value=access_token, max_age=1800,
                        domain=Config.domain_env, path="/", httponly=True, secure=False, samesite='Lax')

    return response

@router.get("/logout/")
async def logout_with_access(response: Response, user: User = Depends(validate_token)):
    response.delete_cookie(key=Config.cookie_name,
                           domain=Config.domain_env, path="/")
    response = RedirectResponse(url=Config.frontend_redirect_uri)
    response.delete_cookie(key=Config.cookie_name,
                           domain=Config.domain_env, path="/")
    # return {"message": "Logout successful."}
    return response


@router.get("/isLogin/")
async def is_login(user: User = Depends(validate_token)):
    return {"message": f"{user.id}", "is_logged_in": True, "permission": "admin" if user.permission==1 else "user"}