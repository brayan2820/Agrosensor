// src/components/Dashboard/MetricCard.jsx
import React from 'react';
import '../../styles/Dashboard.css';

const MetricCard = ({ title, value, unit, maxValue }) => {
  // Calcular el porcentaje para el llenado del arco
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  // Colores fijos para cada métrica
  const getColor = () => {
    switch(title) {
      case 'Temperatura': return '#ff6b6b'; // Rojo anaranjado
      case 'Humedad': return '#4ecdc4';     // Turquesa
      case 'Radiación': return '#ffd93d';   // Amarillo
      case 'Humedad Suelo': return '#6c5ce7'; // Púrpura
      default: return '#bb86fc';            // Color por defecto
    }
  };

  // Configuración del arco SVG
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="metric-card">
      <h3 className="metric-title">{title}</h3>
      <div className="gauge-container">
        <svg className="gauge" width={size} height={size / 2 + strokeWidth / 2}>
          {/* Fondo del arco */}
          <path
            className="gauge-background"
            d={`M ${strokeWidth / 2} ${size / 2} 
                A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke="#333"
            strokeWidth={strokeWidth}
          />
          {/* Arco de progreso */}
          <path
            className="gauge-progress"
            d={`M ${strokeWidth / 2} ${size / 2} 
                A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="gauge-value">
          {value.toFixed(1)}<span className="gauge-unit">{unit}</span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;