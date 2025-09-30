// src/components/Dashboard/Dashboard.jsx
import React, { useState } from 'react';
import MetricCard from './MetricCard';
import RealTimeChart from './RealTimeChart';
import StorageLevel from './StorageLevel';
import useBackendData from '../../hooks/useBackendData';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { currentData, historicalData, loading, error } = useBackendData();
  const [selectedMetric, setSelectedMetric] = useState('temperatura');
  const [showModal, setShowModal] = useState(false);

  // Definir los valores máximos para cada métrica
  const maxValues = {
    temperatura: 50,        // Máximo 50°C
    humedad: 100,           // Máximo 100%
    radiacion: 1200,        // Máximo 1200 W/m²
    humedadSuelo: 100,      // Máximo 100%
    bateria: 100,           // Máximo 100%
  };

  // Mapear los nombres de las métricas a las claves de datos y unidades
  const metricMap = [
    { key: 'temperatura', title: 'Temperatura', unit: '°C', max: maxValues.temperatura, color: '#ff6b6b' },
    { key: 'humedad', title: 'Humedad', unit: '%', max: maxValues.humedad, color: '#4ecdc4' },
    { key: 'radiacion', title: 'Radiación', unit: 'W/m²', max: maxValues.radiacion, color: '#ffd93d' },
    { key: 'humedadSuelo', title: 'Humedad Suelo', unit: '%', max: maxValues.humedadSuelo, color: '#6c5ce7' },
    // Batería ya no se muestra como tarjeta principal
  ];

  // Filtrar los datos históricos para la métrica seleccionada
  const chartData = historicalData.map(item => ({
    tiempo: item.tiempo.toLocaleTimeString(),
    valor: item[selectedMetric],
  }));

  const selectedMetricInfo = metricMap.find(m => m.key === selectedMetric);

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;

  // Handler para click en métrica
  const handleMetricClick = (key) => {
    setSelectedMetric(key);
    if (isMobile) setShowModal(true);
  };


  // Si no hay datos, usar valores en cero para mostrar la interfaz
  const safeCurrentData = currentData || {
    temperatura: 0,
    humedad: 0,
    radiacion: 0,
    humedadSuelo: 0,
    almacenamiento: 0,
    bateria: 0,
    timestamp: new Date(),
  };
  const safeHistoricalData = historicalData && historicalData.length > 0 ? historicalData : Array(10).fill(0).map((_, i) => ({
    tiempo: new Date(Date.now() - (9 - i) * 60000).toLocaleTimeString(),
    temperatura: 0,
    humedad: 0,
    radiacion: 0,
    humedadSuelo: 0,
    almacenamiento: 0,
    bateria: 0,
    valor: 0
  }));


  return (
    <div className="dashboard dark-theme">
      <header className="dashboard-header">
        <h1>Sistema de Monitoreo</h1>
        <div className="last-update">
          Última actualización: {safeCurrentData.timestamp ? new Date(safeCurrentData.timestamp).toLocaleTimeString() : '--'}
        </div>
      </header>

      <div className="dashboard-content">
        <div className="main-content">
          <div className="metrics-grid">
            {metricMap.map(metric => (
              <MetricCard
                key={metric.key}
                title={metric.title}
                value={safeCurrentData[metric.key]}
                unit={metric.unit}
                maxValue={metric.max}
                isSelected={selectedMetric === metric.key}
                onClick={() => handleMetricClick(metric.key)}
              />
            ))}
          </div>

          {/* Escritorio: gráfica visible. Móvil: oculta, se muestra en modal */}
          <div className="chart-responsive-wrapper">
            {!isMobile && (
              <RealTimeChart
                data={safeHistoricalData.map(item => ({ tiempo: item.tiempo, valor: item[selectedMetric] ?? 0 }))}
                metricName={selectedMetricInfo?.title}
                unit={selectedMetricInfo?.unit}
                color={selectedMetricInfo?.color}
              />
            )}
          </div>

          {/* Modal para móviles */}
          {isMobile && showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                <RealTimeChart
                  data={safeHistoricalData.map(item => ({ tiempo: item.tiempo, valor: item[selectedMetric] ?? 0 }))}
                  metricName={selectedMetricInfo?.title}
                  unit={selectedMetricInfo?.unit}
                  color={selectedMetricInfo?.color}
                />
              </div>
            </div>
          )}
        </div>

        <aside className="sidebar">
          <StorageLevel value={safeCurrentData.almacenamiento} />
          <div className="battery-card">
            <h3>Estado de la Batería</h3>
            <div className="battery-percentage">
              <svg className="battery-icon" width="40" height="20" viewBox="0 0 40 20">
                <rect x="1" y="4" width="34" height="12" rx="3" fill="#222" stroke="#ffd93d" strokeWidth="2" />
                <rect x="36" y="8" width="3" height="4" rx="1" fill="#ffd93d" />
                <rect x="3" y="6" width={(safeCurrentData.bateria/100)*30} height="8" rx="2" fill={safeCurrentData.bateria > 50 ? '#4ecdc4' : safeCurrentData.bateria > 20 ? '#ffd93d' : '#ff6b6b'} />
              </svg>
              <span className="battery-value">{safeCurrentData.bateria?.toFixed(1) ?? '--'}%</span>
            </div>
          </div>

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