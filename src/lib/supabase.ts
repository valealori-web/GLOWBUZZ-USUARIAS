/**
 * Conexión con Supabase, compartida con la app de profesionales (GlowBuzz Business).
 * La clave "anon" es pública por diseño: la seguridad real la dan las políticas de la base (RLS).
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || 'https://czbidhdklnhvsfiwdhfy.supabase.co';
const SUPABASE_ANON_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmlkaGRrbG5odnNmaXdkaGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDU3MDksImV4cCI6MjEwODg4MTcwOX0.jNShiBBt5b44R7fY011d_65AjSKG0dro6xvHHvXa9_g';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Sesión propia de esta app (la de profesionales usa otra clave).
    storageKey: 'glowbuzz-usuarias-auth',
  },
});
