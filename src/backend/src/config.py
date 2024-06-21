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