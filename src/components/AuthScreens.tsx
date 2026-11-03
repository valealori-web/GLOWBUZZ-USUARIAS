import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GlowBuzzLogo } from './GlowBuzzLogo';

type Mode = 'welcome' | 'login' | 'signup' | 'forgot' | 'check-email' | 'reset-sent' | 'recovery';

const MIN_PASSWORD = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#B82E5F] text-sm text-[#111111]';

const Field: React.FC<{
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}> = ({ id, label, type = 'text', value, onChange, placeholder, autoComplete }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-[#111111] mb-1.5">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
      placeholder={placeholder}
      autoComplete={autoComplete}
    />
  </div>
);

const PrimaryButton: React.FC<{ busy?: boolean; children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit' }> = ({
  busy,
  children,
  onClick,
  type = 'button',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={busy}
    className="w-full py-3.5 rounded-full bg-[#B82E5F] hover:bg-[#A02450] text-white font-bold text-sm shadow-md active:scale-98 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
  >
    {busy && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
    {children}
  </button>
);

const SecondaryButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-3.5 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-sm transition-colors"
  >
    {children}
  </button>
);

const ErrorText: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
      {message}
    </p>
  ) : null;

const LinkButton: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button type="button" onClick={onClick} className="font-bold text-[#B82E5F] hover:underline">
    {children}
  </button>
);

