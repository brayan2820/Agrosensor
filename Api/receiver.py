import serial
import serial.tools.list_ports
import requests
import re
import time
import json
import os
from datetime import datetime

# Configuración - SUPABASE (Nube)
# ¡IMPORTANTE! Reemplaza estas credenciales con las de tu proyecto Supabase
SUPABASE_URL = "https://TU_PROYECTO.supabase.co" 
SUPABASE_KEY = "TU_API_KEY_ANON_PUBLIC" # La key larga que empieza por eyJ...

# Endpoints de la API REST de Supabase
MEDICIONES_URL = f'{SUPABASE_URL}/rest/v1/mediciones'

SERIAL_PORT = 'COM8'
BAUD_RATE = 115200

# Configuración JSON para frontend - RUTA CORREGIDA
JSON_FILE = r'C:\Users\bryan\OneDrive\Documents\SIGMA-251\React\my-app\public\datos_sensor.json'
MAX_MEDICIONES = 100

def guardar_en_json(medicion):
    """Guarda la medición en un archivo JSON para el frontend - VERSIÓN CORREGIDA"""
    try:
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(JSON_FILE), exist_ok=True)
        
        # Si el archivo no existe, crearlo con array vacío
        if not os.path.exists(JSON_FILE):
            with open(JSON_FILE, 'w') as f:
                json.dump([], f)
            mediciones = []
        else:
            # Leer mediciones existentes (manejando archivo vacío/corrupto)
            try:
                with open(JSON_FILE, 'r') as f:
                    contenido = f.read().strip()
                    if contenido:
                        mediciones = json.loads(contenido)
                    else:
                        mediciones = []
            except (json.JSONDecodeError, ValueError):
                print("⚠️ Archivo JSON corrupto, creando nuevo")
                mediciones = []
        
        # Agregar nueva medición con timestamp
        medicion_con_timestamp = {
            **medicion,
            'timestamp': datetime.now().isoformat(),
            'id': int(datetime.now().timestamp() * 1000)
        }
        mediciones.append(medicion_con_timestamp)
        
        # Mantener solo últimas MAX_MEDICIONES
        if len(mediciones) > MAX_MEDICIONES:
            mediciones = mediciones[-MAX_MEDICIONES:]
        
        # Guardar archivo
        with open(JSON_FILE, 'w') as f:
            json.dump(mediciones, f, indent=2)
            
        print(f"💾 JSON guardado: {JSON_FILE} ({len(mediciones)} mediciones)")
        return True
    except Exception as e:
        print(f"❌ Error guardando JSON: {e}")
        return False

def convert_watermark_to_percentage(watermark_hz):
    """Convierte Hz del Watermark a porcentaje - ESCALA INVERSA CORRECTA"""
    if watermark_hz < 50:
        watermark_hz = 50
    elif watermark_hz > 10000:
        watermark_hz = 10000
    
    porcentaje = 100.0 - ((watermark_hz - 50) / 99.5) * 100.0
    return max(0.0, min(100.0, porcentaje))

