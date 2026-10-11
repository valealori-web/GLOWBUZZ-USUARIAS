import React, { useState } from 'react';
import { HEADER_CONTAINER, HeaderLogo, BackButton, HeaderIconButton } from '../components/HeaderParts';
import { Salon, ActiveScreen } from '../types';
import { CityMap } from '../components/CityMap';
import { LOOKS_DATA } from '../data/mockData';

interface SalonProfileViewProps {
  salon: Salon;
  initialTab?: string;
  onNavigate: (screen: ActiveScreen) => void;
  onBack: () => void;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onOpenChat: (salon: Salon) => void;
  onOpenLightbox: (imageUrl: string, caption?: string) => void;
  onOpenShare: (title: string, subtitle?: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const SalonProfileView: React.FC<SalonProfileViewProps> = ({
  salon,
  initialTab = 'trabajos',
  onNavigate,
  onBack,
  onOpenBooking,
  onOpenChat,
  onOpenLightbox,
  onOpenShare,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'trabajos' | 'clientes' | 'servicios' | 'resenas' | 'ubicacion'>(
    (initialTab as any) || 'trabajos'
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [favWorks, setFavWorks] = useState<string[]>([]);

  const handleFollowToggle = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    onShowToast(next ? `Ahora sigues a ${salon.name}` : `Dejaste de seguir a ${salon.name}`, 'person');
  };

  const toggleFavWork = (workId: string) => {
    setFavWorks((prev) =>
      prev.includes(workId) ? prev.filter((id) => id !== workId) : [...prev, workId]
    );
    onShowToast('Actualizado en tus tableros de inspiración', 'favorite');
  };

  const handleSelectService = (name: string, price: string) => {
    setSelectedService(name);
    setSelectedPrice(price);
    onShowToast(`Seleccionado: ${name}`, 'check');
    document.getElementById('booking-sheet')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmBooking = () => {
    onOpenBooking({
      salonName: salon.name,
      serviceName: selectedService || 'Consulta & Servicio de Autor',
      price: selectedPrice || undefined,
      slot: salon.nextSlot,
      provider: salon.externalBookingProvider,
    });
  };

  // Abre el detalle del trabajo real asociado a un servicio (o el más cercano del salón)
  const handleServiceDetail = (serv: Salon['services'][number]) => {
    const norm = (t: string) =>
      t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const words = norm(serv.name).split(/[^a-z0-9]+/).filter((w) => w.length > 3);
    const candidates = LOOKS_DATA.filter((l) => l.salonId === salon.id);
    const scored = candidates
      .map((l) => ({
        look: l,
        score:
          (norm(l.category) === norm(serv.category) ? 3 : 0) +
          words.filter((w) => norm(l.title).includes(w)).length,
      }))
      .sort((a, b) => b.score - a.score);
    if (scored.length > 0) {
      onNavigate({ name: 'look_detail', lookId: scored[0].look.id });
    } else {
      onShowToast(serv.description, 'info');
    }
  };

  const handleShare = () => {
    onOpenShare(salon.name, `${salon.neighborhood} · Salón Verificado en GlowBuzz`);
  };

  return (
    <div className="flex flex-col w-full pb-32 bg-[#FFFFFF] min-h-screen">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <HeaderIconButton icon="share" label="Compartir" onClick={handleShare} />
            <BackButton onBack={onBack} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full pt-16 max-w-6xl mx-auto sm:px-6 lg:px-8">
        {/* Cover */}
        <div className="relative w-full h-36 sm:h-48 bg-[#F1F1F1] overflow-hidden sm:rounded-b-2xl">
          <img
            src={salon.coverImage}
            alt={salon.name}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => onOpenLightbox(salon.coverImage, salon.name)}
          />
        </div>

        {/* Identity */}
        <section className="px-5 -mt-10 relative z-10">
          <div className="flex items-end gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white overflow-hidden border-4 border-white shrink-0">
              <img src={salon.logo} alt={salon.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 grid grid-cols-3 text-center pb-1">
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[#111111] leading-tight">
                  {salon.worksCount}
                </span>
                <span className="text-xs text-[#6B6B6B]">Trabajos</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-[#111111] leading-tight">
                  {salon.followersCount}
                </span>
                <span className="text-xs text-[#6B6B6B]">Seguidoras</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('resenas')}
                className="flex flex-col"
              >
                <span className="text-lg font-semibold text-[#111111] leading-tight">
                  {salon.rating.toFixed(1)} ★
                </span>
                <span className="text-xs text-[#6B6B6B]">{salon.reviewsCount} reseñas</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-[#111111]">{salon.name}</h2>
            {salon.verified && (
              <span
                className="material-symbols-outlined text-[17px] text-[#111111]"
                style={{ fontVariationSettings: "'FILL' 1" }}
                title="Salón verificado"
              >
                verified
              </span>
            )}
          </div>
          <p className="text-sm text-[#111111] mt-1 leading-snug max-w-lg">{salon.bio}</p>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'explore', initialSalonId: salon.id })}
            className="mt-2 flex items-center gap-1 text-xs text-[#6B6B6B] hover:text-[#111111] transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[15px]">location_on</span>
            <span>
              {salon.address}, {salon.neighborhood} · {salon.distance}
            </span>
          </button>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                document.getElementById('booking-sheet')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="flex-1 h-10 rounded-lg bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] text-sm font-semibold transition-colors"
            >
              Reservar turno
            </button>
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`h-10 px-5 rounded-lg text-sm font-semibold transition-colors ${
                isFollowing
                  ? 'bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2]'
                  : 'bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2]'
              }`}
            >
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </button>
            <button
              type="button"
              onClick={() => onOpenChat(salon)}
              aria-label="Enviar mensaje"
              className="w-10 h-10 rounded-lg bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center hover:bg-[#FBD5E2] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="sticky top-16 z-30 mt-5 bg-white/95 backdrop-blur-md border-b border-[#EFEFEF]">
          <div className="flex overflow-x-auto no-scrollbar px-2" role="tablist">
            {[
              { id: 'trabajos', label: 'Trabajos' },
              { id: 'clientes', label: 'Clientas' },
              { id: 'servicios', label: 'Servicios' },
              { id: 'resenas', label: 'Reseñas' },
              { id: 'ubicacion', label: 'Ubicación' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 h-11 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#111111] text-[#111111]'
                      : 'border-transparent text-[#8A8A8A] hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panels Container */}
        <div className="px-5 mt-4 flex flex-col gap-5">
          {/* TAB 1: Trabajos del Salón */}
          {activeTab === 'trabajos' && (
            <section className="flex flex-col gap-3">
              <h3 className="text-base font-semibold text-[#111111]">Trabajos del salón</h3>

              {/* Multi-Column Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                {salon.portfolio.map((work) => {
                  const isFav = favWorks.includes(work.id);
                  return (
                    <div key={work.id} className="flex flex-col gap-1.5 group">
                      <div
                        className="relative w-full aspect-[4/5] rounded-2xl bg-[#F1F1F1] overflow-hidden shadow-xs cursor-pointer"
                        onClick={() => {
                          if (work.lookId) {
                            onNavigate({ name: 'look_detail', lookId: work.lookId });
                          } else {
                            onNavigate({ name: 'look_detail', lookId: 'look-balayage-vainilla' });
                          }
                        }}
                      >
                        <img
                          src={work.image}
                          alt={work.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex flex-col px-1">
                        <span className="text-xs font-bold text-[#111111] truncate">
                          {work.title}
                        </span>
                        <span className="text-[11px] text-[#6B6B6B]">{work.stylist}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* TAB 2: Subidos por Clientes */}
          {activeTab === 'clientes' && (
            <section className="flex flex-col gap-4">
              {salon.clientProofs.map((proof) => (
                <div
                  key={proof.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-[#E5E5E5] flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        if (proof.userId) {
                          onNavigate({ name: 'user_profile', userId: proof.userId });
                        }
                      }}
                    >
                      <img
                        src={proof.clientAvatar}
                        alt={proof.clientName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[#111111] hover:text-[#111111]">
                            {proof.clientName}
                          </span>
                          <span
                            className="material-symbols-outlined text-[14px] text-[#111111]"
                            title="Clienta Verificada"
                          >
                            check_circle
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B6B6B]">
                          Tratamiento: {proof.treatment} · {proof.timeframe}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 text-amber-500">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-xs font-bold text-[#111111]">
                        {proof.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="relative w-full h-60 rounded-xl overflow-hidden bg-[#F1F1F1] cursor-pointer"
                    onClick={() => onOpenLightbox(proof.image, `${proof.caption} (${proof.clientName})`)}
                  >
                    <img
                      src={proof.image}
                      alt={proof.caption}
                      className="w-full h-full object-cover hover:scale-103 transition-transform"
                    />
                  </div>

                  <p className="text-xs text-[#111111] leading-relaxed">
                    &ldquo;{proof.quote}&rdquo;
                  </p>

                  <p className="text-xs text-[#6B6B6B] pt-1 border-t border-[#F4F4F4]">
                    Servicio: <span className="text-[#111111] font-semibold">{proof.price}</span>
                  </p>
                </div>
              ))}
            </section>
          )}

          {/* TAB 3: Servicios & Precios */}
          {activeTab === 'servicios' && (
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#111111]">Carta de Servicios</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {salon.services.map((serv) => (
                  <div
                    key={serv.id}
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#111111]">{serv.name}</span>
                      <span className="text-[11px] text-[#6B6B6B] mt-0.5 leading-snug">
                        {serv.description}
                      </span>
                      <span className="text-[11px] text-[#111111] font-medium mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        <span>{serv.duration} {serv.includesNotes && `· ${serv.includesNotes}`}</span>
                      </span>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start shrink-0 gap-2">
                      <span className="text-sm font-semibold text-[#111111]">{serv.price}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleServiceDetail(serv)}
                          className="px-3 h-8 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-xs font-semibold hover:bg-[#FBD5E2] transition-colors"
                        >
                          Ver detalle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectService(serv.name, serv.price)}
                          className="px-3 h-8 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-xs font-semibold hover:bg-[#FBD5E2] transition-colors"
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: Reseñas */}
          {activeTab === 'resenas' && (
            <section className="flex flex-col gap-4" id="section-resenas">
              <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex items-center gap-4">
                <div className="flex flex-col items-center justify-center shrink-0 pr-3 border-r border-[#F4F4F4]">
                  <span className="text-3xl font-black text-[#111111]">4.9</span>
                  <div className="flex text-amber-500 my-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#6B6B6B]">{salon.reviewsCount} valoraciones</span>
                </div>

                <div className="flex-1 flex flex-col gap-1 text-[11px] text-[#444444]">
                  <div className="flex items-center gap-2">
                    <span>5★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F1F1F1] overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: '92%' }} />
                    </div>
                    <span className="w-6 text-right">92%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F1F1F1] overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: '6%' }} />
                    </div>
                    <span className="w-6 text-right">6%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3★</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F1F1F1] overflow-hidden">
                      <div className="h-full bg-[#111111] rounded-full" style={{ width: '2%' }} />
                    </div>
                    <span className="w-6 text-right">2%</span>
                  </div>
                </div>
              </div>

              {/* Review items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {salon.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          if (rev.userId) {
                            onNavigate({ name: 'user_profile', userId: rev.userId });
                          }
                        }}
                      >
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-[#111111] hover:text-[#111111]">
                            {rev.author}
                          </p>
                          <p className="text-[10px] text-[#6B6B6B]">
                            Cliente verificada · Reservó por GlowBuzz
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#444444] leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {rev.photos && (
                      <div className="flex gap-2 mt-1">
                        {rev.photos.map((p, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5] cursor-pointer relative group"
                            onClick={() => onOpenLightbox(p, `Foto de reseña por ${rev.author}`)}
                          >
                            <img
                              src={p}
                              alt="Foto reseña"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                              <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 5: Ubicación interactiva en mapa */}
          {activeTab === 'ubicacion' && (
            <section className="flex flex-col gap-3">
              <div>
                <h3 className="text-base font-bold text-[#111111]">Ubicación del Estudio</h3>
                <p className="text-xs text-[#6B6B6B]">{salon.address}, {salon.neighborhood}</p>
              </div>

              <div className="relative w-full h-60 rounded-2xl overflow-hidden border border-[#E5E5E5] isolate">
                <CityMap salons={[salon]} selectedId={salon.id} onSelect={() => {}} />
              </div>
              <button
                type="button"
                onClick={() => onNavigate({ name: 'explore', initialSalonId: salon.id })}
                className="self-start text-xs font-semibold text-[#111111] hover:underline"
              >
                Ver en el mapa completo →
              </button>

              {/* Horarios */}
              <div className="p-4 rounded-2xl bg-white border border-[#E5E5E5] shadow-xs flex flex-col gap-1.5">
                <span className="text-xs font-bold text-[#111111]">Horarios de Atención</span>
                <div className="flex justify-between text-xs text-[#444444] py-1 border-b border-[#F4F4F4]">
                  <span>Martes a Viernes</span>
                  <span className="font-semibold text-[#111111]">{salon.openingHours.weekdays}</span>
                </div>
                <div className="flex justify-between text-xs text-[#444444] py-1 border-b border-[#F4F4F4]">
                  <span>Sábados</span>
                  <span className="font-semibold text-[#111111]">{salon.openingHours.saturday}</span>
                </div>
                <div className="flex justify-between text-xs text-[#444444] py-1">
                  <span>Domingos &amp; Lunes</span>
                  <span className="text-[#111111] font-semibold">{salon.openingHours.sunday}</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Sticky Bottom Quick Booking Drawer Target */}
        <div className="mt-8 px-5" id="booking-sheet">
          <div className="p-5 rounded-3xl bg-[#571C31] text-[#FFF8F3] shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[#F5DCE5]/80 tracking-widest">
                  Disponibilidad Inmediata
                </span>
                <span className="text-lg font-extrabold text-white">
                  Próximo turno libre: {salon.nextSlot}
                </span>
              </div>
            </div>

            {selectedService && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 text-[#F5DCE5] text-xs font-semibold">
                <span>{selectedService} {selectedPrice && `(${selectedPrice})`}</span>
                <span className="material-symbols-outlined text-[15px]">check</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmBooking}
              className="w-full py-3.5 rounded-full bg-white hover:bg-[#FDE7EE] text-[#B82E5F] font-bold text-sm tracking-tight flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">event_available</span>
              <span>Reservar con GlowBuzz</span>
            </button>

          </div>
        </div>
      </main>
    </div>
  );
};