/** Registro, inicio de sesión y recuperación de contraseña de GlowBuzz. */
export const AuthScreens: React.FC = () => {
  const { signUp, signIn, sendPasswordReset, updatePassword, recovering } = useAuth();
  const [mode, setMode] = useState<Mode>('welcome');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const go = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword('');
    setPassword2('');
  };

  const checkEmail = (): boolean => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Escribí un email válido, por ejemplo hola@correo.com.');
      return false;
    }
    return true;
  };

  const checkNewPassword = (): boolean => {
    if (password.length < MIN_PASSWORD) {
      setError(`La contraseña tiene que tener al menos ${MIN_PASSWORD} caracteres.`);
      return false;
    }
    if (password !== password2) {
      setError('Las dos contraseñas no coinciden.');
      return false;
    }
    return true;
  };

  const run = async (action: () => Promise<{ ok: boolean; error?: string }>, onOk: () => void) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.ok) onOk();
    else setError(result.error ?? 'Algo salió mal. Intentá de nuevo.');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Completá tu nombre.');
    if (!checkEmail() || !checkNewPassword()) return;
    void run(
      async () => {
        const result = await signUp({ email, password, name, phone });
        if (result.ok && result.needsConfirmation) setMode('check-email');
        return result;
      },
      () => undefined
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail()) return;
    if (!password) return setError('Escribí tu contraseña.');
    void run(() => signIn(email, password), () => undefined);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkEmail()) return;
    void run(() => sendPasswordReset(email), () => setMode('reset-sent'));
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkNewPassword()) return;
    void run(() => updatePassword(password), () => undefined);
  };

  const view: Mode = recovering ? 'recovery' : mode;

  const heading = (title: string, subtitle?: string) => (
    <div className="mb-5">
      <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{title}</h1>
      {subtitle && <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col px-5 pt-safe font-['Inter',system-ui,sans-serif]">
      <header className="max-w-md w-full mx-auto h-16 flex items-center">
        <GlowBuzzLogo variant="header" size={30} />
      </header>

      <main className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center py-6">
        {view === 'welcome' && (
          <div className="text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[32px]">auto_awesome</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3">Encontrá y reservá tu próximo look</h1>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-8">
              Descubrí trabajos reales de profesionales de belleza cerca tuyo y reservá tu turno en segundos.
            </p>
            <div className="flex flex-col gap-3">
              <PrimaryButton onClick={() => go('signup')}>Crear cuenta</PrimaryButton>
              <SecondaryButton onClick={() => go('login')}>Iniciar sesión</SecondaryButton>
            </div>
          </div>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-4 animate-in fade-in duration-300">
            {heading('Crear cuenta', 'Con tu cuenta reservás y seguís tus turnos en un solo lugar.')}
            <Field id="name" label="Nombre y apellido" value={name} onChange={setName} placeholder="Ej. Valentina Rossi" autoComplete="name" />
            <Field id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="hola@correo.com" autoComplete="email" />
            <Field id="phone" label="Teléfono / WhatsApp" type="tel" value={phone} onChange={setPhone} placeholder="+598 99 123 456" autoComplete="tel" />
            <Field id="password" label="Contraseña" type="password" value={password} onChange={setPassword} placeholder={`Mínimo ${MIN_PASSWORD} caracteres`} autoComplete="new-password" />
            <Field id="password2" label="Repetí la contraseña" type="password" value={password2} onChange={setPassword2} autoComplete="new-password" />
            <ErrorText message={error} />
            <PrimaryButton type="submit" busy={busy}>Crear cuenta</PrimaryButton>
            <p className="text-center text-xs text-[#6B6B6B]">
              ¿Ya tenés cuenta? <LinkButton onClick={() => go('login')}>Iniciar sesión</LinkButton>
            </p>
            <button type="button" onClick={() => go('welcome')} className="text-xs font-semibold text-[#6B6B6B] self-center">
              Volver
            </button>
          </form>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4 animate-in fade-in duration-300">
            {heading('Iniciar sesión', 'Ingresá con tu email y contraseña.')}
            <Field id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="hola@correo.com" autoComplete="email" />
            <Field id="password" label="Contraseña" type="password" value={password} onChange={setPassword} autoComplete="current-password" />
            <div className="text-right -mt-2">
              <button type="button" onClick={() => go('forgot')} className="text-xs font-semibold text-[#B82E5F] hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <ErrorText message={error} />
            <PrimaryButton type="submit" busy={busy}>Iniciar sesión</PrimaryButton>
            <p className="text-center text-xs text-[#6B6B6B]">
              ¿Todavía no tenés cuenta? <LinkButton onClick={() => go('signup')}>Crear cuenta</LinkButton>
            </p>
            <button type="button" onClick={() => go('welcome')} className="text-xs font-semibold text-[#6B6B6B] self-center">
              Volver
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgot} noValidate className="flex flex-col gap-4 animate-in fade-in duration-300">
            {heading('Recuperar contraseña', 'Te enviamos un enlace por email para elegir una contraseña nueva.')}
            <Field id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="hola@correo.com" autoComplete="email" />
            <ErrorText message={error} />
            <PrimaryButton type="submit" busy={busy}>Enviar enlace</PrimaryButton>
            <button type="button" onClick={() => go('login')} className="text-xs font-semibold text-[#6B6B6B] self-center">
              Volver
            </button>
          </form>
        )}

        {(view === 'check-email' || view === 'reset-sent') && (
          <div className="text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center mx-auto mb-5">
              <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">Revisá tu email</h1>
            <p className="text-sm text-[#6B6B6B] leading-relaxed mb-8">
              {view === 'check-email'
                ? `Te enviamos un mensaje a ${email.trim()} para confirmar tu cuenta. Cuando lo confirmes, iniciá sesión.`
                : `Si ${email.trim()} tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva.`}{' '}
              Si no lo ves, mirá en el correo no deseado.
            </p>
            <PrimaryButton onClick={() => go('login')}>Ir a iniciar sesión</PrimaryButton>
          </div>
        )}

        {view === 'recovery' && (
          <form onSubmit={handleRecovery} noValidate className="flex flex-col gap-4 animate-in fade-in duration-300">
            {heading('Elegí una contraseña nueva', 'Después de guardarla entrás directo a GlowBuzz.')}
            <Field id="password" label="Contraseña nueva" type="password" value={password} onChange={setPassword} placeholder={`Mínimo ${MIN_PASSWORD} caracteres`} autoComplete="new-password" />
            <Field id="password2" label="Repetí la contraseña" type="password" value={password2} onChange={setPassword2} autoComplete="new-password" />
            <ErrorText message={error} />
            <PrimaryButton type="submit" busy={busy}>Guardar contraseña</PrimaryButton>
          </form>
        )}
      </main>
    </div>
  );
};
