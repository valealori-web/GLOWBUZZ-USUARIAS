import { supabase } from './supabase';

export type TrackedEvent = 'reservar' | 'reservar_perfil' | 'abrir_calendario' | 'guardar_look';

/**
 * Registra un toque en un botón principal para medir el piloto.
 * Nunca interrumpe la app: si falla (sin conexión, sin sesión), se ignora.
 */
export const trackEvent = (event: TrackedEvent, details: { businessId?: string; serviceName?: string } = {}): void => {
  // El constructor de consultas no envía nada hasta que se lo espera: por eso el .then.
  void supabase
    .from('events')
    .insert({ event, business_id: details.businessId ?? null, service_name: details.serviceName ?? null })
    .then(
      () => undefined,
      () => undefined
    );
};
