from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 👉 Ajusta tu conexión: usuario, contraseña, host, puerto y nombre BD
DATABASE_URL = "postgresql://postgres:sergio123@localhost:5432/sensores_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
