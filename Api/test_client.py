import sys
sys.path.insert(0, '.')

from app.database import SessionLocal
from app.models.database_models import Usuario
from app.models.user_models import UserLogin, Token, UserResponse
from app.routers.auth import login
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Hacer request
try:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "Admin123"}
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
