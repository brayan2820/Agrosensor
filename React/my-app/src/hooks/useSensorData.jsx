import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '../services/api.jsx'
import { 
  saveMedicionOffline, 
  getMedicionesOffline, 
  isOnline,
  onConnectivityChange 
} from '../services/offlineService'

function useSensorData() {
  const [sensorData, setSensorData] = useState(null);
  const [batteryData, setBatteryData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [timeRange, setTimeRange] = useState(6);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(!isOnline());
  
  // Usar refs para evitar dependencias circulares
  const sensorDataRef = useRef(sensorData);
  const batteryDataRef = useRef(batteryData);

  useEffect(() => {
    sensorDataRef.current = sensorData;
    batteryDataRef.current = batteryData;
  }, [sensorData, batteryData]);

  // Escuchar cambios de conectividad
  useEffect(() => {
    const handleConnectivity = (online) => {
      setOffline(!online);
      if (online) {
        loadOnlineData();
      }
    };
    
    onConnectivityChange(handleConnectivity);
    return () => {
      window.removeEventListener('online', () => handleConnectivity(true));
      window.removeEventListener('offline', () => handleConnectivity(false));
    };
  }, []);

  const unwrapApiData = (payload) => {
    if (!payload) return null;
    if (Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data;
    return payload;
  };

  const loadLocalJSON = useCallback(async () => {
    try {
      const response = await fetch('/datos_sensor.json?_=' + Date.now());
      if (!response.ok) throw new Error('No JSON');
      
      const jsonData = await response.json();
      
      if (jsonData?.length > 0) {
        const latest = jsonData[jsonData.length - 1];
        setSensorData({
          temperatura: latest.temperatura,
          humedad: latest.humedad,
          humedad_suelo: latest.humedad_suelo,
          luminosidad: latest.luminosidad
        });
        setHistoricalData(jsonData);
        setBatteryData({ bateria: latest.bateria });
        setError(null);
      }
    } catch (err) {
      console.log('No hay datos locales');
    }
  }, []);

  const loadOnlineData = useCallback(async (hours = timeRange) => {
    if (!api.isAuthenticated()) {
      setError('No autenticado');
      setLoading(false);
      return;
    }

    // ✅ Solo mostrar loading si NO hay datos
    if (!sensorDataRef.current && !batteryDataRef.current) {
      setLoading(true);
    }
    
    try {
      const results = await Promise.allSettled([
        api.getLatestMeasurements(),
        api.getBatteryStatus(),
        api.getHistoricalData(hours)
      ]);

      const [measurementsResult, batteryResult, historicalResult] = results;

      if (measurementsResult.status === 'fulfilled') {
        const data = unwrapApiData(measurementsResult.value) || {};
        setSensorData(data);
        
        if (data.temperatura) {
          await saveMedicionOffline({
            temperatura: data.temperatura,
            humedad: data.humedad,
            humedad_suelo: data.humedad_suelo,
            luminosidad: data.luminosidad,
            timestamp: new Date().toISOString()
          });
        }
      }

      if (batteryResult.status === 'fulfilled') {
        const battery = unwrapApiData(batteryResult.value) || {};
        setBatteryData(battery);
      }

      if (historicalResult.status === 'fulfilled') {
        const historical = unwrapApiData(historicalResult.value) || [];
        setHistoricalData(historical);
      }

      setError(null);
      
    } catch (err) {
      console.error('Error:', err.message);
      if (!sensorDataRef.current) {
        setError('Error cargando datos');
      }
    } finally {
      setLoading(false);
    }
  }, [timeRange]); // ✅ Solo timeRange como dependencia

  // Efecto principal - SOLO UNA VEZ
  useEffect(() => {
    if (offline) {
      loadLocalJSON();
    } else {
      loadOnlineData();
    }
  }, [offline]); // Solo cuando cambia offline

  // Polling online - cada 10s
  useEffect(() => {
    if (!offline) {
      const interval = setInterval(() => {
        loadOnlineData();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [offline]); // ✅ Solo offline como dependencia

  // Polling offline - cada 5s
  useEffect(() => {
    if (offline) {
      const interval = setInterval(() => {
        loadLocalJSON();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [offline]); // ✅ Solo offline como dependencia

  const changeTimeRange = (hours) => {
    setTimeRange(hours);
    if (!offline) {
      loadOnlineData(hours);
    }
  };

  return {
    sensorData,
    batteryData,
    historicalData,
    timeRange,
    loading,
    error,
    offline,
    refetch: offline ? loadLocalJSON : () => loadOnlineData(timeRange),
    changeTimeRange
  };
}

export default useSensorData;