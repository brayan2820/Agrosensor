from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import mediciones, estado_sistema, auth 
from app.database import engine, Base

# Crear tablas en la BD
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SIGMA API",
    description="API para sistema de monitoreo de sensores Waspmote",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*", # Permite todos los orígenes (http y https)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(mediciones.router)
app.include_router(estado_sistema.router)
app.include_router(auth.router)  # AÑADIR ESTA LÍNEA

@app.get("/")
async def root():
    return {
        "message": "SIGMA API - Sistema de Gestión de Monitoreo Ambiental",
        "status": "online"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
