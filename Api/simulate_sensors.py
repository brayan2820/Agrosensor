import requests
import time
import random
import json
from datetime import datetime

# URL de tu API corriendo en Docker
API_URL = "http://localhost:8000/api/mediciones/waspmote"

def generate_fake_data():
    """Genera datos aleatorios realistas"""
    return {
        "temperatura": round(random.uniform(20.0, 30.0), 2),   # Entre 20 y 30 grados
        "humedad": round(random.uniform(40.0, 80.0), 2),       # Entre 40% y 80%
        "luminosidad": round(random.uniform(200.0, 800.0), 2), # Luz ambiente
        "humedad_suelo": round(random.uniform(30.0, 70.0), 1), # Suelo húmedo
        "bateria": round(random.uniform(10.0, 100.0), 1)       # Nivel de batería
    }

def main():
    print("🚀 Iniciando SIMULADOR de sensores (Modo Demo)...")
    print(f"📡 Enviando datos falsos a: {API_URL}")
    print("❌ Presiona Ctrl + C para detener.")
    print("-" * 50)

    while True:
        data = generate_fake_data()
        try:
            # Enviamos el dato a la API como si fuera el Arduino
            response = requests.post(API_URL, json=data)
            
            if response.status_code == 200:
                print(f"✅ Dato simulado enviado: {data}")
            else:
                print(f"⚠️ Error API: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ No se puede conectar a Docker. ¿Ejecutaste 'docker-compose up'?")
        except Exception as e:
            print(f"❌ Error inesperado: {e}")
        
        # Esperar 5 segundos antes del siguiente dato
        time.sleep(5)

if __name__ == "__main__":
    main()