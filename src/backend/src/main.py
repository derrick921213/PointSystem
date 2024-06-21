from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, RedirectResponse
from api.router import router as api_router
from config import Config
from database import init_db
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
app = FastAPI(title='My FastAPI Project')
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.allow_origins,  # 允许的域名列表
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key=Config.secret_key)
init_db()
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code == 402:
        return RedirectResponse(url="/auth/logout/")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": str(exc.detail)},
    )
app.include_router(api_router)
