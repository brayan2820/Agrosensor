from app.database import SessionLocal
from app.models.database_models import Usuario
from app.utils.auth_utils import get_password_hash
from sqlalchemy.sql import func

# Conectar a la BD
db = SessionLocal()

try:
    # Eliminar usuario admin anterior si existe
    admin_user = db.query(Usuario).filter(Usuario.username == "admin").first()
    if admin_user:
        print(f"Eliminando usuario existente: {admin_user.username}")
        db.delete(admin_user)
        db.commit()
    
    # Crear nuevo usuario admin
    new_user = Usuario(
        username="admin",
        email="admin@sigma.com",
        password_hash=get_password_hash("Admin123"),
        rol="admin",
        activo=True,
        fecha_creacion=func.now()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✓ Usuario creado exitosamente!")
    print(f"  Username: {new_user.username}")
    print(f"  Email: {new_user.email}")
    print(f"  Rol: {new_user.rol}")
    print(f"  Activo: {new_user.activo}")
    
    # Verificar que funciona
    from app.utils.auth_utils import verify_password
    is_valid = verify_password("Admin123", new_user.password_hash)
    print(f"  Contraseña válida: {is_valid}")
    
finally:
    db.close()
