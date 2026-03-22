const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:8000`

// Función helper para hacer fetch con headers
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.detail || `Error ${response.status}`;
    if (Array.isArray(errorData.detail)) {
      message = errorData.detail.map((d) => d.msg || d.message || 'Error').join(', ');
    }
    throw new Error(message);
  }
  
  return response.json();
};

export const api = {
  // ===== AUTENTICACIÓN =====
  login: async (username, password) => {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
       body: JSON.stringify({ username, password }),
    });
  
    const data = await response.json();
  
    if (!response.ok) {
      // Crear un error que tenga la estructura que Login.jsx espera
      const error = new Error(data.detail || 'Error de conexión');
      error.response = { data };
      throw error;
    }
  
    return data;
  },
  
  getCurrentUser: async () => {
    return fetchWithAuth(`${API_BASE}/api/auth/me`);
  },

  updateCurrentUser: async (userData) => {
    return fetchWithAuth(`${API_BASE}/api/auth/me`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  changePassword: async (currentPassword, newPassword) => {
    return fetchWithAuth(`${API_BASE}/api/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // ===== DATOS DE SENSORES =====
  getLatestMeasurements: async () => {
    return fetchWithAuth(`${API_BASE}/api/mediciones/waspmote/latest`);
  },

  getBatteryStatus: async () => {
    return fetchWithAuth(`${API_BASE}/api/estado-sistema/waspmote/latest`);
  },

  getHistoricalData: async (hours = 24) => {
    return fetchWithAuth(`${API_BASE}/api/mediciones/waspmote/historical?horas=${hours}`);
  },
  
  // ===== VERIFICAR SI ESTÁ AUTENTICADO =====
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ===== ADMINISTRACIÓN DE USUARIOS =====
  getUsers: async () => {
    return fetchWithAuth(`${API_BASE}/api/auth/users`);
  },
  
  createUser: async (userData) => {
    return fetchWithAuth(`${API_BASE}/api/auth/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  updateUser: async (userId, userData) => {
    return fetchWithAuth(`${API_BASE}/api/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  
  deleteUser: async (userId) => {
    return fetchWithAuth(`${API_BASE}/api/auth/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

