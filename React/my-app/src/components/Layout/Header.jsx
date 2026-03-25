// src/components/Layout/Header.jsx
import { api } from '../../services/api.jsx';
import '../../styles/index.css';

function Header({ onLogout, onToggleSidebar }) {
  const user = api.getUser();
  ;

  return (
    <header className="header">
      <div className="header-left">
        {/* Hamburger menu solo para móviles */}
        <button className="hamburger-menu" onClick={onToggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className="logo">
          <div className="logo-horizontal">
            <img
              src="/logo.png"
              alt="SIGMA - Sistema de Monitoreo Ambiental"
              className="logo-icon"
            />
            <div className="logo-text">
              <h1>SIGMA</h1>
            <span>Sistema de Monitoreo Ambiental </span>
            </div>
          </div>
        </div>


      </div>

      <div className="header-center">
        <div className="system-status">
          <span className="status-indicator online"></span>
          <span>Sistema en línea</span>
        </div>
      </div>

      <div className="header-right">
        
        
        <div className="header-actions">
          {onLogout && (
            <button className="logout-button" onClick={onLogout}>
              <span className="logout-icon">⎋</span>
              Salir
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
