// src/hooks/useMockData.js
import { useState, useEffect } from 'react';

// Generar datos aleatorios para simular mediciones
const generateMockData = () => {
  return {
    temperatura: Math.random() * 30 + 10,     // 10-40°C
    humedad: Math.random() * 100,             // 0-100%
    radiacion: Math.random() * 1000 + 200,    // 200-1200 W/m²
    humedadSuelo: Math.random() * 100,        // 0-100%
    almacenamiento: Math.random() * 100,      // 0-100%
    timestamp: new Date()
  };
};

// Generar datos históricos para la gráfica
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now - i * 60000); // Un dato por minuto
    data.push({
      tiempo: time,
      temperatura: Math.random() * 30 + 10,
      humedad: Math.random() * 100,
      radiacion: Math.random() * 1000 + 200,
      humedadSuelo: Math.random() * 100,
      almacenamiento: Math.random() * 100,
    });
  }
  
  return data;
};

const useMockData = () => {
  const [currentData, setCurrentData] = useState(generateMockData());
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());

  useEffect(() => {
    // Simular actualización de datos en tiempo real
    const interval = setInterval(() => {
      const newData = generateMockData();
      setCurrentData(newData);
      
      // Actualizar datos históricos
      setHistoricalData(prev => {
        const newHistorical = [...prev.slice(1), {
          tiempo: newData.timestamp,
          temperatura: newData.temperatura,
          humedad: newData.humedad,
          radiacion: newData.radiacion,
          humedadSuelo: newData.humedadSuelo,
          almacenamiento: newData.almacenamiento
        }];
        return newHistorical;
      });
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return { currentData, historicalData };
};

export default useMockData;