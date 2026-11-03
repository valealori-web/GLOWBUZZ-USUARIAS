import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authErrorMessage } from '../lib/authErrors';

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
  phone: string;
}

type AuthResult = { ok: true } | { ok: false; error: string };

interface AuthContextType {
  user: User | null;
  /** Se está leyendo la sesión guardada (al abrir la app). */
  loading: boolean;
  /** La persona llegó desde el enlace de "olvidé mi contraseña" y debe elegir una nueva. */
  recovering: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult & { needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  updateProfile: (input: { name: string; phone: string }) => Promise<AuthResult>;
}

/** Nombre y teléfono de la usuaria, guardados en su cuenta al registrarse. */
export const profileOf = (user: User): { name: string; phone: string } => {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const fallback = [meta.owner_name, meta.owner_last_name].filter(Boolean).join(' ');
  return { name: (meta.user_name || fallback || '').trim(), phone: (meta.phone || '').trim() };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'SIGNED_OUT') setRecovering(false);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback<AuthContextType['signUp']>(async (input) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          user_name: input.name.trim(),
          phone: input.phone.trim(),
        },
      },
    });
    if (error) return { ok: false, error: authErrorMessage(error) };
    // Con confirmación de email activada, un email ya registrado no devuelve error: devuelve una cuenta sin identidades.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      return { ok: false, error: authErrorMessage({ code: 'user_already_exists' }) };
    }
    return { ok: true, needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback<AuthContextType['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, error: authErrorMessage(error) } : { ok: true };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const sendPasswordReset = useCallback<AuthContextType['sendPasswordReset']>(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
    return error ? { ok: false, error: authErrorMessage(error) } : { ok: true };
  }, []);

  const updatePassword = useCallback<AuthContextType['updatePassword']>(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: authErrorMessage(error) };
    setRecovering(false);
    return { ok: true };
  }, []);

  // La ficha de la usuaria (nombre y teléfono) vive en la base para que los comercios vean con quién hablan.
  const userId = user?.id;
  useEffect(() => {
    if (!user) return;
    const { name, phone } = profileOf(user);
    if (!name) return;
    // El constructor de consultas no envía nada hasta que se lo espera.
    void Promise.resolve(supabase.from('user_profiles').upsert({ id: user.id, name, phone }));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateProfile = useCallback<AuthContextType['updateProfile']>(async ({ name, phone }) => {
    const { data, error } = await supabase.auth.updateUser({ data: { user_name: name.trim(), phone: phone.trim() } });
    if (error) return { ok: false, error: authErrorMessage(error) };
    if (data.user) {
      setUser(data.user);
      await supabase.from('user_profiles').upsert({ id: data.user.id, name: name.trim(), phone: phone.trim() });
    }
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({ user, loading, recovering, signUp, signIn, signOut, sendPasswordReset, updatePassword, updateProfile }),
    [user, loading, recovering, signUp, signIn, signOut, sendPasswordReset, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

/** Datos de la usuaria con sesión iniciada, listos para usar en reservas y en su perfil. */
export const useCurrentUser = () => {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser solo se usa con la sesión iniciada');
  const { name, phone } = profileOf(user);
  return { id: user.id, email: user.email ?? '', name: name || (user.email ?? '').split('@')[0], phone };
};
