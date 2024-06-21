from os import getenv
import json
class Config:
    db_host = getenv("DATABASE_HOST")
    db_user = getenv("DATABASE_USER")
    db_name = getenv("DATABASE_NAME")
    db_password = getenv("DATABASE_PASSWORD")
    db_url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    secret_key = getenv("SECRET_KEY")
    algorithm = getenv("ALGORITHM")
    access_token_expire_minutes = int(getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
    domain_env = getenv("DOMAIN")
    cookie_name = getenv("COOKIE_NAME")
    allow_origins = json.loads(getenv("ALLOW_ORIGINS"))
    google_client_id = getenv("GOOGLE_CLIENT_ID")
    google_client_secret = getenv("GOOGLE_CLIENT_SECRET")
    google_redirect_uri = getenv("GOOGLE_REDIRECT_URI")
    allowed_emails = json.loads(getenv("ALLOWED_EMAILS", "[]"))
    frontend_redirect_uri = getenv("FRONTEND_REDIRECT_URI")