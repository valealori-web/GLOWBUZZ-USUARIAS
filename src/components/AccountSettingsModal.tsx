import React, { useState } from 'react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [pushNotifs, setPushNotifs] = useState(true);
  const [waReminders, setWaReminders] = useState(true);
  const [externalSync, setExternalSync] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configuración de la cuenta"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 border-t border-[#F1F1F1] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#8A8A8A]/30 mx-auto" />

        <div className="flex items-center justify-between pb-1 border-b border-[#F4F4F4]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#111111] text-[22px]">settings</span>
            <h3 className="text-base font-bold text-[#111111]">Configuración de Cuenta</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Notifications & Reminders */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white border border-[#E5E5E5]">
          <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
            Notificaciones &amp; Citas
          </span>

          <div className="flex items-center justify-between py-1 border-b border-[#F4F4F4]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#111111]">Alertas de turnos liberados</span>
              <span className="text-[11px] text-[#6B6B6B]">Avisos inmediatos de lista de espera</span>
            </div>
            <button
              onClick={() => {
                setPushNotifs(!pushNotifs);
                onShowToast('Preferencia actualizada');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                pushNotifs ? 'bg-[#B82E5F]' : 'bg-[#D9D9D9]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  pushNotifs ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-[#F4F4F4]">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#111111]">Recordatorios WhatsApp</span>
              <span className="text-[11px] text-[#6B6B6B]">Avisos 24 hs antes de tu visita</span>
            </div>
            <button
              onClick={() => {
                setWaReminders(!waReminders);
                onShowToast('Preferencia de WhatsApp actualizada');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                waReminders ? 'bg-[#B82E5F]' : 'bg-[#D9D9D9]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  waReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#111111]">Sincronizar con agenda externa</span>
              <span className="text-[11px] text-[#6B6B6B]">Recordar automáticamente turnos agendados</span>
            </div>
            <button
              onClick={() => {
                setExternalSync(!externalSync);
                onShowToast('Sincronización configurada');
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                externalSync ? 'bg-[#B82E5F]' : 'bg-[#D9D9D9]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  externalSync ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Account Info & Logout */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onShowToast('Cerraste sesión en GlowBuzz', 'logout');
              onClose();
            }}
            className="w-full py-2.5 rounded-full text-xs font-bold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
