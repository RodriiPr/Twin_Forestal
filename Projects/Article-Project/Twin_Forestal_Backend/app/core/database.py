import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_engine():
    db_url = settings.DATABASE_URL
    try:
        # Test connecting to the primary DB (PostgreSQL) with short timeout
        connect_args = {"connect_timeout": 2} if "postgresql" in db_url else {}
        engine = create_engine(db_url, pool_pre_ping=True, connect_args=connect_args)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info(f"Connected to primary database: {db_url.split('@')[-1]}")
        return engine
    except Exception as e:
        if settings.SQLITE_FALLBACK:
            sqlite_url = "sqlite:///./silvatwin.db"
            logger.warning(
                f"Could not connect to PostgreSQL ({e}). "
                f"Falling back to local SQLite: {sqlite_url}"
            )
            return create_engine(
                sqlite_url, 
                connect_args={"check_same_thread": False}
            )
        raise e

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
