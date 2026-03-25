// api.jsx - Versión 3 (Supabase Cloud)
import { supabase } from './supabaseClient';

// Mapeo de IDs a nombres para mantener compatibilidad con el Dashboard
const SENSOR_NAMES = {
  1: 'temperatura',
  2: 'humedad',
  3: 'luminosidad',
  4: 'humedad_suelo'
};

export const api = {
  // ===== AUTENTICACIÓN =====
  login: async (username, password) => {
    // Determinar si es un email real o un nombre de usuario
    let emailToUse = username;

    // Si NO tiene arroba (@), asumimos que es un nombre de usuario
    // y reconstruimos el email falso que se generó en el Registro.
    if (!username.includes('@')) {
      emailToUse = `${username.toLowerCase().replace(/\s+/g, '')}@sigma.com`;
    }
    
    console.log(`🔍 Intento de Login: "${username}" convertido a email -> "${emailToUse}"`);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    if (error) {
      const err = new Error(error.message);
      err.response = { data: { detail: error.message } };
      throw err;
    }

    // Guardar sesión compatible con lógica anterior
    localStorage.setItem('token', data.session.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { access_token: data.session.access_token, user: data.user };
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
    // Hacemos 4 consultas rápidas (una por sensor) para obtener lo último
    const latestData = {};
    
    for (const [id, name] of Object.entries(SENSOR_NAMES)) {
      const { data, error } = await supabase
        .from('mediciones')
        .select('*')
        .eq('sensor_id', id)
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
    // Verificación simple local, idealmente verificar con supabase.auth.getSession()
    return !!localStorage.getItem('token'); 
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ===== ADMINISTRACIÓN DE USUARIOS (Opcional/Simplificado) =====
  // Supabase maneja usuarios en su panel, estas funciones son wrappers simples
  getUsers: async () => {
    return []; // No implementado en cliente público por seguridad
  },
  
  createUser: async (userData) => {
    // Solo admins pueden crear usuarios via API admin, o usar signUp público
    return supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });
  },
  
  updateUser: async () => {},
  deleteUser: async () => {},
};
