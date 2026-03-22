import { useState, useEffect } from 'react';
import { supabase } from '../supabase'; // Importamos el cliente directo

const useRealData = () => {
  const [currentData, setCurrentData] = useState({
    temperatura: 0,
    humedad: 0,
    radiacion: 0,
    humedadSuelo: 0,
    luminosidad: 0,
    bateria: 0,
    timestamp: new Date()
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // CONSULTA DIRECTA A SUPABASE (Tabla 'mediciones')
      // Asegúrate de que tu tabla en Supabase se llame 'mediciones'
      const { data, error } = await supabase
        .from('mediciones')
        .select('*')
        .order('fecha_registro', { ascending: false }) // O usa 'created_at' o 'timestamp' según tu tabla
        .limit(50);

      if (error) throw error;

      if (data && data.length > 0) {
        // Supabase devuelve los datos más recientes primero por el order desc
        const latestData = data[0];
        
        // Mapeamos los datos de la DB a lo que espera el Frontend
        // Ajusta los nombres de la derecha (latestData.x) según las columnas reales de tu tabla Supabase
        const newCurrentData = {
          temperatura: latestData.temperatura || 0,
          humedad: latestData.humedad || 0,
          radiacion: latestData.radiacion || 0,
          humedadSuelo: latestData.humedad_suelo || 0, // Nota: snake_case vs camelCase
          luminosidad: latestData.luminosidad || 0,
          bateria: latestData.bateria || 0,
          timestamp: new Date(latestData.fecha_registro || latestData.created_at || new Date())
        };
        
        setCurrentData(newCurrentData);

        // Datos históricos para gráficas (invertimos para que vaya de antiguo a nuevo)
        const historical = [...data].reverse().map(item => ({
          tiempo: new Date(item.fecha_registro || item.created_at),
          temperatura: item.temperatura || 0,
          humedad: item.humedad || 0,
          humedadSuelo: item.humedad_suelo || 0,
          luminosidad: item.luminosidad || 0
        }));
        
        setHistoricalData(historical);
      }
      
    } catch (err) {
      console.error('Error conectando con Supabase:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Suscripción en tiempo real a Supabase (Opcional, pero recomendado)
    const subscription = supabase
      .channel('mediciones_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mediciones' }, (payload) => {
        console.log('Nueva medición recibida:', payload.new);
        fetchData(); // Recargar datos al recibir cambio
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { currentData, historicalData, loading, error, refetch: fetchData };
};

export default useRealData;