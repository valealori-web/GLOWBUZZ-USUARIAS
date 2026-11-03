import React, { useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '../context/AuthContext';
import { LiveService, SalonData } from '../types';
import {
  BusySlot,
  buildSlots,
  createLiveBooking,
  durationLabel,
  fetchBusySlots,
  isOpenOn,
  toDateKey,
} from '../lib/liveData';

interface LiveBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: SalonData;
  /** Nombre del servicio elegido en la pantalla anterior, si lo hay. */
  serviceName?: string;
  onBooked: (details: { salon: string; service: string; slot: string }) => void;
}

const DAY_NAMES = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Reserva directa en la agenda de un comercio conectado a GlowBuzz Business. */
export const LiveBookingModal: React.FC<LiveBookingModalProps> = ({ isOpen, onClose, salon, serviceName, onBooked }) => {
  const live = salon.live;
  const me = useCurrentUser();
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState<BusySlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ service: string; slot: string } | null>(null);

  // Cada vez que se abre, se parte de cero con el servicio que venía elegido.
  useEffect(() => {
    if (!isOpen || !live) return;
    const preselected = live.services.find((s) => s.name === serviceName);
    setServiceId(preselected?.id ?? null);
    setDateKey(null);
    setTime(null);
    setError(null);
    setDone(null);
    fetchBusySlots(live.businessId, toDateKey(new Date())).then(setBusy);
  }, [isOpen, live, serviceName]);

  const service: LiveService | undefined = live?.services.find((s) => s.id === serviceId);

  // Próximos 14 días en los que el comercio atiende.
  const days = useMemo(() => {
    if (!live) return [];
    const list: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      if (isOpenOn(live.hours, d)) list.push(d);
    }
    return list;
  }, [live]);

  const slots = useMemo(() => {
    if (!live || !service || !dateKey) return [];
    const date = days.find((d) => toDateKey(d) === dateKey);
    return date ? buildSlots(live.hours, date, service.durationMinutes, service.professionalId, busy) : [];
  }, [live, service, dateKey, days, busy]);

  if (!isOpen || !live) return null;

  const handleConfirm = async () => {
    if (!service || !dateKey || !time) return;
    setSaving(true);
    setError(null);
    const ok = await createLiveBooking({ businessId: live.businessId, service, date: dateKey, time, booker: me });
    setSaving(false);
    if (!ok) {
      setError('No pudimos enviar tu reserva. Revisá tu conexión e intentá de nuevo.');
      return;
    }
    const date = days.find((d) => toDateKey(d) === dateKey)!;
    const slot = `${DAY_NAMES[date.getDay()].toLowerCase()} ${date.getDate()} de ${MONTHS[date.getMonth()]} · ${time} hs`;
    setDone({ service: service.name, slot });
    onBooked({ salon: salon.name, service: service.name, slot });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 border-t border-[#F1F1F1] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#8A8A8A]/30 mx-auto" />

        {!done ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B82E5F] bg-[#FDE7EE] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Reserva directa con GlowBuzz
                </span>
                <h3 className="text-xl font-bold text-[#111111] tracking-tight">{salon.name}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* 1. Servicio */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">1. Servicio</span>
              <div className="flex flex-col gap-2">
                {live.services.map((s) => {
                  const selected = s.id === serviceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setServiceId(s.id);
                        setTime(null);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-colors ${
                        selected ? 'border-[#B82E5F] bg-[#FDE7EE]/60' : 'border-[#E5E5E5] bg-white hover:border-[#B82E5F]/40'
                      }`}
                    >
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111111]">{s.name}</span>
                        <span className="text-[11px] text-[#6B6B6B]">
                          {durationLabel(s.durationMinutes)} · con {s.professionalName}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-[#111111] shrink-0">$ {s.priceUYU.toLocaleString('es-UY')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Día */}
            {service && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">2. Día</span>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                  {days.map((d) => {
                    const key = toDateKey(d);
                    const selected = key === dateKey;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setDateKey(key);
                          setTime(null);
                        }}
                        className={`shrink-0 w-14 py-2 rounded-2xl border flex flex-col items-center transition-colors ${
                          selected ? 'bg-[#B82E5F] border-[#B82E5F] text-white' : 'bg-white border-[#E5E5E5] text-[#111111] hover:border-[#B82E5F]/40'
                        }`}
                      >
                        <span className="text-[10px] font-bold tracking-wider">{DAY_NAMES[d.getDay()]}</span>
                        <span className="text-base font-extrabold">{d.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Hora */}
            {service && dateKey && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">3. Hora</span>
                {slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          slot === time ? 'bg-[#B82E5F] border-[#B82E5F] text-white' : 'bg-white border-[#E5E5E5] text-[#111111] hover:border-[#B82E5F]/40'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B6B6B] p-3 rounded-xl bg-[#F1F1F1]/50">
                    No quedan horarios libres ese día. Probá con otro día.
                  </p>
                )}
              </div>
            )}

            <div className="p-3 rounded-xl bg-[#F1F1F1]/50 border border-[#F1F1F1] text-xs text-[#111111] flex items-start gap-2 leading-relaxed">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">verified_user</span>
              <p>
                Reservás como <strong>{me.name}</strong>. {salon.name} confirma tu turno y lo ves en la pestaña Reservas. Sin pago anticipado.
              </p>
            </div>

            {error && <p className="text-xs font-semibold text-red-600 text-center">{error}</p>}

            <button
              type="button"
              disabled={!service || !dateKey || !time || saving}
              onClick={handleConfirm}
              className="w-full py-3.5 px-4 rounded-full bg-[#B82E5F] hover:bg-[#A02450] text-white font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando reserva...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">event_available</span>
                  <span>Confirmar reserva</span>
                </>
              )}
            </button>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="text-xl font-bold text-[#111111]">¡Reserva enviada!</h3>
            <p className="text-xs text-[#444444] max-w-xs leading-relaxed">
              <strong>{salon.name}</strong> recibió tu pedido de <strong>{done.service}</strong> para el <strong>{done.slot}</strong>.
              Te avisamos cuando lo confirme.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2 py-3 rounded-full bg-[#FDE7EE] text-[#B82E5F] font-bold text-sm shadow-md active:scale-98 transition-transform"
            >
              Listo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
