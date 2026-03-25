import sys
import os
sys.path.insert(0, '/'.join(os.path.abspath(__file__).split('\\')[:-1]))

# Fallback: usar urllib  
import json
import urllib.request
import urllib.error

try:
    url = "http://127.0.0.1:8000/api/auth/login"
    data = {"username": "admin", "password": "Admin123"}
    
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
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        body = e.read().decode('utf-8')
        print(f"Response: {body}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
