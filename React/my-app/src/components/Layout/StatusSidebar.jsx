// src/components/Layout/StatusSidebar.jsx
import StorageLevel from '../Dashboard/StorageLevel.jsx';
import '../../styles/index.css';

function StatusSidebar({ batteryData }) {
  return (
    <div className="status-sidebar">
      <StorageLevel batteryData={batteryData} />
      
      <div className="status-card">
        <h3>Estado del Sistema</h3>
        <div className="status-list">
          <div className="status-item">
            <div className="status-dot"></div>
            <span>Waspmote: Conectado</span>
          </div>
          <div className="status-item">
            <div className="status-dot"></div>
            <span>API: Online</span>
          </div>
          <div className="status-item">
            <div className="status-dot"></div>
            <span>Base de datos: Activa</span>
          </div>
          <div className="status-item">
            <div className="status-dot"></div>
            <span>Sensores: Operativos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusSidebar;