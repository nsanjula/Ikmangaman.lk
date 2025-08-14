from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Create database directory if it doesn't exist
database_dir = os.path.dirname(__file__)
os.makedirs(database_dir, exist_ok=True)

# Use absolute path to database file
database_path = os.path.join(database_dir, "ikmangaman.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{database_path}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autocommit = False, autoflush=False)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
