import json
import urllib.request
import urllib.error

url = "http://localhost:8000/api/auth/login"
data = {
    "username": "admin",
    "password": "Admin123"
}

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        response = urllib.request.urlopen(req)
        status_code = response.status
        content = response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        status_code = e.code
        content = e.read().decode('utf-8')
    
    print(f"Status Code: {status_code}")
    print(f"Response: {content}")
    if status_code == 200:
        print("Login exitoso!")
        print(json.dumps(json.loads(content), indent=2))
except Exception as e:
    import traceback
    print(f"Error: {str(e)}")
    traceback.print_exc()
