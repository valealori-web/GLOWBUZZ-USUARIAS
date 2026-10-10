import React from 'react';
import { SALONS_DATA } from '../data/mockData';
import { HEADER_CONTAINER, HeaderLogo, NotificationBell } from '../components/HeaderParts';
import { ActiveScreen } from '../types';
import { GlowBuzzLogo } from '../components/GlowBuzzLogo';

interface ReservationsViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onShowToast: (msg: string, icon?: string) => void;
  unreadCount: number;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onNavigate,
  onOpenBooking,
  onShowToast,
  unreadCount,
}) => {
  return (
    <div className="flex flex-col w-full pb-24 bg-[#FFFFFF] min-h-screen">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <NotificationBell onNavigate={onNavigate} unreadCount={unreadCount} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full pt-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="pt-3 pb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Mis Reservas &amp; Citas</h1>
          <span className="text-xs text-[#111111] font-semibold bg-[#F1F1F1] px-2.5 py-0.5 rounded-full">
            1 próxima cita
          </span>
        </div>

        {/* Section 1: Upcoming Appointment */}
        <section className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs uppercase font-bold text-[#111111] tracking-wider">
              Próxima Cita
            </h2>
            <span className="text-[11px] text-[#111111] font-bold">En 3 días</span>
          </div>

          <div className="bg-[#571C31] text-[#FFF8F3] rounded-3xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={SALONS_DATA['maison-hair-co'].logo}
                  alt="Maison Hair Co"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">Maison Hair Co. Studio</h3>
                  <p className="text-xs text-[#F5DCE5]/85">Balayage Signature &amp; Nutrición</p>
                  <p className="text-[11px] text-[#F5DCE5] font-medium">Colorista: Sofía Navarro</p>
                </div>
              </div>
              <span className="bg-white/15 text-[#F5DCE5] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Confirmada
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 flex flex-col gap-1.5 text-xs text-[#F5DCE5]">
              <div className="flex items-center gap-2 text-white font-semibold">
                <span className="material-symbols-outlined text-[#FFC83D] text-[17px]">
                  schedule
                </span>
                <span>Martes 24 Octubre · 15:30 hs (3h 30m)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F5DCE5]/70 text-[17px]">
                  location_on
                </span>
                <span>Benito Blanco 1020, Pocitos, Montevideo</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-white/15">
              <button
                type="button"
                onClick={() =>
                  onOpenBooking({
                    salonName: 'Maison Hair Co. Studio',
                    serviceName: 'Balayage Signature',
                    slot: 'Martes 24 Octubre 15:30 hs',
                    provider: 'Fresha',
                  })
                }
                className="flex-1 py-2 px-3 rounded-full bg-white text-[#B82E5F] hover:bg-[#FDE7EE] text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">edit_calendar</span>
                <span>Modificar en agenda</span>
              </button>
            </div>
          </div>
        </section>

        {/* Section 2: Alert / Waitlist Slot */}
        <section className="flex flex-col gap-2 mt-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs uppercase font-bold text-[#111111] tracking-wider">
              Alertas de Lista de Espera
            </h2>
          </div>

          <div className="p-4 rounded-3xl bg-[#FDE7EE]/60 border border-[#F3D3DE] flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">¡Se liberó un turno para hoy!</h4>
                  <p className="text-[11px] text-[#444444]">Studio Velvet Nails · Punta Carretas</p>
                </div>
              </div>
              <span className="text-[10px] text-[#B82E5F] font-bold uppercase">Hoy 18:00 hs</span>
            </div>

            <p className="text-xs text-[#444444] leading-snug">
              Disponibilidad inmediata para <strong>Kapping Gel con Nail Art</strong>. Cancelación de última hora.
            </p>

            <button
              type="button"
              onClick={() =>
                onOpenBooking({
                  salonName: 'Studio Velvet Nails',
                  serviceName: 'Kapping Gel + Nail Art',
                  price: '$ 1.450',
                  slot: 'Hoy 18:00 hs',
                  provider: 'Timely',
                })
              }
              className="py-2.5 px-4 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <span>Aprovechar turno en agenda externa</span>
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Section 3: Past Visits */}
        <section className="flex flex-col gap-2.5 mt-5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs uppercase font-bold text-[#111111] tracking-wider">
              Historial de Visitas
            </h2>
            <span className="text-xs text-[#6B6B6B]">2 en los últimos 60 días</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-2 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">content_cut</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">Corte Bob Texturado &amp; Baño de Brillo</h4>
                  <p className="text-[11px] text-[#6B6B6B]">Maison Hair Co. · Lucas</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#111111]">$ 1.600</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F4] text-xs text-[#6B6B6B]">
              <span>12 Sep 2024 · 17:00 hs</span>
              <button
                type="button"
                onClick={() =>
                  onOpenBooking({
                    salonName: 'Maison Hair Co. Studio',
                    serviceName: 'Corte Bob Texturado',
                    price: '$ 1.600',
                    slot: 'Próxima semana',
                    provider: 'Fresha',
                  })
                }
                className="text-[#111111] font-bold hover:underline"
              >
                Volver a reservar
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-2 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">brush</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">Kapping Gel + Esmaltado Semipermanente</h4>
                  <p className="text-[11px] text-[#6B6B6B]">Studio Velvet Nails · Camila</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#111111]">$ 1.450</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F4] text-xs text-[#6B6B6B]">
              <span>28 Ago 2024 · 14:00 hs</span>
              <button
                type="button"
                onClick={() =>
                  onOpenBooking({
                    salonName: 'Studio Velvet Nails',
                    serviceName: 'Kapping Gel + Esmaltado',
                    price: '$ 1.450',
                    slot: 'Próximo viernes',
                    provider: 'Timely',
                  })
                }
                className="text-[#111111] font-bold hover:underline"
              >
                Volver a reservar
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
