
// ---
// Este archivo define un hook de React llamado useMockData
// que generaba datos aleatorios para simular mediciones en el dashboard.
// Ya no se usa en producción, pero se deja comentado como referencia.
// ---

/*
import { useState, useEffect } from 'react';

// Función para generar un objeto con datos aleatorios simulando sensores
const generateMockData = () => {
  return {
    temperatura: Math.random() * 30 + 10,     // Temperatura entre 10 y 40°C
    humedad: Math.random() * 100,             // Humedad entre 0 y 100%
    radiacion: Math.random() * 1000 + 200,    // Radiación entre 200 y 1200 W/m²
    humedadSuelo: Math.random() * 100,        // Humedad del suelo entre 0 y 100%
    almacenamiento: Math.random() * 100,      // Almacenamiento entre 0 y 100%
    bateria: Math.random() * 100,             // Batería entre 0 y 100%
    timestamp: new Date()                     // Fecha y hora actual
  };
};

// Función para generar un arreglo de datos históricos simulados
const generateHistoricalData = () => {
  const data = [];
  const now = new Date();
  // Genera 31 datos, uno por minuto hacia atrás
  for (let i = 30; i >= 0; i--) {
    const time = new Date(now - i * 60000); // Un dato por minuto
    data.push({
      tiempo: time,
      temperatura: Math.random() * 30 + 10,
      humedad: Math.random() * 100,
      radiacion: Math.random() * 1000 + 200,
      humedadSuelo: Math.random() * 100,
      almacenamiento: Math.random() * 100,
      bateria: Math.random() * 100,
    });
  }
  return data;
};

// Hook principal que expone los datos simulados
const useMockData = () => {
  // Estado para el dato actual
  const [currentData, setCurrentData] = useState(generateMockData());
  // Estado para los datos históricos
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());

  useEffect(() => {
    // Intervalo para actualizar los datos cada 2 segundos
    const interval = setInterval(() => {
      const newData = generateMockData();
      setCurrentData(newData);
      // Actualiza el histórico desplazando y agregando el nuevo dato
      setHistoricalData(prev => {
        const newHistorical = [...prev.slice(1), {
          tiempo: newData.timestamp,
          temperatura: newData.temperatura,
          humedad: newData.humedad,
          radiacion: newData.radiacion,
          humedadSuelo: newData.humedadSuelo,
          almacenamiento: newData.almacenamiento,
          bateria: newData.bateria
        }];
        return newHistorical;
      });
    }, 2000); // Actualiza cada 2 segundos

    // Limpia el intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, []);

  // Devuelve los datos simulados
  return { currentData, historicalData };
};

export default useMockData;
*/