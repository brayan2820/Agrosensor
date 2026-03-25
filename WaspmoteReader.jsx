import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

const WaspmoteReader = () => {
  const [port, setPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastReading, setLastReading] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  // Referencia para mantener el lector activo
  const readerRef = useRef(null);
  const keepReading = useRef(false);

  // Lógica portada de receiver.py: Convertir Hz a Porcentaje
  const convertWatermarkToPercentage = (watermarkHz) => {
    let hz = watermarkHz;
    if (hz < 50) hz = 50;
    else if (hz > 10000) hz = 10000;
    
    const porcentaje = 100.0 - ((hz - 50) / 99.5) * 100.0;
    return Math.max(0.0, Math.min(100.0, porcentaje));
  };

  // Lógica portada de receiver.py: Limpiar y extraer datos
  const parseSensorData = (rawString) => {
    try {
      // Patrón regex adaptado a JavaScript
      // T: 25.50, H: 60.20, L: 450.00, W: 51.90, B: 85.50
      const pattern = /T:\s*([\d.-]+),\s*H:\s*([\d.-]+),\s*L:\s*([\d.-]+),\s*W:\s*([\d.-]+),\s*B:\s*([\d.-]+)/;
      const match = rawString.match(pattern);

      if (match) {
        const temperature = parseFloat(match[1]);
        const humidity = parseFloat(match[2]);
        const luminosity = parseFloat(match[3]);
        const watermarkHz = parseFloat(match[4]);
        const battery = parseFloat(match[5]);

        // Convertir Watermark
        const humedadSuelo = convertWatermarkToPercentage(watermarkHz);

        // Validar rangos (mismos rangos que receiver.py)
        if (temperature >= -40 && temperature <= 80 && 
            humidity >= 0 && humidity <= 100 &&
            luminosity >= 0 && luminosity <= 20000 &&
            watermarkHz >= 0 && watermarkHz <= 20000 &&
            battery >= 0 && battery <= 100) {
              
          return {
            temperatura: parseFloat(temperature.toFixed(2)),
            humedad: parseFloat(humidity.toFixed(2)),
            luminosidad: parseFloat(luminosity.toFixed(2)),
            humedad_suelo: parseFloat(humedadSuelo.toFixed(1)),
            bateria: parseFloat(battery.toFixed(1))
          };
        }
      }
      return null;
    } catch (e) {
      console.error("Error parseando datos:", e);
      return null;
    }
  };

  const sendDataToCloud = async (sensorData) => {
    try {
      // Enviar mediciones
      // Nota: api.jsx se encargará de apuntar a la URL de la nube
      const token = localStorage.getItem('token');
      if (!token) {
        addLog("⚠️ No hay sesión iniciada, no se pueden enviar datos");
        return;
      }

      // Enviar a endpoint de mediciones
      await fetch(`${import.meta.env.VITE_API_BASE}/api/mediciones/waspmote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperatura: sensorData.temperatura,
          humedad: sensorData.humedad,
          luminosidad: sensorData.luminosidad,
          humedad_suelo: sensorData.humedad_suelo
        })
      });

      // Enviar batería
      await fetch(`${import.meta.env.VITE_API_BASE}/api/estado-sistema/waspmote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispositivo_id: 1,
          bateria: sensorData.bateria
        })
      });

      addLog(`✅ Datos enviados: T:${sensorData.temperatura}°C B:${sensorData.bateria}%`);
    } catch (err) {
      addLog(`❌ Error enviando a nube: ${err.message}`);
    }
  };

  const addLog = (msg) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 9)]);
  };

  const connectSerial = async () => {
    if (!('serial' in navigator)) {
      setError('Tu navegador no soporta Web Serial API. Usa Chrome o Edge.');
      return;
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      setPort(port);
      setIsConnected(true);
      keepReading.current = true;
      readLoop(port);
      addLog("🔌 Puerto conectado correctamente");
      setError('');
    } catch (err) {
      setError('Error al conectar: ' + err.message);
    }
  };

  const disconnectSerial = async () => {
    keepReading.current = false;
    if (readerRef.current) {
      await readerRef.current.cancel();
    }
    if (port) {
      await port.close();
    }
    setPort(null);
    setIsConnected(false);
    addLog("🔒 Desconectado");
  };

  const readLoop = async (currentPort) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = currentPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();
    readerRef.current = reader;

    let buffer = '';

    try {
      while (keepReading.current) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += value;
        
        // Procesar líneas completas
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Guardar el fragmento incompleto para la siguiente vuelta

        for (const line of lines) {
          if (line.trim()) {
            const cleanData = parseSensorData(line.trim());
            if (cleanData) {
              setLastReading(cleanData);
              await sendDataToCloud(cleanData);
            }
          }
        }
      }
    } catch (error) {
      addLog(`Error de lectura: ${error}`);
    } finally {
      reader.releaseLock();
    }
  };

  return (
    <div className="card">
      <h3>📡 Conexión Waspmote (Nube)</h3>
      <div className="actions">
        {!isConnected ? (
          <button onClick={connectSerial} className="btn-primary">Conectar Waspmote USB</button>
        ) : (
          <button onClick={disconnectSerial} className="btn-danger">Desconectar</button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      
      {lastReading && (
        <div className="sensor-preview">
          <p>🌡️ Temp: {lastReading.temperatura}°C | 💧 Hum: {lastReading.humedad}% | 🔋 Bat: {lastReading.bateria}%</p>
        </div>
      )}
      
      <div className="logs-console" style={{background: '#f4f4f4', padding: '10px', marginTop: '10px', fontSize: '0.8rem', maxHeight: '100px', overflowY: 'auto'}}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default WaspmoteReader;