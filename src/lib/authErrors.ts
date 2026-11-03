/** Traduce los errores de Supabase Auth a mensajes claros en español. */
export const authErrorMessage = (error: { message?: string; status?: number; code?: string } | null | undefined): string => {
  const message = (error?.message ?? '').toLowerCase();
  const code = error?.code ?? '';

  if (message.includes('invalid login credentials')) return 'El email o la contraseña no son correctos.';
  if (message.includes('email not confirmed')) return 'Todavía falta confirmar tu email. Revisá tu bandeja de entrada (y el correo no deseado).';
  if (message.includes('user already registered') || code === 'user_already_exists')
    return 'Ya existe una cuenta con ese email. Probá iniciar sesión.';
  if (message.includes('password should be at least') || code === 'weak_password')
    return 'La contraseña es muy débil. Usá al menos 8 caracteres.';
  if (message.includes('rate limit') || code === 'over_email_send_rate_limit' || error?.status === 429)
    return 'Se hicieron demasiados intentos. Esperá unos minutos y probá de nuevo.';
  if (message.includes('invalid email') || message.includes('unable to validate email'))
    return 'El email no parece válido. Revisalo e intentá de nuevo.';
  if (message.includes('same password')) return 'La nueva contraseña tiene que ser distinta de la anterior.';
  if (message.includes('failed to fetch') || message.includes('network'))
    return 'No pudimos conectarnos. Revisá tu conexión a internet e intentá de nuevo.';
  return 'Algo salió mal. Intentá de nuevo en un momento.';
};
