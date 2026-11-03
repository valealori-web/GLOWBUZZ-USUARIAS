import React, { useState } from 'react';
import { useAuth, useCurrentUser } from '../context/AuthContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

/** Datos de la cuenta: nombre y teléfono editables, email de solo lectura y cierre de sesión. */
export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { signOut, updateProfile } = useAuth();
  const me = useCurrentUser();
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Escribí tu nombre.');
    setSaving(true);
    setError(null);
    const result = await updateProfile({ name, phone });
    setSaving(false);
    if (!result.ok) return setError(result.error);
    onShowToast('Perfil actualizado', 'check');
    onClose();
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl border border-[#E5E5E5] bg-white focus:outline-none focus:border-[#B82E5F] text-sm text-[#111111]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mi cuenta"
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
            <h3 className="text-base font-bold text-[#111111]">Mi cuenta</h3>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3" noValidate>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Nombre y apellido</span>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Teléfono / WhatsApp</span>
            <input className={inputClass} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#111111]">Email</span>
            <input className={`${inputClass} bg-[#F7F7F7] text-[#6B6B6B]`} value={me.email} readOnly />
          </label>
          {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-full bg-[#B82E5F] text-white font-bold text-sm disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void signOut()}
          className="w-full py-2.5 rounded-full text-xs font-bold text-[#BA1A1A] hover:bg-[#FFDAD6] transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};
