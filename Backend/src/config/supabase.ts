import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Validar si la URL de Supabase tiene un formato válido para evitar que la aplicación falle al iniciar
let safeSupabaseUrl = env.supabaseUrl;
let safeAnonKey = env.supabaseAnonKey;

try {
  new URL(safeSupabaseUrl);
  // Si tiene corchetes de un placeholder no configurado, forzamos el fallback
  if (safeSupabaseUrl.includes('[') || safeSupabaseUrl.includes(']')) {
    throw new Error('Placeholder URL detected');
  }
} catch (e) {
  // URL e Anon Key de plantilla válidas para que no falle createClient en el arranque
  safeSupabaseUrl = 'https://placeholder-project.supabase.co';
  safeAnonKey = 'placeholder_anon_key';
}

export const supabase = createClient(safeSupabaseUrl, safeAnonKey, {
  auth: { persistSession: false },
});

