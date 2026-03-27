import { useState } from 'react';
import { api } from '../../services/api.jsx';

function SerialConnectButton({ onData }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      await api.connectSerial((data) => {
        setConnected(true);
        if (onData) onData(data);
      });
    } catch (err) {
      console.error("Error serial:", err);
      setError(err.message || "Error al conectar el puerto");
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="serial-connect-container" style={{ margin: '10px 0' }}>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="login-button" 
        style={{
          background: connected 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0.8rem 1.2rem',
          fontSize: '0.9rem'
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>
          {connecting ? '⌛' : connected ? '✅' : '🔌'}
        </span>
        {connecting 
          ? 'Buscando dispositivo...' 
          : connected 
            ? 'Zigbee Sincronizado' 
            : 'Sincronizar Puerto Serial'}
      </button>
      
      {error && (
        <p style={{ 
          color: '#ef4444', 
          fontSize: '0.8rem', 
          marginTop: '5px' 
        }}>{error}</p>
      )}
    </div>
  );
}

export default SerialConnectButton;