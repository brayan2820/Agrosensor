from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
import models, schemas

router = APIRouter(prefix="/api/sensor-data", tags=["Sensores"])

# Dependencia para obtener sesión de BD
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.MedicionOut)
def crear_medicion(medicion: schemas.MedicionCreate, db: Session = Depends(get_db)):
    db_medicion = models.Medicion(**medicion.dict())
    db.add(db_medicion)
    db.commit()
    db.refresh(db_medicion)
    return db_medicion

@router.get("/", response_model=list[schemas.MedicionOut])
def obtener_mediciones(db: Session = Depends(get_db)):
    return db.query(models.Medicion).all()
