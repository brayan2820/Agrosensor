FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema si son necesarias (ej. para drivers de DB)
RUN apt-get update && apt-get install -y gcc libpq-dev build-essential libssl-dev libffi-dev && rm -rf /var/lib/apt/lists/*

# Actualizar pip para evitar problemas con versiones viejas
RUN pip install --upgrade pip

# Copiar requirements primero para aprovechar caché
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
