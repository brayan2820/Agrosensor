// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import MetricCard from './MetricCard';
import RealTimeChart from './RealTimeChart';
import StorageLevel from './StorageLevel';
import useMockData from '../../hooks/useMockData';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { currentData, historicalData } = useMockData();

  // Definir los valores máximos para cada métrica
  const maxValues = {
    temperatura: 50,        // Máximo 50°C
    humedad: 100,           // Máximo 100%
    radiacion: 1200,        // Máximo 1200 W/m²
    humedadSuelo: 100,      // Máximo 100%
  };

  return (
    <div className="dashboard dark-theme">
      <header className="dashboard-header">
        <h1>Sistema de Monitoreo</h1>
        <div className="last-update">
          Última actualización: {currentData.timestamp.toLocaleTimeString()}
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="main-content">
          <div className="metrics-grid">
            <MetricCard 
              title="Temperatura" 
              value={currentData.temperatura} 
              unit="°C" 
              maxValue={maxValues.temperatura}
            />
            <MetricCard 
              title="Humedad" 
              value={currentData.humedad} 
              unit="%" 
              maxValue={maxValues.humedad}
            />
            <MetricCard 
              title="Radiación" 
              value={currentData.radiacion} 
              unit="W/m²" 
              maxValue={maxValues.radiacion}
            />
            <MetricCard 
              title="Humedad Suelo" 
              value={currentData.humedadSuelo} 
              unit="%" 
              maxValue={maxValues.humedadSuelo}
            />
          </div>

          <RealTimeChart data={historicalData} />
        </div>
        
        <aside className="sidebar">
          <StorageLevel value={currentData.almacenamiento} />
          
          <div className="status-card">
            <h3>Estado del Sistema</h3>
            <div className="status-list">
              <div className="status-item online">
                <span className="status-dot"></span>
                <span>Sensores: Online</span>
              </div>
              <div className="status-item online">
                <span className="status-dot"></span>
                <span>Base de datos: Conectada</span>
              </div>
              <div className="status-item online">
                <span className="status-dot"></span>
                <span>API: Respondiendo</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;