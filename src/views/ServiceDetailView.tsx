import React, { useState } from 'react';
import { HEADER_CONTAINER, HeaderLogo, BackButton, HeaderIconButton } from '../components/HeaderParts';
import { Look, Salon, ActiveScreen } from '../types';

interface ServiceDetailViewProps {
  look: Look;
  salon: Salon;
  isSaved: boolean;
  onToggleSave: (lookId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onBack: () => void;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    stylistName?: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onOpenLightbox: (imageUrl: string, caption?: string) => void;
  onOpenShare: (title: string, subtitle?: string, url?: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  look,
  salon,
  isSaved,
  onToggleSave,
  onNavigate,
  onBack,
  onOpenBooking,
  onOpenLightbox,
  onOpenShare,
  onShowToast,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('Mañana 15:30 hs');
  const [isFollowing, setIsFollowing] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const images =
    look.images.length > 0
      ? look.images
      : [
          {
            url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
            alt: look.title,
            caption: 'Resultado en estudio',
          },
        ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      handlePrevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleFollowToggle = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    onShowToast(
      next ? `Ahora sigues a ${salon.name}` : `Dejaste de seguir a ${salon.name}`,
      'person'
    );
  };

  const handleShareClick = () => {
    onOpenShare(
      `${look.title} en ${salon.name}`,
      `Descubrí este trabajo real en GlowBuzz · ${look.price}`
    );
  };

  const handleBookingClick = () => {
    onOpenBooking({
      salonName: salon.name,
      serviceName: look.title,
      stylistName: look.stylistName || 'Equipo técnico',
      price: look.specs.estimatedPrice || look.price,
      slot: selectedSlot,
      provider: salon.externalBookingProvider,
    });
  };

  return (
    <div className="flex flex-col w-full pb-44 md:pb-24 bg-[#FFFFFF] min-h-screen">
      {/* Sticky Top Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <HeaderIconButton icon="ios_share" label="Compartir look" onClick={handleShareClick} />
            <HeaderIconButton
              icon={isSaved ? 'bookmark' : 'bookmark_border'}
              label={isSaved ? 'Quitar de guardados' : 'Guardar look'}
              filled={isSaved}
              onClick={() => onToggleSave(look.id)}
            />
            <BackButton onBack={onBack} />
          </div>
        </div>
      </header>

      {/* Main Container - Split Responsive on Desktop */}
      <main className="flex-1 w-full pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Media Showcase, Specs, Reviews, Similars   */}
          {/* ======================================================== */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Visual Showcase Carousel Section */}
            <section className="relative w-full rounded-3xl overflow-hidden bg-[#F7F7F7] shadow-sm border border-[#E5E5E5]">
              <div
                className="relative w-full h-[380px] sm:h-[460px] overflow-hidden select-none group touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Carousel Track */}
                <div
                  className="flex w-full h-full transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {images.map((img, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 relative">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => onOpenLightbox(img.url, img.caption)}
                      />
                    </div>
                  ))}
                </div>

                {/* Carousel Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevSlide}
                      aria-label="Imagen anterior"
                      className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white items-center justify-center hover:bg-black/60 active:scale-90 transition-all z-20"
                    >
                      <span className="material-symbols-outlined text-[22px]">chevron_left</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSlide}
                      aria-label="Siguiente imagen"
                      className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white items-center justify-center hover:bg-black/60 active:scale-90 transition-all z-20"
                    >
                      <span className="material-symbols-outlined text-[22px]">chevron_right</span>
                    </button>
                  </>
                )}

                {/* Slide Navigation Dots */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Foto ${idx + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          currentSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Key Specs Bento Grid */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl flex flex-col justify-between border border-[#E5E5E5] shadow-xs">
                <div className="flex items-center gap-1 text-[#111111] mb-1">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Estimado</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#111111]">
                    {look.specs.estimatedPrice}
                  </span>
                  <span className="block text-[11px] text-[#6B6B6B]">según volumen</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl flex flex-col justify-between border border-[#E5E5E5] shadow-xs">
                <div className="flex items-center gap-1 text-[#444444] mb-1">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Sesión</span>
                </div>
                <div>
                  <span className="text-lg font-bold text-[#111111]">
                    {look.specs.sessionDuration}
                  </span>
                  <span className="block text-[11px] text-[#6B6B6B]">Paso a paso</span>
                </div>
              </div>

            </section>

            {/* Service Description & Steps */}
            <section className="bg-white p-5 rounded-3xl border border-[#E5E5E5] shadow-xs flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                Detalles del Tratamiento
              </h3>
              <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
                {look.description}
              </p>
            </section>

            {/* Client Reviews Section with Large Image Zoom */}
            {look.clientReviews.length > 0 && (
              <section className="bg-white p-5 rounded-3xl border border-[#E5E5E5] shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111111]">Resultados de clientas</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-3.5">
                  {look.clientReviews.map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#F4F4F4] flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer"
                          onClick={() => {
                            if (rev.userId) {
                              onNavigate({ name: 'user_profile', userId: rev.userId });
                            }
                          }}
                        >
                          <img
                            src={rev.clientAvatar}
                            alt={rev.clientName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#111111] hover:text-[#111111]">
                              {rev.clientName}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="flex text-amber-500">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <span
                                    key={i}
                                    className="material-symbols-outlined text-[13px]"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                              <span className="text-[10px] text-[#6B6B6B]">{rev.date}</span>
                            </div>
                          </div>
                        </div>
                        {rev.verified && (
                          <span className="bg-[#F1F1F1] text-[#111111] text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Cliente Verificada
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#444444] leading-relaxed">
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      {rev.photos && rev.photos.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          {rev.photos.map((p, pIdx) => (
                            <div
                              key={pIdx}
                              className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E5E5] cursor-pointer relative group"
                              onClick={() =>
                                onOpenLightbox(p, `Resultado real por ${rev.clientName}`)
                              }
                            >
                              <img
                                src={p}
                                alt="Resultado real"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <span className="material-symbols-outlined text-[16px]">
                                  zoom_in
                                </span>
                              </div>
                            </div>
                          ))}
                          {rev.highlightTag && (
                            <div className="flex flex-col justify-center pl-1 text-xs text-[#444444]">
                              <span className="font-semibold text-[#111111]">
                                {rev.highlightTag}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Similar Works Section */}
            {look.similarLooks.length > 0 && (
              <section className="bg-white p-5 rounded-3xl border border-[#E5E5E5] shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111111]">Trabajos similares</h3>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                  {look.similarLooks.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onNavigate({ name: 'look_detail', lookId: sim.id })}
                      className="min-w-[190px] w-[190px] shrink-0 bg-[#FFFFFF] rounded-2xl overflow-hidden border border-[#E5E5E5] flex flex-col cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="relative h-36 w-full overflow-hidden">
                        <img
                          src={sim.image}
                          alt={sim.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-3 flex flex-col justify-between flex-1">
                        <div>
                          <p className="text-xs font-bold text-[#111111] line-clamp-1 group-hover:text-[#111111]">
                            {sim.title}
                          </p>
                          <p className="text-[11px] text-[#6B6B6B]">
                            {sim.salon} • {sim.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Sticky Booking & Salon Card (Desktop & Mobile) */}
          {/* ======================================================== */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="md:sticky md:top-24 flex flex-col gap-4">
              {/* Header card with Title and Price */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5E5E5] shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#F1F1F1] text-[#111111] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {look.categoryLabel}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight leading-snug">
                  {look.title}
                </h2>

                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-[#571C31] text-[#FFF8F3]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#F5DCE5]/80 block">
                      Precio estimado
                    </span>
                    <span className="text-3xl font-extrabold text-white">{look.price}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#FFC83D]">★ {look.rating}</span>
                    <span className="block text-[11px] text-[#F5DCE5]/80">{look.reviewsCount} reseñas</span>
                  </div>
                </div>

                {/* Slot Selector */}
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-[#111111]">Elegí fecha y horario:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Mañana 15:30 hs', 'Jueves 11:00 hs', 'Viernes 17:00 hs', 'Sábado 10:30 hs'].map(
                      (slot) => {
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-2.5 rounded-xl text-xs font-semibold transition-all border text-left ${
                              isSelected
                                ? 'bg-[#FDE7EE] text-[#B82E5F] border-[#111111] shadow-xs'
                                : 'bg-[#F7F7F7] text-[#111111] border-[#E5E5E5] hover:border-[#D9D9D9]'
                            }`}
                          >
                            <span className="block text-[10px] opacity-80 uppercase">Turno</span>
                            <span className="block font-bold">{slot}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Primary Booking Button */}
                <button
                  type="button"
                  onClick={handleBookingClick}
                  className="w-full py-3.5 px-4 mt-2 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[19px]">calendar_month</span>
                  <span>Reservar con GlowBuzz</span>
                </button>

              </div>

              {/* Salon Profile Card */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5E5E5] shadow-xs flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigate({ name: 'salon_profile', salonId: salon.id })}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={salon.logo}
                        alt={salon.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#F1F1F1]"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#111111] hover:text-[#111111] transition-colors">
                        {salon.name}
                      </h3>
                      {look.stylistName && (
                        <p className="text-xs text-[#444444]">
                          Especialista: <strong>{look.stylistName}</strong>
                        </p>
                      )}
                      <div
                        className="flex items-center gap-1 mt-0.5 cursor-pointer hover:underline text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate({
                            name: 'salon_profile',
                            salonId: salon.id,
                            initialTab: 'resenas',
                          });
                        }}
                      >
                        <span className="font-bold text-amber-600">★ {salon.rating.toFixed(1)}</span>
                        <span className="text-[#6B6B6B]">· {salon.reviewsCount} reseñas</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFollowToggle}
                    className={`px-3 py-1 rounded-full text-xs font-semibold active:scale-95 transition-all shrink-0 ${
                      isFollowing
                        ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                        : 'bg-[#F1F1F1] text-[#111111] hover:bg-[#F1F1F1]/80'
                    }`}
                  >
                    {isFollowing ? 'Siguiendo' : '+ Seguir'}
                  </button>
                </div>

                {/* Location with map shortcut */}
                <button
                  type="button"
                  onClick={() => onNavigate({ name: 'explore', initialSalonId: salon.id })}
                  className="w-full bg-[#F7F7F7] hover:bg-[#F1F1F1]/60 p-2.5 rounded-xl flex items-center gap-2 text-[#444444] text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-[#111111] text-[18px] shrink-0">
                    location_on
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#111111] truncate">
                      {salon.address}, {salon.neighborhood}
                    </p>
                    <p className="text-[11px] text-[#111111] font-medium">
                      {salon.distance} · Ver en el mapa
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-[#6B6B6B]">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Booking Bar (Hidden on desktop) */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#F1F1F1] px-4 py-2.5 shadow-[0_-4px_12px_rgba(17,17,17,0.06)] md:hidden">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Turno elegido</span>
            <span className="text-xs font-bold text-[#111111] truncate max-w-[130px]">
              {selectedSlot}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBookingClick}
            className="flex-1 py-3 px-4 rounded-full bg-[#FDE7EE] hover:bg-[#FBD5E2] text-[#B82E5F] font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-transform flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">calendar_month</span>
            <span>Reservar con GlowBuzz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
