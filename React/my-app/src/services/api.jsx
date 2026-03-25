// api.jsx - Versión 3 (Supabase Cloud)
import { supabase } from './supabaseClient';

// Mapeo de IDs a nombres para mantener compatibilidad con el Dashboard
const SENSOR_NAMES = {
  1: 'temperatura',
  2: 'humedad',
  3: 'luminosidad',
  4: 'humedad_suelo'
};

// Ya no usamos API Local para autenticación si queremos todo en la nube
// const API_URL = 'http://localhost:8000';

export const api = {
  // ===== AUTENTICACIÓN =====
  // Helper para obtener la ruta correcta de assets (logos/imágenes) en GitHub Pages
  getAssetPath: (path) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${base}${cleanPath}`;
  },

  login: async (username, password) => {
    // 1. Truco para "Usuario sin correo":
    // Si el usuario escribe "juan", nosotros enviamos "juan@sigma.com" a Supabase.
    let emailToUse = username;
    if (!username.includes('@')) {
      // Limpiamos espacios y convertimos a minúsculas para evitar errores
      emailToUse = `${username.toLowerCase().replace(/\s+/g, '')}@sigma.com`;
    }

    console.log(`☁️ Login en Nube: "${username}" -> "${emailToUse}"`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    if (error) {
      console.error("Error Login Supabase:", error);
      throw new Error("Usuario o contraseña incorrectos");
    }

    // Guardar sesión localmente para que la app sepa que estamos dentro
    localStorage.setItem('token', data.session.access_token);
    
    // Guardamos datos básicos del usuario
    const userForApp = {
      id: data.user.id,
      username: data.user.user_metadata?.username || username,
      email: data.user.email,
      rol: data.user.user_metadata?.rol || 'operador'
    };
    localStorage.setItem('user', JSON.stringify(userForApp));

    return { access_token: data.session.access_token, user: userForApp };
  },
  
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  updateCurrentUser: async (userData) => {
    const { data, error } = await supabase.auth.updateUser(userData);
    if (error) throw error;
    return data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  },
  
  loginWithGoogle: async () => {
    // Redirigir a la misma ubicación actual tras la autenticación
    const redirectUrl = window.location.origin + import.meta.env.BASE_URL;
    console.log("🔗 Redirigiendo a:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) throw error;
    return data;
  },

  // Detectar sesión activa (útil cuando vuelven de Google)
  syncSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      localStorage.setItem('token', session.access_token);
      localStorage.setItem('user', JSON.stringify(session.user));
      return session;
    }
    return null;
  },

  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // ===== DATOS DE SENSORES =====
  getLatestMeasurements: async () => {
    // Obtener la última medición de cada tipo de sensor
    // Optimizamos para la nube: Buscamos en la tabla de mediciones lo más reciente
    const latestData = {};
    
    for (const [id, name] of Object.entries(SENSOR_NAMES)) {
      const { data, error } = await supabase
        .from('mediciones')
        .select('*')
        .eq('sensor_id', parseInt(id))
        .order('created_at', { ascending: false }) // En SQL usamos created_at en vez de timestamp usualmente
        .limit(1);

      if (!error && data && data.length > 0) {
        latestData[name] = {
          valor: data[0].valor,
          timestamp: data[0].created_at, // Supabase devuelve ISO string
          calidad: data[0].calidad
        };
      } else {
        latestData[name] = null;
      }
    }

    return {
      status: "success",
      data: latestData,
      timestamp: new Date().toISOString()
    };
  },

  getBatteryStatus: async () => {
    // Simulamos respuesta para no romper el front si no implementaste tabla de batería aún
    return { status: "success", data: { bateria: 100 } };
  },

  getHistoricalData: async (hours = 24) => {
    const date = new Date();
    date.setHours(date.getHours() - hours);
    const isoDate = date.toISOString();

    const { data, error } = await supabase
      .from('mediciones')
      .select('*')
      .gte('created_at', isoDate)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Formatear para que el gráfico lo entienda
    const formattedData = data.map(m => ({
      sensor: SENSOR_NAMES[m.sensor_id],
      valor: m.valor,
      timestamp: m.created_at,
      calidad: m.calidad
    }));

    return {
      status: "success",
      data: formattedData
    };
  },
  
  // ===== VERIFICAR SI ESTÁ AUTENTICADO =====
  isAuthenticated: () => {
    // Verificación simple local
    return !!localStorage.getItem('token'); 
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Helper para headers con token
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ===== ADMINISTRACIÓN DE USUARIOS (Conectado a Python Backend) =====
  // NOTA: La gestión de usuarios admin directa requiere backend o funciones cloud.
  // Por ahora, devolvemos una lista vacía para que no se rompa el panel.
  getUsers: async () => {
    console.warn("La gestión de usuarios requiere acceso administrativo en Supabase");
    return []; 
  },
  
  createUser: async (userData) => {
    // Para crear usuarios, mejor usar el Registro público o el panel de Supabase
    throw new Error("Usa la página de Registro para crear cuentas nuevas.");
  },
  
  updateUser: async (id, userData) => {
    // Simulado
    return userData;
  },

  deleteUser: async (id) => {
    // Simulado
    return { message: "Usuario desactivado" };
  },
};
