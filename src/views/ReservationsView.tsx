import React from 'react';
import { HEADER_CONTAINER, HeaderLogo, NotificationBell } from '../components/HeaderParts';
import { ActiveScreen } from '../types';
import { LiveReservations } from '../components/LiveReservations';

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
  /** Nombre de cada comercio por id (incluye los conectados a GlowBuzz Business). */
  salonNames?: Record<string, string>;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onNavigate,
  onOpenBooking,
  onShowToast,
  unreadCount,
  salonNames = {},
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
          <h1 className="text-xl font-bold text-[#111111] tracking-tight">Mis reservas</h1>
        </div>

        {/* Reservas hechas en comercios conectados a GlowBuzz Business */}
        <LiveReservations salonNames={salonNames} />

      </main>
    </div>
  );
};
