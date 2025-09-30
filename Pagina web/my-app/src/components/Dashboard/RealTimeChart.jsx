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

const RealTimeChart = ({ data, metricName, unit, color }) => {
  // data: [{ tiempo, valor }]
  return (
    <div className="chart-container">
      <h2>{metricName ? `Gráfica en Tiempo Real: ${metricName}` : 'Mediciones en Tiempo Real'}</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tiempo" />
          <YAxis />
          <Tooltip formatter={(value) => `${value?.toFixed?.(2) ?? value} ${unit || ''}`} />
          <Line type="monotone" dataKey="valor" stroke={color || '#bb86fc'} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RealTimeChart;