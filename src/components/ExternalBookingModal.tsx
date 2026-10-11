import React, { useState } from 'react';

interface ExternalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonName: string;
  serviceName?: string;
  stylistName?: string;
  price?: string;
  slot?: string;
  provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  onBookingConfirmed?: (details: { salon: string; service: string; slot: string }) => void;
}

export const ExternalBookingModal: React.FC<ExternalBookingModalProps> = ({
  isOpen,
  onClose,
  salonName,
  serviceName = 'Servicio general',
  stylistName,
  price,
  slot = 'Próximo turno disponible',
  provider = 'Fresha',
  onBookingConfirmed,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleExternalHandover = (channel: string) => {
    setIsRedirecting(true);
    setTimeout(() => {
      setIsRedirecting(false);
      setCompleted(true);
      if (onBookingConfirmed) {
        onBookingConfirmed({
          salon: salonName,
          service: serviceName,
          slot,
        });
      }
    }, 1200);
  };

  const handleFinish = () => {
    setCompleted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl p-5 shadow-2xl flex flex-col gap-4 border-t border-[#F1F1F1] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-[#8A8A8A]/30 mx-auto" />

        {!completed ? (
          <>
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#111111] bg-[#F1F1F1] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Derivación a Agenda Externa
                </span>
                <h3 className="text-xl font-bold text-[#111111] tracking-tight">
                  {salonName}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Selected Service Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs text-[#6B6B6B]">Tratamiento seleccionado:</span>
                  <span className="text-base font-semibold text-[#111111]">{serviceName}</span>
                  {stylistName && (
                    <span className="text-xs text-[#111111] font-medium mt-0.5">
                      Profesional: {stylistName}
                    </span>
                  )}
                </div>
                {price && (
                  <span className="text-base font-bold text-[#111111]">{price}</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-[#F4F4F4] text-xs text-[#444444]">
                <span className="material-symbols-outlined text-[16px] text-[#111111]">
                  schedule
                </span>
                <span>Horario previsto: <strong className="text-[#111111]">{slot}</strong></span>
              </div>
            </div>

            {/* Explanatory Trust Strip */}
            <div className="p-3 rounded-xl bg-[#F1F1F1]/50 border border-[#F1F1F1] text-xs text-[#111111] flex items-start gap-2 leading-relaxed">
              <span className="material-symbols-outlined text-[18px] text-[#111111] shrink-0 mt-0.5">
                verified_user
              </span>
              <div>
                <p className="font-semibold">Reserva directa con el comercio</p>
                <p className="text-[11px] opacity-90 mt-0.5">
                  GlowBuzz no cobra comisiones ni adelantos. Te derivamos a la agenda oficial ({provider}) para que confirmes tu turno en tiempo real.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                disabled={isRedirecting}
                onClick={() => handleExternalHandover('provider')}
                className="w-full py-3.5 px-4 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Conectando con agenda externa...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                    <span>Abrir agenda oficial ({provider})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleExternalHandover('whatsapp')}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F4F4F4] text-[#111111] border border-[#D9D9D9] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-600">chat</span>
                <span>Consultar por WhatsApp del salón</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-[#6B6B6B]">
              Cancelación gratuita hasta 24 hs previas · Sin pago anticipado
            </p>
          </>
        ) : (
          /* Handover Success Confirmation */
          <div className="py-6 flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[32px]">check</span>
            </div>
            <h3 className="text-xl font-bold text-[#111111]">
              ¡Derivación iniciada con éxito!
            </h3>
            <p className="text-xs text-[#444444] max-w-xs leading-relaxed">
              Te hemos conectado con la agenda de <strong>{salonName}</strong> para el turno de <strong>{slot}</strong>.
            </p>
            <div className="p-3 bg-white rounded-xl border border-[#E5E5E5] w-full text-xs text-left text-[#6B6B6B]">
              <p className="font-semibold text-[#111111] mb-1">Registro de actividad guardado</p>
              <p>Podrás consultar este recordatorio en la pestaña <strong>Reservas</strong> de GlowBuzz.</p>
            </div>
            <button
              onClick={handleFinish}
              className="w-full mt-2 py-3 rounded-full bg-[#FDE7EE] text-[#B82E5F] font-bold text-sm shadow-md active:scale-98 transition-transform"
            >
              Continuar navegando looks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
