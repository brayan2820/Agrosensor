from app.database import SessionLocal
from app.models.database_models import Usuario
from app.utils.auth_utils import get_password_hash, verify_password

# Conectar a la BD
db = SessionLocal()

try:
    # Actualizar contraseña del usuario admin
    admin_user = db.query(Usuario).filter(Usuario.username == "admin").first()
    if admin_user:
        new_password = "Admin123"
        admin_user.password_hash = get_password_hash(new_password)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✓ Contraseña actualizada para {admin_user.username}")
        print(f"  Email: {admin_user.email}")
        
        # Verificar que funciona
        is_valid = verify_password(new_password, admin_user.password_hash)
        print(f"  Contraseña válida: {is_valid}")
    else:
        print("Usuario admin no encontrado")
        
finally:
    db.close()
