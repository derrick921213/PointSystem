from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import Config
from sqlalchemy import inspect

SQLALCHEMY_DATABASE_URL = Config.db_url
engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
inspector = inspect(engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
class init_db:
    def __init__(self):
        table_names = inspector.get_table_names()
        for table_name, table_obj in Base.metadata.tables.items():
            if table_name not in table_names:
                table_obj.create(engine)