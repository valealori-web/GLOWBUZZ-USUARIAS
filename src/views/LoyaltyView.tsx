import React, { useState } from 'react';
import { ActiveScreen } from '../types';
import { HEADER_CONTAINER, HeaderLogo, BackButton } from '../components/HeaderParts';
import { REWARDS, EARN_RULES, INITIAL_HISTORY, PointsTransaction } from '../data/loyaltyData';

interface LoyaltyViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onBack: () => void;
  onShowToast: (msg: string, icon?: string) => void;
}

type Tab = 'canjear' | 'ganar' | 'historial';

const fmt = (n: number) => n.toLocaleString('es-UY');

const StarIcon: React.FC<{ size: number; className?: string }> = ({ size, className = '' }) => (
  <span
    className={`material-symbols-outlined text-[#FFC83D] shrink-0 ${className}`}
    style={{ fontSize: size, lineHeight: 1, fontVariationSettings: "'FILL' 1" }}
    aria-hidden="true"
  >
    star
  </span>
);

export const LoyaltyView: React.FC<LoyaltyViewProps> = ({ onNavigate, onBack, onShowToast }) => {
  const [tab, setTab] = useState<Tab>('canjear');
  const [points, setPoints] = useState(1240);
  const [history, setHistory] = useState<PointsTransaction[]>(INITIAL_HISTORY);
  const [myRewards, setMyRewards] = useState<{ id: string; rewardId: string; code: string }[]>([]);
  const [invited, setInvited] = useState(1);

  const sortedRewards = [...REWARDS].sort((a, b) => a.cost - b.cost);
  const nextReward = sortedRewards.find((r) => r.cost > points);
  const earned = history.filter((h) => h.points > 0).reduce((sum, h) => sum + h.points, 0);

  const redeem = (rewardId: string) => {
    const reward = REWARDS.find((r) => r.id === rewardId);
    if (!reward || points < reward.cost) return;
    const code = `GB${Math.floor(1000 + Math.random() * 9000)}`;
    setPoints((p) => p - reward.cost);
    setMyRewards((prev) => [{ id: `${rewardId}-${Date.now()}`, rewardId, code }, ...prev]);
    setHistory((h) => [
      { id: `t-${Date.now()}`, label: `Canje: ${reward.title}`, points: -reward.cost, date: 'Hoy' },
      ...h,
    ]);
    onShowToast(`Canjeaste "${reward.title}"`, 'redeem');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'canjear', label: 'Canjear' },
    { id: 'ganar', label: 'Ganar puntos' },
    { id: 'historial', label: 'Historial' },
  ];

  return (
    <div className="flex flex-col w-full pb-28 bg-white min-h-screen">
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <BackButton onBack={onBack} />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pt-16 max-w-3xl mx-auto px-5">
        {/* Título + selector (mismo patrón que las estadísticas de profesionales) */}
        <div className="pt-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#181416]">Puntos Glow</h1>
            <p className="text-sm text-[#571C31]/75 mt-0.5">
              Sumá puntos con cada turno y usalos en tus próximos servicios.
            </p>
          </div>

          <div
            className="inline-flex items-center p-1 rounded-xl bg-white border border-[#571C31]/15 self-start"
            role="tablist"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === t.id ? 'bg-[#B82E5F] text-white shadow-xs' : 'text-[#571C31]/70 hover:text-[#571C31]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bloque destacado */}
        <section className="mt-6 p-6 sm:p-8 rounded-3xl bg-[#571C31] text-[#FFF8F3] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <span className="absolute -top-20 -right-12 w-56 h-56 rounded-full bg-white/5" aria-hidden="true" />
          <span className="absolute -bottom-24 -left-10 w-48 h-48 rounded-full bg-[#B82E5F]/20" aria-hidden="true" />

          <div className="relative">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#F5DCE5]/80">
              Tu saldo de puntos
            </span>
            <div className="mt-3 flex items-center gap-3">
              <StarIcon size={56} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" />
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none">{fmt(points)}</span>
            </div>
            <p className="text-xs sm:text-sm text-[#F5DCE5]/80 mt-3 max-w-xs">
              Ganás 1 punto por cada $10 en tus turnos reservados con GlowBuzz.
            </p>
          </div>

          <div className="relative flex sm:flex-col gap-3">
            <div className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-xs text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5DCE5] block">Acumulados</span>
              <span className="text-2xl font-bold text-white block mt-0.5">{fmt(earned)}</span>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-white/10 backdrop-blur-xs text-center min-w-[120px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#F5DCE5] block">Canjes</span>
              <span className="text-2xl font-bold text-white block mt-0.5">
                {history.filter((h) => h.points < 0).length}
              </span>
            </div>
          </div>
        </section>

        {/* CANJEAR */}
        {tab === 'canjear' && (
          <div className="mt-8 space-y-8 animate-in fade-in duration-200">
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <h2 className="text-lg font-bold text-[#181416]">Camino a tu próxima recompensa</h2>
                {nextReward && (
                  <span className="text-xs text-[#571C31]/70 text-right">
                    Te faltan {fmt(nextReward.cost - points)} puntos
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sortedRewards.map((r) => {
                  const missing = r.cost - points;
                  const isNext = nextReward?.id === r.id;
                  const ready = missing <= 0;
                  return (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl flex flex-col justify-between border ${
                        isNext ? 'bg-[#F5DCE5] border-[#B82E5F]/30' : 'bg-[#FFF8F9] border-[#571C31]/10'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              isNext ? 'text-[#B82E5F]' : 'text-[#571C31]/60'
                            }`}
                          >
                            {isNext ? 'Tu próxima meta' : ready ? 'Disponible' : 'Recompensa'}
                          </span>
                          <span className="w-8 h-8 rounded-xl bg-white text-[#B82E5F] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-2xl font-extrabold text-[#181416]">
                          <StarIcon size={22} />
                          {fmt(r.cost)}
                        </p>
                        <p className="text-sm font-semibold text-[#181416] mt-1 leading-snug">{r.title}</p>
                        <p className="text-xs text-[#571C31]/75 mt-0.5">{r.description}</p>
                      </div>

                      <div
                        className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                          isNext ? 'border-[#B82E5F]/20' : 'border-[#571C31]/10'
                        }`}
                      >
                        <span className="text-[11px] font-bold text-[#B82E5F]">
                          {ready ? '✓ Podés canjearla' : `Faltan ${fmt(missing)}`}
                        </span>
                        <button
                          type="button"
                          disabled={!ready}
                          onClick={() => redeem(r.id)}
                          className="h-8 px-4 rounded-lg bg-white text-[#B82E5F] text-xs font-bold hover:bg-[#FDE7EE] transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-[#B82E5F]/20"
                        >
                          Canjear
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {myRewards.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#571C31]">Mis recompensas</h2>
                {myRewards.map((mr) => {
                  const reward = REWARDS.find((r) => r.id === mr.rewardId)!;
                  return (
                    <div
                      key={mr.id}
                      className="p-4 rounded-2xl bg-white border border-dashed border-[#B82E5F]/50 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#181416]">{reward.title}</p>
                        <p className="text-xs text-[#571C31]/70 mt-0.5">Mostrá este código en el salón</p>
                      </div>
                      <span className="px-3 py-1.5 rounded-lg bg-[#F5DCE5] text-[#B82E5F] text-sm font-extrabold tracking-widest">
                        {mr.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* GANAR */}
        {tab === 'ganar' && (
          <div className="mt-8 space-y-8 animate-in fade-in duration-200">
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#571C31]">Cómo sumar puntos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EARN_RULES.map((r) => (
                  <div
                    key={r.label}
                    className="bg-white rounded-2xl border border-[#571C31]/10 p-5 hover:border-[#B82E5F]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <span className="text-xs font-semibold text-[#571C31]/70 uppercase tracking-wider">
                        {r.label}
                      </span>
                      <span className="w-8 h-8 rounded-xl bg-[#FFF8F9] text-[#B82E5F] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                      </span>
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-[#181416]">{r.points}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFF8F9] border border-[#B82E5F]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="p-2.5 rounded-xl bg-[#F5DCE5] text-[#B82E5F] flex">
                  <span className="material-symbols-outlined text-[22px]">group_add</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#181416]">Invitá a 3 amigas y ganá 500 puntos</h3>
                  <p className="text-xs sm:text-sm text-[#571C31]/75 mt-0.5">{invited} de 3 completadas</p>
                  <div className="mt-2 flex gap-1.5 w-40">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i < invited ? 'bg-[#B82E5F]' : 'bg-[#F5DCE5]'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (invited < 3) setInvited((n) => n + 1);
                  onShowToast('Link de invitación copiado', 'link');
                }}
                className="h-10 px-5 rounded-xl bg-[#B82E5F] text-white text-sm font-semibold hover:bg-[#A02450] transition-colors shrink-0"
              >
                Invitar
              </button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <div className="mt-8 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#571C31]">Movimientos</h2>
            <div className="mt-3 bg-white rounded-2xl border border-[#571C31]/10 divide-y divide-[#571C31]/10">
              {history.map((h) => (
                <div key={h.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#181416] truncate">{h.label}</p>
                    <p className="text-xs text-[#571C31]/60">{h.date}</p>
                  </div>
                  <span
                    className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                      h.points > 0 ? 'bg-[#F5DCE5] text-[#B82E5F]' : 'bg-[#F1F1F1] text-[#571C31]/70'
                    }`}
                  >
                    {h.points > 0 ? '+' : ''}
                    {fmt(h.points)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
