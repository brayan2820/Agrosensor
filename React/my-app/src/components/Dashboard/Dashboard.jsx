import MainLayout from '../Layout/MainLayout.jsx';
import MetricCard from './MetricCard.jsx';
import StatusSidebar from '../Layout/StatusSidebar.jsx';
import RealTimeChart from './RealTimeChart.jsx';
import SerialConnectButton from './SerialConnectButton'; // Corregido: ya está en la misma carpeta
import useSensorData from '../../hooks/useSensorData.jsx';
import { api } from '../../services/api.jsx';
import '../../styles/index.css';

function Dashboard() {
  const { 
    sensorData, 
    batteryData, 
    historicalData, 
    timeRange,
    loading, 
    error,
    offline,
    changeTimeRange 
  } = useSensorData();

  const handleLogout = () => {
    api.logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <MainLayout onLogout={handleLogout}>
        <div className="loading-container">
          <div className="loading">Cargando datos de sensores...</div>
        </div>
      </MainLayout>
    );
  }
  
  if (error && !sensorData) {
    return (
      <MainLayout onLogout={handleLogout}>
        <div className="error-container">
          <div className="error">{error}</div>
        </div>
      </MainLayout>
    );
  }

  // EXTRAER VALORES CORRECTAMENTE (con .valor)
  const temp = sensorData?.temperatura?.valor ?? 0;
  const hum = sensorData?.humedad?.valor ?? 0;
  const lum = sensorData?.luminosidad?.valor ?? 0;
  const soil = sensorData?.humedad_suelo?.valor ?? 0;
  
  // Extraer batería
  const batteryValue = batteryData?.bateria ?? null;

  return (
    <MainLayout onLogout={handleLogout}>
      <div className="dashboard-container">
        {offline && (
          <div className="offline-banner">
            ⚡ Modo offline - Mostrando últimos datos guardados
          </div>
        )}
        
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h2>Panel de Monitoreo en Tiempo Real</h2>
            
            {/* Contenedor de acciones del header */}
            <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {/* Botón de conexión Serial incorporado */}
              <SerialConnectButton onData={(data) => console.log("Datos recibidos:", data)} />

              <div className="time-range-selector">
                <button 
                  className={timeRange === 1 ? 'active' : ''} 
                  onClick={() => changeTimeRange(1)}
                >
                  1H
                </button>
                <button 
                  className={timeRange === 24 ? 'active' : ''} 
                  onClick={() => changeTimeRange(24)}
                >
                  24H
                </button>
                <button 
                  className={timeRange === 168 ? 'active' : ''} 
                  onClick={() => changeTimeRange(168)}
                >
                  7D
                </button>
              </div>
            </div>
          </div>
          
          <div className="metrics-grid">
            <MetricCard
              title="Temperatura"
              value={temp}
              unit="°C"
              maxValue={50}
              trend="stable"
            />
            <MetricCard
              title="Humedad Ambiental"
              value={hum}
              unit="%"
              maxValue={100}
              trend="up"
            />
            <MetricCard
              title="Luminosidad"
              value={lum}
              unit="LUX"
              maxValue={1000}
              trend="down"
            />
            <MetricCard
              title="Humedad Suelo"
              value={soil}
              unit="%"
              maxValue={100}
              trend="stable"
            />
          </div>
          
          <div className="chart-section">
            <div className="chart-header">
              <h3>Historial de Mediciones</h3>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color temp"></span>
                  <span>Temperatura (°C)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color humidity"></span>
                  <span>Humedad (%)</span>
                </div>
              </div>
            </div>
            <RealTimeChart 
              historicalData={historicalData} 
              timeRange={timeRange}
              onTimeRangeChange={changeTimeRange}
            />
          </div>
        </div>
        
        <div className="dashboard-sidebar">
          <StatusSidebar batteryData={batteryValue} />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;