// src/components/Dashboard/StorageLevel.jsx
import React from 'react';
import '../../styles/Dashboard.css';

const StorageLevel = ({ value }) => {
  const getStorageColor = (value) => {
    if (value < 30) return '#4caf50'; // Verde
    if (value < 70) return '#ff9800'; // Naranja
    return '#f44336'; // Rojo
  };

  const getStorageStatus = (value) => {
    if (value < 30) return 'Óptimo';
    if (value < 70) return 'Moderado';
    return 'Crítico';
  };

  // Tamaño del círculo y grosor del trazo
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = value / 100;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="storage-card">
      <h3>Nivel de Almacenamiento</h3>
      <div className="storage-content">
        <div className="circular-progress">
          <svg className="progress-ring" width={size} height={size}>
            <circle
              className="progress-ring-background"
              stroke="#333"
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size/2}
              cy={size/2}
            />
            <circle
              className="progress-ring-circle"
              stroke={getStorageColor(value)}
              strokeWidth={strokeWidth}
              fill="transparent"
              r={radius}
              cx={size/2}
              cy={size/2}
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="progress-text">
            <span className="percentage">{value.toFixed(0)}%</span>
            <span className="status">{getStorageStatus(value)}</span>
          </div>
        </div>
        <div className="storage-details">
          <div className="storage-info">
            <div className="info-item">
              <span className="label">Disponible:</span>
              <span className="value">{100 - value}%</span>
            </div>
            <div className="info-item">
              <span className="label">Estado:</span>
              <span className="value status-text" style={{color: getStorageColor(value)}}>
                {getStorageStatus(value)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageLevel;