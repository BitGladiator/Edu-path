import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("edupath.database")

Base = declarative_base()

def get_engine():
    try:
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3} if "postgres" in settings.DATABASE_URL else {}
        )
        # Test connection
        with engine.connect() as conn:
            pass
        logger.info(f"Connected to primary database: {settings.DATABASE_URL.split('@')[-1]}")
        return engine
    except Exception as e:
        logger.warning(f"Could not connect to primary database ({e}). Falling back to SQLite: {settings.FALLBACK_SQLITE_URL}")
        engine = create_engine(
            settings.FALLBACK_SQLITE_URL,
            connect_args={"check_same_thread": False}
        )
        return engine

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
