// src/components/Layout/MainLayout.jsx
import { useEffect, useState } from 'react';
import Header from './Header.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import { applyTheme, getTheme } from '../../utils/theme.jsx';
import '../../styles/index.css';

function MainLayout({ children, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="main-layout">
      <NavigationSidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
      />
      
      <div className="layout-content">
        <Header 
          onLogout={onLogout} 
          onToggleSidebar={toggleSidebar}
        />
        
        <main className="main-content">
          {children}
        </main>
        
        <footer className="layout-footer">
          <div className="footer-content">
            <span>© 2025 SIGMA - Sistema de Monitoreo Ambiental</span>
            <span>Universidad Industrial de Santander</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;
