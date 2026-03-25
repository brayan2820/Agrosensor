import json
import urllib.request
import urllib.error

url = "http://127.0.0.1:8000/api/auth/login"
data = {"username": "admin", "password": "Admin123"}

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status: {response.status}")
            body = response.read().decode('utf-8')
            print(f"Response: {body}")
            result = json.loads(body)
            print(f"Token: {result['access_token'][:50]}...")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        body = e.read().decode('utf-8')
        print(f"Response: {body}")
        
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
