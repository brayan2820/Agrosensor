from app.database import SessionLocal
from app.models.database_models import Usuario
from app.models.user_models import UserLogin
from app.utils.auth_utils import verify_password, create_access_token
from datetime import datetime

# Conectar a la BD
db = SessionLocal()

try:
    # Simular login
    login_data = UserLogin(username="admin", password="Admin123")
    
    # Buscar usuario
    user = db.query(Usuario).filter(Usuario.username == login_data.username).first()
    
    if not user:
        print("Usuario no encontrado")
    else:
        print(f"Usuario encontrado: {user.username}")
        
        # Verificar password
        is_valid = verify_password(login_data.password, user.password_hash)
        print(f"Contraseña válida: {is_valid}")
        
        if is_valid:
            # Crear token
            access_token = create_access_token(
                data={"user_id": user.id, "username": user.username, "rol": user.rol}
            )
            print(f"Token creado: {access_token[:50]}...")
            
            # Actualizar último login
            user.ultimo_login = datetime.utcnow()
            db.commit()
            print("Último login actualizado")
            
            # Retornar respuesta
            response = {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "rol": user.rol,
                    "activo": user.activo,
                    "fecha_creacion": user.fecha_creacion.isoformat() if user.fecha_creacion else None
                }
            }
            
            import json
            print("\nRespuesta:")
            print(json.dumps(response, indent=2, default=str))
            
finally:
    db.close()
