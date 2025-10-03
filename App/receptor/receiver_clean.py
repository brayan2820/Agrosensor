# receiver_clean.py
import serial
import requests
import re
import time
from datetime import datetime

# Configuración
SERIAL_PORT = 'COM8'
BAUD_RATE = 115200  
API_URL = 'http://localhost:8000/api/sensor-data/'

def clean_sensor_data(raw_string):
    """Limpia los caracteres extraños y extrae los datos del sensor"""
    try:
        print(f"📨 Dato crudo recibido: {repr(raw_string)}")
        
        # Buscar el patrón T: número, H: número
        pattern = r'T:\s*([\d.-]+),\s*H:\s*([\d.-]+)'
        match = re.search(pattern, raw_string)
        
        if match:
            temperature = float(match.group(1))
            humidity = float(match.group(2))
            
            # Validar rangos razonables
            if -40 <= temperature <= 80 and 0 <= humidity <= 100:
                return {
                    'temperatura': round(temperature, 2),
                    'humedad': round(humidity, 2)
                }
            else:
                print("⚠️  Datos fuera de rango válido")
                return None
        else:
            print("❌ No se encontró patrón de sensor")
            return None
            
    except Exception as e:
        print(f"❌ Error limpiando datos: {e}")
        return None

def send_to_api(data):
    """Enviar datos a la API"""
    try:
        print(f"📤 Enviando a API: {data}")
        response = requests.post(API_URL, json=data, timeout=5)
        
        if response.status_code == 200:
            print("✅ Datos enviados exitosamente")
            return True
        else:
            print(f"❌ Error API (HTTP {response.status_code}): {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("🔌 Error: No se puede conectar a la API. ¿Está ejecutándose FastAPI?")
        return False
    except requests.exceptions.RequestException as e:
        print(f"🌐 Error de conexión: {e}")
        return False

def main():
    try:
        # Configurar puerto serial
        ser = serial.Serial(
            port=SERIAL_PORT,
            baudrate=BAUD_RATE,
            timeout=1,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE
        )
        
        print(f"🔌 Conectado a {SERIAL_PORT} a {BAUD_RATE} baudios")
        print("📡 Esperando datos del sensor... (Ctrl+C para detener)")
        print("💡 Asegúrate de que FastAPI esté ejecutándose en otra terminal")
        
        while True:
            try:
                if ser.in_waiting > 0:
                    # Leer línea
                    raw_line = ser.readline()
                    
                    # Intentar decodificar
                    try:
                        decoded_line = raw_line.decode('utf-8').strip()
                    except UnicodeDecodeError:
                        # Si falla UTF-8, usar latin-1 que siempre funciona
                        decoded_line = raw_line.decode('latin-1').strip()
                    
                    if decoded_line:
                        # Limpiar y procesar datos
                        sensor_data = clean_sensor_data(decoded_line)
                        
                        if sensor_data:
                            success = send_to_api(sensor_data)
                            if not success:
                                print("💾 Guardando localmente (modo respaldo)...")
                                # Guardar en archivo local si API no está disponible
                                with open("sensor_backup.txt", "a") as f:
                                    f.write(f"{datetime.now()}: {sensor_data}\n")
                
                time.sleep(0.1)
                
            except Exception as e:
                print(f"⚠️  Error en loop: {e}")
                time.sleep(1)
                
    except serial.SerialException as e:
        print(f"❌ Error de puerto serial: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Programa detenido por el usuario")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("🔒 Puerto serial cerrado")

if __name__ == "__main__":
    main()