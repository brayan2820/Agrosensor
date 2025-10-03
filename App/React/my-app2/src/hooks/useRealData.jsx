// src/hooks/useRealData.js
import { useState, useEffect } from 'react';

// URL base de tu API FastAPI - ajústala según tu configuración
const API_BASE_URL = 'http://localhost:8000';

const useRealData = () => {
  const [currentData, setCurrentData] = useState({
    temperatura: 0,
    humedad: 0,
    radiacion: 0,        // En 0 por ahora
    humedadSuelo: 0,     // En 0 por ahora
    almacenamiento: 0,   // Simulado
    timestamp: new Date()
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener datos de la API
  const fetchData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/sensor-data/`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const apiData = await response.json();
      
      // Transformar datos de la API al formato que espera el frontend
      if (apiData && apiData.length > 0) {
        // Tomar la medición más reciente
        const latestData = apiData[apiData.length - 1];
        
        const newCurrentData = {
          temperatura: latestData.temperatura || 0,
          humedad: latestData.humedad || 0,
          radiacion: 0,  // Por ahora en 0
          humedadSuelo: 0, // Por ahora en 0
          almacenamiento: Math.min((apiData.length / 1000) * 100, 100), // Simular almacenamiento
          timestamp: new Date(latestData.timestamp || new Date())
        };
        
        setCurrentData(newCurrentData);

        // Construir datos históricos para la gráfica (últimas 30 mediciones)
        const historical = apiData.slice(-30).map(item => ({
          tiempo: new Date(item.timestamp),
          temperatura: item.temperatura || 0,
          humedad: item.humedad || 0,
          radiacion: 0,
          humedadSuelo: 0,
          almacenamiento: 0
        }));
        
        setHistoricalData(historical);
      }
      
    } catch (err) {
      console.error('Error fetching data from API:', err);
      setError(err.message);
      
      // Datos de respaldo en caso de error
      setCurrentData(prev => ({
        ...prev,
        timestamp: new Date()
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar datos inmediatamente al montar el componente
    fetchData();

    // Configurar polling cada 5 segundos
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return { 
    currentData, 
    historicalData, 
    loading, 
    error,
    refetch: fetchData // Función para recargar manualmente
  };
};

export default useRealData;