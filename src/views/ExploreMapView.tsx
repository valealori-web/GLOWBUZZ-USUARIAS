import React, { useState, useRef, useEffect } from 'react';
import { Salon, Look, ActiveScreen, FilterOptions } from '../types';
import { HeaderLogo, NotificationBell, BackButton } from '../components/HeaderParts';
import { CityMap } from '../components/CityMap';
import { SocialProofRow } from '../components/SocialProofRow';
import { PhotoSearchBanner, PhotoSearchButton, usePhotoSearch } from '../components/PhotoSearch';
import { scoreSalon } from '../lib/visualSearch';
import { parseMaxDistance } from '../lib/geo';
import type { useUserLocation } from '../lib/useUserLocation';

interface ExploreMapViewProps {
  salons: Salon[];
  looks?: Look[];
  onNavigate: (screen: ActiveScreen) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onOpenFilters: () => void;
  currentFilters?: FilterOptions;
  onShowToast: (msg: string, icon?: string) => void;
  unreadCount: number;
  initialSalonId?: string;
  userLocation?: ReturnType<typeof useUserLocation>;
}

export const ExploreMapView: React.FC<ExploreMapViewProps> = ({
  salons,
  looks = [],
  onNavigate,
  onBack,
  canGoBack = false,
  onOpenBooking,
  onOpenFilters,
  currentFilters,
  onShowToast,
  unreadCount,
  initialSalonId,
  userLocation,
}) => {
  const [selectedPinId, setSelectedPinId] = useState<string>(
    initialSalonId || (salons.length > 0 ? salons[0].id : 'studio-velvet-nails')
  );
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const photo = usePhotoSearch();
  const [activeQuickFilter, setActiveQuickFilter] = useState<'all' | 'tomorrow' | 'high_rating'>('all');
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>('Todos');
  const [recenterToken, setRecenterToken] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSalonId) {
      setSelectedPinId(initialSalonId);
      scrollToSalon(initialSalonId);
    }
  }, [initialSalonId]);

  const scrollToSalon = (salonId: string) => {
    setSelectedPinId(salonId);
    // Mobile carousel scroll
    const mobileCard = document.getElementById(`salon-card-mobile-${salonId}`);
    if (mobileCard) {
      mobileCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    // Desktop list scroll
    const desktopCard = document.getElementById(`salon-card-desktop-${salonId}`);
    if (desktopCard) {
      desktopCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleRecenter = () => {
    setRecenterToken((n) => n + 1);
    if (userLocation && userLocation.isFallback) userLocation.locate();
    onShowToast(
      userLocation && !userLocation.isFallback
        ? 'Mostrando los salones cerca tuyo'
        : 'Mostrando todos los salones en el mapa',
      'my_location'
    );
  };

  // Barrios/ciudades reales, derivados de los salones (ordenados por cantidad)
  const neighborhoods = Object.entries(
    salons.reduce<Record<string, number>>((acc, s) => {
      acc[s.neighborhood] = (acc[s.neighborhood] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);

  // Filter salons dynamically
  const baseSalons = salons.filter((s) => {
    // Neighborhood filter
    if (activeNeighborhood !== 'Todos') {
      if (!s.neighborhood.toLowerCase().includes(activeNeighborhood.toLowerCase())) {
        return false;
      }
    }

    // Search query matching name, neighborhood, address, services, stylists
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.name.toLowerCase().includes(q);
      const matchNeigh = s.neighborhood.toLowerCase().includes(q);
      const matchBio = s.bio.toLowerCase().includes(q);
      const matchServices = s.services.some(
        (srv) => srv.name.toLowerCase().includes(q) || srv.category.toLowerCase().includes(q)
      );
      const matchStylists = s.portfolio.some((p) => p.stylist.toLowerCase().includes(q));
      if (!matchName && !matchNeigh && !matchBio && !matchServices && !matchStylists) {
        return false;
      }
    }

    // Quick filter: Turnos mañana / hoy
    if (activeQuickFilter === 'tomorrow') {
      const hasTomorrow =
        s.nextSlot.toLowerCase().includes('mañana') || s.nextSlot.toLowerCase().includes('hoy');
      if (!hasTomorrow) return false;
    }

    // Quick filter: 4.8+ rating
    if (activeQuickFilter === 'high_rating') {
      if (s.rating < 4.8) return false;
    }

    // Advanced filters
    if (currentFilters) {
      const maxKm = parseMaxDistance(currentFilters.maxDistance);
      if (maxKm !== null && s.distanceKm !== null && s.distanceKm > maxKm) return false;
      if (currentFilters.category && currentFilters.category !== 'Todas') {
        const hasCategory = s.services.some((srv) =>
          srv.category.toLowerCase().includes(currentFilters.category.toLowerCase())
        );
        if (!hasCategory) return false;
      }
      if (currentFilters.minRating && s.rating < currentFilters.minRating) {
        return false;
      }
    }

    return true;
  });

  // Búsqueda por foto: salones con servicios parecidos primero
  const filteredSalons = photo.result
    ? baseSalons
        .map((salon) => ({ salon, score: scoreSalon(salon, photo.result!) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.salon)
    : baseSalons;

  const selectedSalon =
    filteredSalons.find((s) => s.id === selectedPinId) ||
    filteredSalons[0] ||
    salons[0];

  const getMatchingLook = (salonId: string) => {
    return looks.find((l) => l.salonId === salonId);
  };

  const selectedLook = selectedSalon ? getMatchingLook(selectedSalon.id) : undefined;

  return (
    <div className="flex flex-col w-full pb-24 md:pb-24 bg-[#FFFFFF] min-h-screen">
      {/* Sticky Top Header - Responsive across Mobile and Desktop */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#F1F1F1]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <HeaderLogo onNavigate={onNavigate} />

            {/* Desktop Center Quick Search */}
            <div className="hidden md:flex flex-1 max-w-lg mx-2">
              <div className="relative flex items-center w-full bg-[#F7F7F7] hover:bg-[#F4F4F4] focus-within:bg-white rounded-full px-4 py-2 border border-[#E5E5E5] focus-within:border-[#111111] transition-all shadow-xs">
                <span className="material-symbols-outlined text-[#6B6B6B] text-[19px] mr-2">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar salones, Pocitos, Carrasco, uñas, balayage..."
                  className="w-full bg-transparent text-[#111111] placeholder:text-[#6B6B6B] text-xs focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                    className="text-[#6B6B6B] mr-1.5 hover:text-[#111111]"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                )}
                <PhotoSearchButton onFile={photo.start} className="mr-1.5" />
                <button
                  type="button"
                  onClick={onOpenFilters}
                  aria-label="Filtros avanzados"
                  className="w-7 h-7 rounded-full bg-[#FDE7EE] hover:bg-[#B82E5F] text-[#B82E5F] hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <NotificationBell onNavigate={onNavigate} unreadCount={unreadCount} />
              {canGoBack && <BackButton onBack={onBack} />}
            </div>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="md:hidden px-4 pb-2 pt-0.5">
          <div className="relative flex items-center w-full bg-[#F7F7F7] rounded-full px-3.5 py-2 shadow-xs border border-[#E5E5E5] focus-within:border-[#111111] focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-[#6B6B6B] text-[18px] mr-2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar salones, Pocitos, uñas..."
              className="w-full bg-transparent text-[#111111] placeholder:text-[#6B6B6B] text-xs focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#6B6B6B] mr-1.5 hover:text-[#111111]"
              >
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
            <PhotoSearchButton onFile={photo.start} className="mr-1.5" />
            <button
              type="button"
              onClick={onOpenFilters}
              aria-label="Filtrar salones"
              className="w-7 h-7 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] active:scale-95 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Pills Ribbon (Mobile & Desktop) */}
        <div className="w-full border-t border-[#F1F1F1]/40 bg-[#FFFFFF]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuickFilter('all');
                    setActiveNeighborhood('Todos');
                    setSearchQuery('');
                    onShowToast('Mostrando todos los salones de Montevideo');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    activeQuickFilter === 'all' && activeNeighborhood === 'Todos' && !searchQuery
                      ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                      : 'bg-white text-[#444444] hover:text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5]/80'
                  }`}
                >
                  Todos ({salons.length})
                </button>

                {/* Neighborhood chips */}
                {neighborhoods.map((neigh) => {
                  const isActive = activeNeighborhood === neigh;
                  return (
                    <button
                      key={neigh}
                      type="button"
                      onClick={() => {
                        const next = isActive ? 'Todos' : neigh;
                        setActiveNeighborhood(next);
                        onShowToast(
                          next === 'Todos'
                            ? 'Mostrando todas las zonas'
                            : `Filtrando por ${neigh}`
                        );
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                        isActive
                          ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                          : 'bg-white text-[#444444] hover:text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5]/80'
                      }`}
                    >
                      {neigh}
                    </button>
                  );
                })}

                {/* Turnos Mañana / Inmediatos */}
              </div>

              {/* Mobile View Toggle Button (Map / List) */}
              <div className="md:hidden flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setMobileViewMode((prev) => (prev === 'map' ? 'list' : 'map'))
                  }
                  className="px-3 py-1.5 rounded-full bg-[#571C31] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {mobileViewMode === 'map' ? 'format_list_bulleted' : 'map'}
                  </span>
                  <span>{mobileViewMode === 'map' ? 'Lista' : 'Mapa'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace: True Responsive Desktop (Split Layout) & Mobile View */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Results List & Cards (Desktop & Mobile List) */}
          {/* ======================================================== */}
          <div
            ref={listRef}
            className={`md:col-span-5 lg:col-span-5 flex flex-col gap-4 ${
              mobileViewMode === 'map' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <p className="px-1 text-xs text-[#6B6B6B]">
              {filteredSalons.length} {filteredSalons.length === 1 ? 'salón' : 'salones'} en Montevideo
            </p>

            <PhotoSearchBanner search={photo} resultsLabel="salones" resultsCount={filteredSalons.length} />

            {/* List of Salon Cards */}
            <div className="flex flex-col gap-3.5">
              {filteredSalons.map((salon) => {
                const isSelected = selectedPinId === salon.id;
                return (
                  <article
                    key={salon.id}
                    id={`salon-card-desktop-${salon.id}`}
                    onMouseEnter={() => setSelectedPinId(salon.id)}
                    onClick={() => onNavigate({ name: 'salon_profile', salonId: salon.id })}
                    className={`flex gap-4 p-3 rounded-2xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-[#B82E5F] bg-[#FDE7EE]/60 shadow-sm'
                        : 'border-[#F3D3DE] bg-[#FFF8F9] hover:border-[#B82E5F]/40'
                    }`}
                  >
                    <img
                      src={salon.coverImage}
                      alt={salon.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shrink-0 bg-[#F1F1F1]"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                      <h3 className="text-sm font-semibold text-[#111111] truncate">{salon.name}</h3>
                      <p className="text-xs text-[#6B6B6B] truncate">
                        {salon.neighborhood} · {salon.distance}
                      </p>
                      <p className="text-xs text-[#111111]">
                        ★ {salon.rating.toFixed(1)}{' '}
                        <span className="text-[#6B6B6B]">({salon.reviewsCount})</span>
                      </p>
                      <p className="text-xs text-[#6B6B6B] truncate">Próximo turno: {salon.nextSlot}</p>
                      <SocialProofRow followers={salon.mutualFollowers} onNavigate={onNavigate} variant="compact" />
                    </div>
                  </article>
                );
              })}

              {filteredSalons.length === 0 && (
                <div className="p-8 text-center bg-white rounded-3xl border border-[#E5E5E5]">
                  <span className="material-symbols-outlined text-4xl text-[#D9D9D9] mb-2">
                    explore_off
                  </span>
                  <p className="text-sm font-bold text-[#111111]">No hay salones con estos filtros</p>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Probá cambiando el barrio o quitando el filtro de turnos.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuickFilter('all');
                      setActiveNeighborhood('Todos');
                      setSearchQuery('');
                    }}
                    className="mt-3 px-4 py-1.5 rounded-full bg-[#FDE7EE] text-[#B82E5F] text-xs font-bold"
                  >
                    Restablecer búsqueda
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Interactive Montevideo Map (Desktop & Mobile) */}
          {/* ======================================================== */}
          <div
            className={`md:col-span-7 lg:col-span-7 flex flex-col ${
              mobileViewMode === 'list' ? 'hidden md:flex' : 'flex'
            }`}
          >
            <div className="sticky top-32 w-full h-[calc(100dvh-260px)] min-h-[380px] md:h-[calc(100vh-180px)] gb-mapwrap rounded-3xl overflow-hidden border border-[#D9D9D9] shadow-md relative bg-[#F2F2F2] select-none">
              {/* Mapa real de Montevideo (Leaflet + OpenStreetMap) */}
              <CityMap
                salons={filteredSalons}
                selectedId={selectedSalon?.id}
                onSelect={scrollToSalon}
                userPosition={userLocation && !userLocation.isFallback ? userLocation.position : null}
                recenterToken={recenterToken}
                focusSelectedOnMount={!!initialSalonId}
              />

              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRecenter}
                  aria-label="Re-centrar el mapa"
                  className="w-10 h-10 rounded-full bg-[#FDE7EE] text-[#B82E5F] shadow-md flex items-center justify-center hover:bg-[#FBD5E2] active:scale-90 transition-all"
                  title="Re-centrar el mapa"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#B82E5F]">
                    my_location
                  </span>
                </button>
              </div>

              {/* Salón seleccionado */}
              {selectedSalon && (
                <div className="absolute bottom-4 left-4 right-4 z-20 hidden md:block">
                  <button
                    type="button"
                    onClick={() => onNavigate({ name: 'salon_profile', salonId: selectedSalon.id })}
                    className="w-full max-w-md mx-auto bg-white rounded-2xl p-3 shadow-lg border border-[#E5E5E5] flex items-center gap-3 text-left"
                  >
                    <img
                      src={selectedSalon.coverImage}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-[#F1F1F1]"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#111111] truncate">
                        {selectedSalon.name}
                      </span>
                      <span className="block text-xs text-[#6B6B6B] truncate">
                        {selectedSalon.neighborhood} · {selectedSalon.distance} · ★{' '}
                        {selectedSalon.rating.toFixed(1)}
                      </span>
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-[#8A8A8A]">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
              {/* Tarjetas de salones sobre el mapa (solo celular) */}
              <div className="md:hidden absolute bottom-3 left-0 right-0 z-20">
                <div
                  ref={carouselRef}
                  className="flex gap-2.5 overflow-x-auto no-scrollbar px-3 snap-x snap-mandatory pb-1"
                >
                  {filteredSalons.map((salon) => {
                    const isSelected = selectedPinId === salon.id;
                    return (
                      <div
                        key={salon.id}
                        id={`salon-card-mobile-${salon.id}`}
                        onClick={() => onNavigate({ name: 'salon_profile', salonId: salon.id })}
                        className={`snap-start shrink-0 w-[78vw] max-w-[320px] flex items-center gap-3 p-2.5 rounded-2xl shadow-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-[#B82E5F] bg-[#FDE7EE]' : 'border-[#F3D3DE] bg-white'
                        }`}
                      >
                        <img
                          src={salon.coverImage}
                          alt={salon.name}
                          className="w-16 h-16 rounded-xl object-cover bg-[#F1F1F1] shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-[#111111] truncate">{salon.name}</h4>
                          <p className="text-xs text-[#6B6B6B] truncate">
                            {salon.neighborhood} · {salon.distance}
                          </p>
                          <p className="text-xs text-[#111111]">
                            ★ {salon.rating.toFixed(1)}{' '}
                            <span className="text-[#6B6B6B]">· {salon.nextSlot}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
