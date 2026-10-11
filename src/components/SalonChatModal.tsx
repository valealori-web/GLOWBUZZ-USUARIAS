import React, { useState } from 'react';
import { Salon } from '../types';

interface SalonChatModalProps {
  isOpen: boolean;
  salon: Salon;
  onClose: () => void;
  onOpenBooking: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'salon' | 'user';
  text: string;
  time: string;
}

export const SalonChatModal: React.FC<SalonChatModalProps> = ({
  isOpen,
  salon,
  onClose,
  onOpenBooking,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'salon',
      text: `¡Hola Valentina! Bienvenida al canal directo de ${salon.name}. ¿Tenés alguna duda sobre nuestros tratamientos o querés coordinar un horario especial?`,
      time: '15:20',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Automated salon response
    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'salon',
        text: `¡Perfecto! Nuestro equipo técnico ya tiene registrada tu consulta. También podés reservar directamente tu turno para ${salon.nextSlot} o consultar por WhatsApp.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Chat directo con ${salon.name}`}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[600px] border border-[#F1F1F1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-3.5 bg-white border-b border-[#E5E5E5] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={salon.logo}
                alt={salon.name}
                className="w-9 h-9 rounded-full object-cover border border-[#F1F1F1]"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-1 ring-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#111111] truncate max-w-[190px]">
                  {salon.name}
                </span>
                <span
                  className="material-symbols-outlined text-[13px] text-[#111111]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified
                </span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">En línea · Responde rápido</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenBooking}
              className="px-2.5 py-1 rounded-full bg-[#F1F1F1] text-[#111111] text-[11px] font-bold hover:bg-[#111111] hover:text-white transition-colors"
            >
              Turnos
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] hover:text-[#111111]"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          <div className="text-center my-1">
            <span className="text-[10px] bg-[#F1F1F1] text-[#444444] px-2.5 py-0.5 rounded-full">
              Canal directo verificado por GlowBuzz
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#FDE7EE] text-[#B82E5F] rounded-br-xs'
                      : 'bg-white text-[#111111] border border-[#E5E5E5] rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-[#6B6B6B] mt-0.5 px-1">{m.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E5E5E5] flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1 px-3.5 py-2 rounded-full bg-[#F7F7F7] border border-[#D9D9D9] text-xs text-[#111111] outline-none focus:border-[#111111]"
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center shadow-xs active:scale-90 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[17px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
