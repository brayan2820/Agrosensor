from app.database import SessionLocal
from app.models.database_models import Usuario
from app.utils.auth_utils import verify_password, get_password_hash

# Conectar a la BD
db = SessionLocal()

try:
    # Buscar el usuario admin
    usuario = db.query(Usuario).filter(Usuario.username == "admin").first()
    
    if usuario:
        print(f"Usuario encontrado: {usuario.username}")
        print(f"Email: {usuario.email}")
        print(f"Activo: {usuario.activo}")
        print(f"Password hash: {usuario.password_hash[:50]}...")
        
        # Intentar verificar la contraseña
        test_password = "Admin123"
        try:
            is_valid = verify_password(test_password, usuario.password_hash)
            print(f"\nVerificación de contraseña '{test_password}': {is_valid}")
        except Exception as e:
            print(f"\nError verificando contraseña: {str(e)}")
            import traceback
            traceback.print_exc()
    else:
        print("Usuario admin no encontrado en la BD")
        
        # Listar todos los usuarios
        usuarios = db.query(Usuario).all()
        print(f"\nTotal de usuarios en la BD: {len(usuarios)}")
        for u in usuarios:
            print(f"  - {u.username} ({u.email})")
            
finally:
    db.close()
