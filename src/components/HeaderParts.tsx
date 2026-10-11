import React from 'react';
import { ActiveScreen } from '../types';
import { GlowBuzzLogo } from './GlowBuzzLogo';

/** Clases del contenedor del encabezado: idénticas en todas las pantallas. */
export const HEADER_CONTAINER = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4';

/** Logo único para toda la app: mismo tamaño, misma posición y siempre lleva al inicio. */
export const HeaderLogo: React.FC<{ onNavigate: (screen: ActiveScreen) => void }> = ({ onNavigate }) => (
  <button
    type="button"
    onClick={() => onNavigate({ name: 'feed' })}
    aria-label="Ir al inicio"
    className="shrink-0 flex items-center rounded-lg active:opacity-70 transition-opacity"
  >
    <GlowBuzzLogo variant="header" size={30} />
  </button>
);

export const BackButton: React.FC<{ onBack?: () => void }> = ({ onBack }) =>
  onBack ? (
    <button
      type="button"
      onClick={onBack}
      aria-label="Volver"
      className="w-10 h-10 flex items-center justify-center rounded-full text-[#B82E5F] bg-[#FDE7EE] hover:bg-[#FBD5E2] transition-colors"
    >
      <span className="material-symbols-outlined text-[22px]">arrow_back</span>
    </button>
  ) : null;

export const NotificationBell: React.FC<{
  onNavigate: (screen: ActiveScreen) => void;
  unreadCount: number;
}> = ({ onNavigate, unreadCount }) => (
  <button
    type="button"
    onClick={() => onNavigate({ name: 'notifications' })}
    aria-label="Notificaciones"
    className="relative w-10 h-10 flex items-center justify-center rounded-full text-[#B82E5F] bg-[#FDE7EE] hover:bg-[#FBD5E2] transition-colors"
  >
    <span className="material-symbols-outlined text-[24px]">notifications</span>
    {unreadCount > 0 && (
      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#111111] ring-2 ring-white" />
    )}
  </button>
);

export const HeaderIconButton: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
  filled?: boolean;
}> = ({ icon, label, onClick, filled }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-full text-[#B82E5F] bg-[#FDE7EE] hover:bg-[#FBD5E2] transition-colors"
  >
    <span
      className="material-symbols-outlined text-[24px]"
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {icon}
    </span>
  </button>
);
