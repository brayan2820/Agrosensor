// src/components/Dashboard/RealTimeChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../../styles/Dashboard.css';

const RealTimeChart = ({ data }) => {
  // Formatear datos para la gráfica
  const chartData = data.map(item => ({
    tiempo: item.tiempo.toLocaleTimeString(),
    temperatura: item.temperatura,
    humedad: item.humedad,
    radiacion: item.radiacion,
    humedadSuelo: item.humedadSuelo
  }));

  // Si no hay datos, mostrar mensaje
  if (data.length === 0) {
    return (
      <div className="chart-container">
        <h2>Mediciones en Tiempo Real</h2>
        <div className="no-data-message">
          <p>No hay datos disponibles. Los datos aparecerán aquí cuando los sensores comiencen a enviar mediciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h2>Mediciones en Tiempo Real</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="tiempo" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          {/* Eje Y izquierdo para Temperatura y Humedad */}
          <YAxis 
            yAxisId="left"
            orientation="left"
            domain={[0, 50]}
            tick={{ fill: '#e0e0e0' }}
            label={{ 
              value: 'Temperatura (°C) / Humedad (%)', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#9e9e9e'
            }}
          />
          {/* Eje Y derecho para Radiación */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            domain={[0, 1200]}
            tick={{ fill: '#e0e0e0' }}
            label={{ 
              value: 'Radiación (W/m²)', 
              angle: -90, 
              position: 'insideRight',
              fill: '#9e9e9e'
            }}
          />
          <Tooltip />
          <Legend />
          
          {/* Líneas para el eje izquierdo */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="temperatura" 
            stroke="#ff6b6b" 
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
            name="Temperatura (°C)"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="humedad" 
            stroke="#4ecdc4" 
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
            name="Humedad (%)"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="humedadSuelo" 
            stroke="#6c5ce7" 
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
            name="Humedad Suelo (%)"
          />
          
          {/* Línea para el eje derecho (Radiación) */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="radiacion" 
            stroke="#ffd93d" 
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 6 }}
            name="Radiación (W/m²)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;