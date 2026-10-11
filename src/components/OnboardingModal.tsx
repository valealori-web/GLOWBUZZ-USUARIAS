import React, { useState } from 'react';
import { GlowBuzzLogo } from './GlowBuzzLogo';
import { BEAUTY_INTERESTS_LIST } from '../data/mockData';

interface OnboardingModalProps {
  isOpen: boolean;
  initialStep?: 'auth' | 'interests';
  onClose: () => void;
  onCompleted: (selectedInterests: string[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialStep = 'auth',
  onClose,
  onCompleted,
}) => {
  const [step, setStep] = useState<'auth' | 'interests'>(initialStep);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('Valentina Rossi');
  const [email, setEmail] = useState('valen.glow@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'nails',
    'hair_color',
    'brows',
  ]);

  if (!isOpen) return null;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('interests');
  };

  const handleFinishInterests = () => {
    onCompleted(selectedInterests);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-3xl p-6 shadow-2xl flex flex-col border border-[#F1F1F1] max-h-[92vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
          aria-label="Cerrar"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {step === 'auth' ? (
          <div className="flex flex-col gap-5 pt-2">
            <div className="flex justify-center">
              <GlowBuzzLogo variant="onboarding" size={38} />
            </div>

            <div className="text-center flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-[#111111] tracking-tight">
                Bienvenida a GlowBuzz
              </h2>
              <p className="text-sm text-[#444444]">
                Descubrí y reservá inspiración real de belleza
              </p>
            </div>

            {/* Tab switch */}
            <div className="flex rounded-full bg-[#F1F1F1] p-1 gap-1">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold text-center transition-all ${
                  authMode === 'login'
                    ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                    : 'text-[#444444] hover:text-[#111111]'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 px-3 rounded-full text-xs font-semibold text-center transition-all ${
                  authMode === 'register'
                    ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                    : 'text-[#444444] hover:text-[#111111]'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#111111] font-semibold">
                    Nombre completo
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[#444444] text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#111111] font-semibold">
                  Correo electrónico
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#444444] text-[18px]">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-full bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[#111111] font-semibold">
                    Contraseña
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => alert('Te enviamos un enlace de recuperación')}
                      className="text-[11px] text-[#111111] font-semibold hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#444444] text-[18px]">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-full bg-white border border-[#D9D9D9] text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#444444] hover:text-[#111111]"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 mt-1 rounded-full bg-[#FDE7EE] text-[#B82E5F] text-sm font-bold shadow-md active:scale-98 transition-transform flex items-center justify-center gap-1.5"
              >
                <span>{authMode === 'login' ? 'Iniciar Sesión' : 'Continuar a Intereses'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-[1px] bg-[#D9D9D9]" />
              <span className="text-[10px] text-[#444444] uppercase tracking-wider">
                O bien
              </span>
              <div className="flex-1 h-[1px] bg-[#D9D9D9]" />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setStep('interests')}
                className="w-full py-2.5 px-3 rounded-full bg-white border border-[#D9D9D9] text-[#111111] text-xs font-semibold hover:bg-[#F7F7F7] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3.1l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.4C3.7 20.1 7.5 22.7 12 22.7z" />
                </svg>
                <span>Continuar con Google</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('interests')}
                className="w-full py-2.5 px-3 rounded-full bg-white border border-[#D9D9D9] text-[#111111] text-xs font-semibold hover:bg-[#F7F7F7] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.67 1.37-.56.64-1.05 1.7-0.92 2.73 1.03.08 2.06-.5 2.67-1.25z" />
                </svg>
                <span>Continuar con Apple</span>
              </button>
            </div>

            <p className="text-center text-[10px] text-[#444444] opacity-75">
              Al continuar, aceptás los Términos de Servicio y la Política de Privacidad de GlowBuzz.
            </p>
          </div>
        ) : (
          /* Step 2: Beauty Interests Selection */
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('auth')}
                className="text-xs font-semibold text-[#111111] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Volver</span>
              </button>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F1F1F1] text-[#111111] text-[11px] font-bold">
                {selectedInterests.length} seleccionados
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111] tracking-tight">
                ¿Qué inspiración querés ver?
              </h2>
              <p className="text-xs text-[#444444] mt-0.5">
                Elegí tus áreas favoritas para personalizar tu feed de trabajos reales.
              </p>
            </div>

            <div className="flex flex-col gap-2 my-1">
              {BEAUTY_INTERESTS_LIST.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#FDE7EE] border-[#B82E5F] text-[#B82E5F] shadow-xs'
                        : 'bg-white border-[#D9D9D9] text-[#111111] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#F1F1F1] text-[#111111]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold leading-tight">{item.label}</span>
                        <span
                          className={`text-[11px] ${
                            isSelected ? 'text-white/80' : 'text-[#6B6B6B]'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white text-[#111111]' : 'bg-[#F1F1F1] text-[#444444]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] font-bold">
                        {isSelected ? 'check' : 'add'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinishInterests}
              className="w-full py-3.5 px-4 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-sm shadow-md active:scale-98 transition-transform flex items-center justify-center gap-2"
            >
              <span>Explorar Feed de Looks</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
