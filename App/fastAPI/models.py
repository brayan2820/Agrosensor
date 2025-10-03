from sqlalchemy import Column, Integer, Float, DateTime, func
from database import Base

class Medicion(Base):
    __tablename__ = "mediciones"

    id = Column(Integer, primary_key=True, index=True)
    temperatura = Column(Float, nullable=False)
    humedad = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
