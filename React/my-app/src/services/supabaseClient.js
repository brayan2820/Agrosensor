import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Evitar que la app se rompa si faltan las variables (pantalla blanca/azul)
if (!supabaseUrl || !supabaseKey) {
  console.error("⚠️ ERROR: Faltan las credenciales de Supabase en el archivo .env o en GitHub Secrets.");
}

export const supabase = createClient(supabaseUrl || 'https://falta-url.supabase.co', supabaseKey || 'falta-key');