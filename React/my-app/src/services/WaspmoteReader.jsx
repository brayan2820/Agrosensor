import { useState, useRef } from 'react';
import { supabase } from './supabaseClient';

const WaspmoteReader = () => {
  const [port, setPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastReading, setLastReading] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  
  const readerRef = useRef(null);
  const keepReading = useRef(false);

  // Convierte la frecuencia (Hz) del sensor Watermark a Porcentaje (0-100%)
  const convertWatermarkToPercentage = (watermarkHz) => {
    let hz = watermarkHz;
    if (hz < 50) hz = 50;
    else if (hz > 10000) hz = 10000;
    
    // Fórmula inversa: Más Hz = Menos Humedad
    const porcentaje = 100.0 - ((hz - 50) / 99.5) * 100.0;
    return Math.max(0.0, Math.min(100.0, porcentaje));
  };

  // Parsea la cadena cruda del Waspmote: "T:25.5, H:60.2, ..."
  const parseSensorData = (rawString) => {
    try {
      const pattern = /T:\s*([\d.-]+),\s*H:\s*([\d.-]+),\s*L:\s*([\d.-]+),\s*W:\s*([\d.-]+),\s*B:\s*([\d.-]+)/;
      const match = rawString.match(pattern);

      if (match) {
        const temperature = parseFloat(match[1]);
        const humidity = parseFloat(match[2]);
        const luminosity = parseFloat(match[3]);
        const watermarkHz = parseFloat(match[4]);
        const battery = parseFloat(match[5]);

        const humedadSuelo = convertWatermarkToPercentage(watermarkHz);

        // Validación de rangos (Sanity check)
        if (temperature >= -40 && temperature <= 80 && 
            humidity >= 0 && humidity <= 100 &&
            luminosity >= 0 && luminosity <= 20000 &&
            watermarkHz >= 0 && watermarkHz <= 20000) {
              
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

  // Envía los datos leídos a tu API en la Nube (o Local)
  const sendDataToCloud = async (sensorData) => {
    try {
      // 1. Insertar Mediciones (Mapeo: 1=Temp, 2=Hum, 3=Luz, 4=Suelo)
      const { error: errorMediciones } = await supabase
        .from('mediciones')
        .insert([
          { sensor_id: 1, valor: sensorData.temperatura, calidad: 'buena' },
          { sensor_id: 2, valor: sensorData.humedad, calidad: 'buena' },
          { sensor_id: 3, valor: sensorData.luminosidad, calidad: 'buena' },
          { sensor_id: 4, valor: sensorData.humedad_suelo, calidad: 'buena' }
        ]);

      if (errorMediciones) throw errorMediciones;

      // 2. Insertar Batería (si la tabla existe)
      /* 
         Descomenta si tienes la tabla 'estado_sistema' o similar en Supabase
         const { error: errorBat } = await supabase
           .from('estado_sistema')
           .insert([{ dispositivo_id: 1, bateria: sensorData.bateria }]);
         if (errorBat) throw errorBat;
      */

      addLog(`☁️ Supabase: T:${sensorData.temperatura}° H:${sensorData.humedad}%`);
    } catch (err) {
      console.error(err);
      addLog(`❌ Error Supabase: ${err.message}`);
    }
  };

  const addLog = (msg) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev.slice(0, 50)]);
  };

  const connectSerial = async () => {
    if (!('serial' in navigator)) {
      setError('Tu navegador no soporta Web Serial. Usa Chrome o Edge.');
      return;
    }

    try {
      // Solicita al usuario seleccionar el puerto
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      
      setPort(port);
      setIsConnected(true);
      keepReading.current = true;
      readLoop(port);
      addLog("🔌 Conectado al Waspmote");
      setError('');
    } catch (err) {
      setError('Error de conexión: ' + err.message);
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
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Guarda el fragmento incompleto

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
    <div className="card" style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📡 Conexión Directa Waspmote</h3>
      <div style={{ marginBottom: '15px' }}>
        {!isConnected ? (
          <button onClick={connectSerial} className="btn-primary" style={{ padding: '10px 20px', cursor: 'pointer' }}>
            🔌 Conectar USB
          </button>
        ) : (
          <button onClick={disconnectSerial} className="btn-danger" style={{ padding: '10px 20px', cursor: 'pointer', background: '#ff4444', color: 'white' }}>
            ❌ Desconectar
          </button>
        )}
      </div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {lastReading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#e3f2fd', padding: '10px', borderRadius: '5px' }}>
          <div><strong>Temp:</strong> {lastReading.temperatura}°C</div>
          <div><strong>Hum:</strong> {lastReading.humedad}%</div>
          <div><strong>Luz:</strong> {lastReading.luminosidad} lux</div>
          <div><strong>Suelo:</strong> {lastReading.humedad_suelo}%</div>
          <div><strong>Bat:</strong> {lastReading.bateria}%</div>
        </div>
      )}
      
      <div style={{ marginTop: '15px', background: '#333', color: '#0f0', padding: '10px', height: '150px', overflowY: 'auto', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
      </div>
    </div>
  );
};

export default WaspmoteReader;