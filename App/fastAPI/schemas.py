from pydantic import BaseModel
from datetime import datetime

class MedicionCreate(BaseModel):
    temperatura: float
    humedad: float

class MedicionOut(BaseModel):
    id: int
    temperatura: float
    humedad: float
    timestamp: datetime

    class Config:
        orm_mode = True
