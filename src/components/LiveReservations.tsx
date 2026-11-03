import React, { useEffect, useState } from 'react';
import { LiveBooking } from '../types';
import { useCurrentUser } from '../context/AuthContext';
import { fetchMyBookings } from '../lib/liveData';

const STATUS: Record<LiveBooking['status'], { label: string; className: string }> = {
  pending: { label: 'Pendiente de confirmación', className: 'bg-[#FFF4D6] text-[#8A5A00]' },
  confirmed: { label: 'Confirmada', className: 'bg-[#FDE7EE] text-[#B82E5F]' },
  completed: { label: 'Completada', className: 'bg-[#F1F1F1] text-[#444444]' },
  cancelled: { label: 'Cancelada', className: 'bg-[#F1F1F1] text-[#8A8A8A]' },
};

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const formatDate = (dateKey: string): string => {
  const [, m, d] = dateKey.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
};

/** Reservas hechas en comercios conectados a GlowBuzz Business; el estado lo actualiza el comercio. */
export const LiveReservations: React.FC<{ salonNames: Record<string, string> }> = ({ salonNames }) => {
  const me = useCurrentUser();
  const [bookings, setBookings] = useState<LiveBooking[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const rows = await fetchMyBookings(me.id);
      if (rows && !cancelled) setBookings(rows);
    };
    void load();
    const interval = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [me.id]);

  if (bookings === null) return null;

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center text-center py-12 px-6">
        <span className="material-symbols-outlined text-[40px] text-[#D9D9D9] mb-2">event_available</span>
        <p className="text-sm font-bold text-[#111111]">Todavía no tenés reservas</p>
        <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs">
          Cuando reserves un turno en un comercio de GlowBuzz, lo vas a ver acá con su estado.
        </p>
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-2.5 mt-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs uppercase font-bold text-[#111111] tracking-wider">Reservas con GlowBuzz</h2>
        <span className="text-[11px] text-[#111111] font-bold">{bookings.length}</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {bookings.map((b) => (
          <div key={b.id} className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-[#111111] truncate">{b.serviceName}</span>
              <span className="text-[11px] text-[#6B6B6B] truncate">
                {salonNames[b.businessId] ?? 'Comercio GlowBuzz'} · con {b.professionalName}
              </span>
              <span className="text-xs font-semibold text-[#111111] mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#B82E5F]">schedule</span>
                {formatDate(b.date)} · {b.time} hs
              </span>
            </div>
            <span className={`shrink-0 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full text-center ${STATUS[b.status].className}`}>
              {STATUS[b.status].label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
