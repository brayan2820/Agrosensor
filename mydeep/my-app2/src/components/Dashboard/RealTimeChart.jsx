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

  return (
    <div className="chart-container">
      <h2>Mediciones en Tiempo Real</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tiempo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperatura" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="humedad" stroke="#82ca9d" />
          <Line type="monotone" dataKey="radiacion" stroke="#ffc658" />
          <Line type="monotone" dataKey="humedadSuelo" stroke="#ff8042" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;