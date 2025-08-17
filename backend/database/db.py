# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# import os
#
# # Create database directory if it doesn't exist
# database_dir = os.path.dirname(__file__)
# os.makedirs(database_dir, exist_ok=True)
#
# # Use absolute path to database file
# database_path = os.path.join(database_dir, "ikmangaman.db")
# SQLALCHEMY_DATABASE_URL = f"sqlite:///{database_path}"
#
# engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
#
# SessionLocal = sessionmaker(bind=engine, autocommit = False, autoflush=False)
#
# Base = declarative_base()
#
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1) Resolve the SQLite file path
#    - Locally: uses the ikmangaman.db that's inside this folder
#    - Railway: override with DB_PATH env var
default_db_path = Path(__file__).resolve().parent / "ikmangaman.db"
db_path = Path(os.getenv("DB_PATH", default_db_path.as_posix()))

# Ensure parent directory exists (safe on both local and Railway)
db_path.parent.mkdir(parents=True, exist_ok=True)

# 2) Build the SQLite URL (POSIX path works on Win/Linux)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path.as_posix()}"

# 3) Engine + Session
#    check_same_thread=False is required for SQLite with FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

# 4) Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
