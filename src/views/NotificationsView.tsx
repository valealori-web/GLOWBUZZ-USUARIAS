import React, { useState } from 'react';
import { HEADER_CONTAINER, HeaderLogo, BackButton } from '../components/HeaderParts';
import { NotificationItem, ActiveScreen } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onDismissNotification?: (id: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onBack: () => void;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onDismissNotification,
  onNavigate,
  onBack,
  onOpenBooking,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<'todas' | 'turnos' | 'espera' | 'inspiracion'>('todas');
  const [ignoredIds, setIgnoredIds] = useState<string[]>([]);
  const [isMarkedDone, setIsMarkedDone] = useState(false);

  const handleMarkRead = () => {
    setIsMarkedDone(true);
    onMarkAllAsRead();
    onShowToast('Todas las alertas marcadas como leídas', 'done_all');
  };

  const handleIgnore = (id: string) => {
    setIgnoredIds((prev) => [...prev, id]);
    if (onDismissNotification) {
      onDismissNotification(id);
    }
    onShowToast('Alerta descartada permanentemente');
  };

  const unreadCount = isMarkedDone ? 0 : notifications.filter((n) => n.unread && !ignoredIds.includes(n.id)).length;

  const visibleNotifications = notifications
    .filter((n) => !ignoredIds.includes(n.id))
    .filter((n) => {
      if (filter === 'todas') return true;
      if (filter === 'turnos') return n.category === 'turnos';
      if (filter === 'espera') return n.category === 'espera';
      if (filter === 'inspiracion') return n.category === 'inspiracion';
      return true;
    });

  const hoyItems = visibleNotifications.filter((n) => n.section === 'hoy');
  const estaSemanaItems = visibleNotifications.filter((n) => n.section === 'esta_semana');
  const anterioresItems = visibleNotifications.filter((n) => n.section === 'anteriores');

  return (
    <div className="flex flex-col w-full pb-24 bg-[#FFFFFF] min-h-screen">
      {/* Fixed Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <BackButton onBack={onBack} />
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col w-full pt-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-[#111111] pt-5">Notificaciones</h1>
        {unreadCount > 0 && (
          <div className="flex items-center justify-between pt-3 pb-1">
            <span className="text-xs text-[#6B6B6B]">{unreadCount} sin leer</span>
            <button
              type="button"
              onClick={handleMarkRead}
              className="text-xs font-semibold text-[#111111] hover:underline"
            >
              Marcar todo leído
            </button>
          </div>
        )}

        {/* Horizontal Filter Pills */}
        <nav
          aria-label="Filtros de actividad"
          className="flex items-center gap-2 overflow-x-auto py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 no-scrollbar"
        >
          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'todas'
                ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                : 'bg-[#F1F1F1] text-[#444444] hover:bg-[#F1F1F1]'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setFilter('turnos')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'turnos'
                ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                : 'bg-[#F1F1F1] text-[#444444] hover:bg-[#F1F1F1]'
            }`}
          >
            Turnos &amp; Citas
          </button>
          <button
            type="button"
            onClick={() => setFilter('espera')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
              filter === 'espera'
                ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                : 'bg-[#F1F1F1] text-[#444444] hover:bg-[#F1F1F1]'
            }`}
          >
            <span>Lista de Espera</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('inspiracion')}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === 'inspiracion'
                ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                : 'bg-[#F1F1F1] text-[#444444] hover:bg-[#F1F1F1]'
            }`}
          >
            Inspiración
          </button>
        </nav>

        {/* Notifications Feed */}
        <div className="flex flex-col gap-5 mt-2">
          {/* SECCIÓN: HOY */}
          {hoyItems.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-[#111111] tracking-tight">Hoy</h2>
              </div>

              {hoyItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E5E5] transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon platter */}
                    <div
                      className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center relative ${
                        item.category === 'espera'
                          ? 'bg-[#FFDAD6] text-[#BA1A1A]'
                          : 'bg-[#F1F1F1] text-[#111111]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {item.category === 'espera' ? 'bolt' : 'event_upcoming'}
                      </span>
                      {item.unread && !isMarkedDone && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#BA1A1A] rounded-full ring-2 ring-white animate-pulse" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-bold ${item.tag.includes('GlowBuzz') ? 'normal-case' : 'uppercase'} tracking-wider px-2 py-0.5 rounded-full ${
                            item.category === 'espera'
                              ? 'bg-[#FDE7EE] text-[#B82E5F]'
                              : 'bg-[#E5E5E5] text-[#111111]'
                          }`}
                        >
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{item.timeAgo}</span>
                      </div>

                      <p className="text-sm font-bold text-[#111111]">{item.title}</p>
                      <p className="text-xs text-[#444444] mt-0.5 leading-snug">
                        {item.body}
                      </p>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-2">
                        {item.category === 'espera' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                onOpenBooking({
                                  salonName: 'Studio Velvet Nails',
                                  serviceName: 'Kapping Gel (Turno liberado)',
                                  price: '$ 1.450',
                                  slot: 'Hoy 18:00 hs',
                                  provider: 'Timely',
                                });
                              }}
                              className="px-3.5 py-1.5 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] text-xs font-bold shadow-xs active:scale-95 transition-transform flex items-center gap-1"
                            >
                              <span>Aprovechar turno</span>
                              <span className="material-symbols-outlined text-[15px]">
                                arrow_forward
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleIgnore(item.id)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#6B6B6B] hover:text-[#111111]"
                            >
                              Ignorar
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center justify-between w-full pt-1">
                            <button
                              type="button"
                              onClick={() =>
                                onNavigate({
                                  name: 'look_detail',
                                  lookId: 'look-balayage-vainilla',
                                })
                              }
                              className="px-3 py-1.5 rounded-full bg-[#F1F1F1] hover:bg-[#F1F1F1] text-[#111111] text-xs font-bold transition-colors flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">info</span>
                              <span>Ver detalles</span>
                            </button>
                            <span className="text-[11px] text-[#6B6B6B] flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">
                                location_on
                              </span>
                              <span>Pocitos</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* SECCIÓN: ESTA SEMANA */}
          {estaSemanaItems.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-[#111111] tracking-tight">Esta semana</h2>
                <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">
                  Comunidad
                </span>
              </div>

              {estaSemanaItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E5E5] transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar or Icon */}
                    {item.thumbnail ? (
                      <div className="relative shrink-0 w-11 h-11 rounded-full overflow-hidden border border-[#F1F1F1]">
                        <img
                          src={item.thumbnail}
                          alt="Salón avatar"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#FDE7EE] text-[#B82E5F] rounded-full flex items-center justify-center text-[8px]">
                          ✓
                        </span>
                      </div>
                    ) : (
                      <div className="shrink-0 w-11 h-11 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          hotel_class
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold ${item.tag.includes('GlowBuzz') ? 'normal-case' : 'uppercase'} tracking-wider px-2 py-0.5 rounded-full bg-[#F1F1F1] text-[#111111]`}>
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{item.timeAgo}</span>
                      </div>

                      <p className="text-sm font-bold text-[#111111]">{item.title}</p>
                      <p className="text-xs text-[#444444] mt-0.5 leading-snug">
                        {item.body}
                      </p>

                      {/* Photo Reel if present */}
                      {item.photoReel && (
                        <div
                          className="grid grid-cols-2 gap-2 mt-2.5 rounded-xl overflow-hidden cursor-pointer"
                          onClick={() =>
                            onNavigate({ name: 'salon_profile', salonId: 'brow-bar-atelier' })
                          }
                        >
                          {item.photoReel.map((pr, idx) => (
                            <div key={idx} className="relative h-20 bg-[#F1F1F1]">
                              <img
                                src={pr.image}
                                alt={pr.label}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold">
                                {pr.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Points badge if present */}
                      {item.pointsBadge && (
                        <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-[#F4F4F4]">
                          <span className="text-xs text-[#444444] font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">stars</span>
                            <span>{item.pointsBadge}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => onShowToast('¡Puntos aplicados a tu perfil!', 'stars')}
                            className="text-xs text-[#111111] font-bold hover:underline"
                          >
                            Canjear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* SECCIÓN: ANTERIORES */}
          {anterioresItems.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-[#111111] tracking-tight">Anteriores</h2>
                <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider font-bold">
                  Descubrimientos
                </span>
              </div>

              {anterioresItems.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E5E5] transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-11 h-11 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-bold ${item.tag.includes('GlowBuzz') ? 'normal-case' : 'uppercase'} tracking-wider px-2 py-0.5 rounded-full bg-[#F1F1F1] text-[#444444]`}>
                          {item.tag}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{item.timeAgo}</span>
                      </div>

                      <p className="text-sm font-bold text-[#111111]">{item.title}</p>
                      <p className="text-xs text-[#444444] mt-0.5 leading-snug">
                        {item.body}
                      </p>

                      {/* Mini Salon Snippet Pill */}
                      <div className="mt-2.5 p-2 rounded-xl bg-[#F7F7F7] flex items-center justify-between gap-2 border border-[#F4F4F4]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-[#E5E5E5] flex items-center justify-center text-[#111111] text-[10px] font-bold">
                            1
                          </span>
                          <span className="text-xs text-[#111111] font-semibold truncate">
                            Studio Velvet Nails (4.9 ★)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            onNavigate({
                              name: 'look_detail',
                              lookId: 'look-kapping-cherry',
                            })
                          }
                          className="px-2.5 py-1 rounded-full bg-white text-[#111111] text-xs font-bold shadow-xs hover:bg-[#F1F1F1] transition-colors shrink-0"
                        >
                          Explorar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}

          {/* Empty state when no notifications */}
          {visibleNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-14 h-14 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[28px]">notifications_paused</span>
              </div>
              <p className="text-base font-bold text-[#111111]">Sin novedades por aquí</p>
              <p className="text-xs text-[#6B6B6B] mt-1 max-w-[240px]">
                Estás al día con esta categoría. Te avisaremos en cuanto haya nueva actividad.
              </p>
            </div>
          )}

          {/* Friendly Footer Touch */}
          <div className="flex items-center justify-center gap-1.5 py-6 opacity-60">
            <span className="material-symbols-outlined text-[16px] text-[#6B6B6B]">spa</span>
            <span className="text-xs text-[#6B6B6B]">Fin de las novedades recientes</span>
          </div>
        </div>
      </main>
    </div>
  );
};
