import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:brayan@localhost:5432/SIGMA")
    
    # Configuración JWT para autenticación
    SECRET_KEY: str = os.getenv("SECRET_KEY", "clave_secreta_jwt_desarrollo_cambiar_en_produccion")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas
    
settings = Settings()