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
  // Helper para obtener la ruta correcta de assets (logos/imágenes) en GitHub Pages
  getAssetPath: (path) => {
    // Vite ya proporciona BASE_URL con barras al inicio y final (ej: /Agrosensor/)
    let base = import.meta.env.BASE_URL;
    
    // Asegurar que la base termine en /
    if (!base.endsWith('/')) base += '/';
    
    // Eliminar barra inicial del path para evitar dobles barras //
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

  // ===== WEB SERIAL API (Lectura de puerto desde el navegador) =====
  
  /**
   * Inicia la conexión con el puerto serial y procesa los datos
   * @param {Function} onDataReceived Callback para actualizar el UI en tiempo real
   */
  connectSerial: async (onDataReceived) => {
    if (!("serial" in navigator)) {
      throw new Error("Tu navegador no soporta la Web Serial API. Usa Chrome o Edge.");
    }

    try {
      // Solicitar permiso al usuario para acceder al puerto
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable);
      const inputStream = decoder.readable;
      const reader = inputStream.getReader();

      console.log("🔌 Puerto Serial conectado con éxito");

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        
        buffer += value;
        
        // Procesar líneas completas
        if (buffer.includes('\n')) {
          const lines = buffer.split('\n');
          buffer = lines.pop(); // Mantener el fragmento incompleto
          
          for (const line of lines) {
            const cleanLine = line.trim();
            if (cleanLine) {
              const data = api.parseWaspmoteData(cleanLine);
              if (data) {
                console.log("📡 Datos procesados:", data);
                await api.syncMedicionesToCloud(data);
                if (onDataReceived) onDataReceived(data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Error en Serial:", error);
      throw error;
    }
  },

  /**
   * Parsea la cadena T:xx,H:xx... y calcula porcentajes
   */
  parseWaspmoteData: (rawString) => {
    const pattern = /T:\s*([\d.-]+),\s*H:\s*([\d.-]+),\s*L:\s*([\d.-]+),\s*W:\s*([\d.-]+),\s*B:\s*([\d.-]+)/;
    const match = rawString.match(pattern);

    if (match) {
      const watermark_hz = parseFloat(match[4]);
      // Lógica de conversión de Hz a Porcentaje (escala inversa)
      const hz = Math.max(50, Math.min(10000, watermark_hz));
      const humedad_suelo = 100.0 - ((hz - 50) / 99.5) * 100.0;

      return {
        temperatura: parseFloat(match[1]),
        humedad: parseFloat(match[2]),
        luminosidad: parseFloat(match[3]),
        humedad_suelo: Math.round(humedad_suelo * 10) / 10,
        bateria: parseFloat(match[5])
      };
    }
    return null;
  },

  /**
   * Sincroniza los datos directamente con Supabase (Nube)
   */
  syncMedicionesToCloud: async (sensorData) => {
    const mediciones = [
      { sensor_id: 1, valor: sensorData.temperatura, calidad: 'buena' },
      { sensor_id: 2, valor: sensorData.humedad, calidad: 'buena' },
      { sensor_id: 3, valor: sensorData.luminosidad, calidad: 'buena' },
      { sensor_id: 4, valor: sensorData.humedad_suelo, calidad: 'buena' }
    ];

    const { error } = await supabase.from('mediciones').insert(mediciones);
    
    if (sensorData.bateria) {
      await supabase.from('estado_sistema').insert([{
        dispositivo_id: 1,
        bateria: sensorData.bateria,
        estado_conexion: true
      }]);
    }

    if (error) console.error("❌ Error sincronizando a Supabase:", error);
  }
};