def clean_sensor_data(raw_string):
    """Limpia los caracteres extraños y extrae los datos del sensor"""
    try:
        print(f"📨 Dato crudo recibido: {repr(raw_string)}")
        
        # Buscar el patrón T: número, H: número, L: número, W: número, B: número
        pattern = r'T:\s*([\d.-]+),\s*H:\s*([\d.-]+),\s*L:\s*([\d.-]+),\s*W:\s*([\d.-]+),\s*B:\s*([\d.-]+)'
        match = re.search(pattern, raw_string)
        
        if match:
            temperature = float(match.group(1))
            humidity = float(match.group(2))
            luminosity = float(match.group(3))
            watermark_hz = float(match.group(4))
            battery = float(match.group(5))
            
            # Convertir Watermark Hz a porcentaje
            humedad_suelo_porcentaje = convert_watermark_to_percentage(watermark_hz)
            
            # Validar rangos razonables
            if (-40 <= temperature <= 80 and 
                0 <= humidity <= 100 and 
                0 <= luminosity <= 20000 and
                0 <= watermark_hz <= 20000 and
                0 <= battery <= 100):
                
                return {
                    'temperatura': round(temperature, 2),
                    'humedad': round(humidity, 2),
                    'luminosidad': round(luminosity, 2),
                    'humedad_suelo': round(humedad_suelo_porcentaje, 1),
                    'bateria': round(battery, 1)
                }
            else:
                print("⚠️  Datos fuera de rango válido")
                return None
        else:
            # Intentar con patrón anterior (sin batería) para compatibilidad
            pattern_old = r'T:\s*([\d.-]+),\s*H:\s*([\d.-]+),\s*L:\s*([\d.-]+),\s*W:\s*([\d.-]+)'
            match_old = re.search(pattern_old, raw_string)
            
            if match_old:
                temperature = float(match_old.group(1))
                humidity = float(match_old.group(2))
                luminosity = float(match_old.group(3))
                watermark_hz = float(match_old.group(4))
                
                if (-40 <= temperature <= 80 and 
                    0 <= humidity <= 100 and 
                    0 <= luminosity <= 20000 and
                    0 <= watermark_hz <= 20000):
                    
                    humedad_suelo_porcentaje = convert_watermark_to_percentage(watermark_hz)
                    
                    return {
                        'temperatura': round(temperature, 2),
                        'humedad': round(humidity, 2),
                        'luminosidad': round(luminosity, 2),
                        'humedad_suelo': round(humedad_suelo_porcentaje, 1),
                        'bateria': None
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

def send_to_api(sensor_data):
    """Enviar datos DIRECTO A SUPABASE (Nube)"""
    try:
        # SIEMPRE guardar en JSON (para offline)
        guardar_en_json(sensor_data)
        
        # Preparar headers para Supabase
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        # Supabase espera un array de objetos (uno por cada sensor)
        # Mapeo: 1=Temp, 2=Hum, 3=Luz, 4=Suelo
        payload_mediciones = [
            {"sensor_id": 1, "valor": sensor_data['temperatura'], "calidad": "buena"},
            {"sensor_id": 2, "valor": sensor_data['humedad'], "calidad": "buena"},
            {"sensor_id": 3, "valor": sensor_data['luminosidad'], "calidad": "buena"},
            {"sensor_id": 4, "valor": sensor_data['humedad_suelo'], "calidad": "buena"}
        ]
        
        print(f"☁️ Enviando a Nube (Supabase)...")
        response = requests.post(MEDICIONES_URL, json=payload_mediciones, headers=headers, timeout=5)
        
        if response.status_code in [200, 201, 204]:
            print("✅ Datos guardados en la nube exitosamente")
        else:
            print(f"❌ Error Supabase: {response.status_code} - {response.text}")
            return False
        
        return True
            
    except Exception as e:
        print(f"🌐 Error de conexión a Internet: {e}")
        print("💾 Guardando backup en archivo de texto...")
        with open("sensor_backup.txt", "a") as f:
            f.write(f"{datetime.now()}: {sensor_data}\n")
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
        print("💡 Formato esperado: T:25.50,H:60.20,L:450.00,W:51.90,B:85.50")
        print("💡 Watermark: 50Hz=100%, 10000Hz=0% (escala inversa)")
        print("💡 Batería: 0-100%")
        print(f"💾 Guardando JSON en: {JSON_FILE}")
        
        while True:
            try:
                if ser.in_waiting > 0:
                    # Leer línea
                    raw_line = ser.readline()
                    
                    # Intentar decodificar
                    try:
                        decoded_line = raw_line.decode('utf-8').strip()
                    except UnicodeDecodeError:
                        decoded_line = raw_line.decode('latin-1').strip()
                    
                    if decoded_line:
                        # Limpiar y procesar datos
                        sensor_data = clean_sensor_data(decoded_line)
                        
                        if sensor_data:
                            success = send_to_api(sensor_data)
                            # El JSON ya se guardó dentro de send_to_api
                
                time.sleep(0.1)
                
            except Exception as e:
                print(f"⚠️  Error en loop: {e}")
                time.sleep(1)
                
    except serial.SerialException as e:
        print(f"❌ Error de puerto serial: {e}")
        print("\n🔍 Buscando puertos disponibles...")
        ports = serial.tools.list_ports.comports()
        if ports:
            print("   Se encontraron los siguientes puertos:")
            for p in ports:
                print(f"   -> {p.device} ({p.description})")
            print(f"   ⚠️  Por favor, cambia la variable SERIAL_PORT en este archivo por el correcto.")
        else:
            print("   ⚠️  No se encontraron puertos COM activos. Verifica el cable USB.")
    except KeyboardInterrupt:
        print("\n🛑 Programa detenido por el usuario")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("🔒 Puerto serial cerrado")

if __name__ == "__main__":
    main()