from app.models.user_models import UserLogin
import json

try:
    # Test 1: Crear UserLogin desde dict
    data = {"username": "admin", "password": "Admin123"}
    login_data = UserLogin(**data)
    print(f"✓ UserLogin creado exitosamente")
    print(f"  Username: {login_data.username}")
    print(f"  Password: {login_data.password}")
    
    # Test 2: Serializar a dict
    as_dict = login_data.model_dump() if hasattr(login_data, 'model_dump') else login_data.dict()
    print(f"\n✓ UserLogin serializado: {json.dumps(as_dict)}")
    
    # Test 3: JSON schema
    schema = UserLogin.model_json_schema() if hasattr(UserLogin, 'model_json_schema') else UserLogin.schema()
    print(f"\n✓ Schema: {json.dumps(schema, indent=2)}")
    
except Exception as e:
    import traceback
    print(f"✗ Error: {e}")
    traceback.print_exc()
