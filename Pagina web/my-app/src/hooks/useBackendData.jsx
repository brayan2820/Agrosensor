import { useState, useEffect } from 'react';

const useBackendData = () => {
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:3001/api/mediciones');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Mapear humedad_suelo a humedadSuelo
          const mapItem = (item) => ({
            ...item,
            humedadSuelo: item.humedad_suelo,
            tiempo: new Date(item.timestamp),
            timestamp: new Date(item.timestamp)
          });
          setCurrentData(mapItem(data[0]));
          setHistoricalData(data.map(mapItem));
        } else {
          setCurrentData(null);
          setHistoricalData([]);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
    // Opcional: actualizar cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { currentData, historicalData, loading, error };
};

export default useBackendData;
