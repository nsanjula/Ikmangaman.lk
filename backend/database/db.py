from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLALCHEMY_DATABASE_URL = "sqlite:///D:/FastAPI/TestProject/blog.db"    D:\Idealize 2025\Ikmangaman.lk_main\backend\database
# SQLALCHEMY_DATABASE_URL = "sqlite:///D:/Idealize 2025/Ikmangaman.lk_main/backend/database/ikmangaman.db"
SQLALCHEMY_DATABASE_URL = "sqlite:///D:/Projects/Idealize 2025/Ikmangaman.lk/backend/database/ikmangaman.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit = False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()








