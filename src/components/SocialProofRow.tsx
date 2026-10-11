import React from 'react';
import { ActiveScreen } from '../types';

export interface MutualFollower {
  avatar: string;
  name: string;
  userId?: string;
}

interface SocialProofRowProps {
  followers: MutualFollower[];
  onNavigate: (screen: ActiveScreen) => void;
  /** "full": recuadro con avatares y frase completa. "compact": una línea para tarjetas. */
  variant?: 'full' | 'compact';
}

const firstName = (full: string) => full.split(' ')[0];

/** Frase: "Sofía Val y Camila Rossi que seguís fueron a este lugar". */
function proofText(followers: MutualFollower[], compact: boolean): React.ReactNode {
  const [a, b] = followers;
  const rest = followers.length - 2;
  const name = (f: MutualFollower) => <strong className="font-semibold">{compact ? firstName(f.name) : f.name}</strong>;
  if (compact) {
    if (followers.length === 1) return <>Fue {name(a)}</>;
    if (followers.length === 2) return <>Fueron {name(a)} y {name(b)}</>;
    return <>Fueron {name(a)}, {name(b)} y {rest} más</>;
  }
  if (followers.length === 1) return <>{name(a)}, a quien seguís, fue a este lugar</>;
  if (followers.length === 2) return <>{name(a)} y {name(b)}, a quienes seguís, fueron a este lugar</>;
  return (
    <>
      {name(a)}, {name(b)} y {rest} {rest === 1 ? 'persona más' : 'personas más'} que seguís fueron a este lugar
    </>
  );
}

/** Muestra cuáles de las personas que seguís ya fueron a este comercio. No renderiza nada si no hay ninguna. */
export const SocialProofRow: React.FC<SocialProofRowProps> = ({ followers, onNavigate, variant = 'full' }) => {
  if (followers.length === 0) return null;

  const avatars = (size: string) => (
    <div className="flex -space-x-2 shrink-0">
      {followers.slice(0, 3).map((f) => (
        <button
          key={f.name}
          type="button"
          aria-label={`Ver perfil de ${f.name}`}
          onClick={(e) => {
            e.stopPropagation();
            if (f.userId) onNavigate({ name: 'user_profile', userId: f.userId });
          }}
          className={`${size} rounded-full border-2 border-white overflow-hidden bg-[#F5DCE5]`}
        >
          <img src={f.avatar} alt="" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        {avatars('w-5 h-5')}
        <p className="text-[11px] text-[#571C31] leading-tight truncate">{proofText(followers, true)}</p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-[#FFF8F9] border border-[#F3D3DE]">
      {avatars('w-8 h-8')}
      <p className="text-xs text-[#571C31] leading-snug min-w-0">{proofText(followers, false)}</p>
    </div>
  );
};
