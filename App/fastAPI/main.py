from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sensores
import models
from database import engine

# Crear tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Sensores")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # URL de React
    allow_credentials=True,
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los headers
)

# Incluir los endpoints de sensores
app.include_router(sensores.router)

# Opcional: Endpoint de verificación de salud
@app.get("/")
def read_root():
    return {"message": "API de Sensores funcionando"}
