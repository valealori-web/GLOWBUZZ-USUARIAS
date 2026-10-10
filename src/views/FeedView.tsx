import React, { useRef, useState } from 'react';
import { Look, ActiveScreen, LookCategory } from '../types';
import { HeaderLogo, NotificationBell } from '../components/HeaderParts';
import { PhotoSearchBanner, PhotoSearchButton, usePhotoSearch } from '../components/PhotoSearch';
import { scoreLook } from '../lib/visualSearch';

interface FeedViewProps {
  looks: Look[];
  savedLookIds: string[];
  onToggleSave: (lookId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenFilters: () => void;
  currentFilters?: {
    category: string;
    maxDistance: string;
    availability: string;
    minRating: number;
    maxPrice: number;
  };
  unreadCount: number;
}

export const FeedView: React.FC<FeedViewProps> = ({
  looks,
  savedLookIds,
  onToggleSave,
  onNavigate,
  onOpenFilters,
  currentFilters,
  unreadCount,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const photo = usePhotoSearch();
  // Menú de acciones (mantener presionado en el celular)
  const [menuLookId, setMenuLookId] = useState<string | null>(null);
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const longPressFired = useRef(false);
  const menuOpenedAt = useRef(0);

  const cancelPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  };

  const startPress = (e: React.PointerEvent, lookId: string) => {
    if (e.pointerType !== 'touch') return;
    longPressFired.current = false;
    pressStart.current = { x: e.clientX, y: e.clientY };
    pressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      menuOpenedAt.current = Date.now();
      pressTimer.current = null;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(10);
      setMenuLookId(lookId);
    }, 450);
  };

  const movePress = (e: React.PointerEvent) => {
    const start = pressStart.current;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) cancelPress();
  };

  const menuLook = menuLookId ? looks.find((l) => l.id === menuLookId) : undefined;

  const filterCategories = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Estética Facial', value: 'Estética Facial' },
    { label: 'Botox & Armonización', value: 'Botox & Armonización' },
    { label: 'Uñas', value: 'Uñas' },
    { label: 'Pelo & Color', value: 'Pelo & Color' },
    { label: 'Cejas & Pestañas', value: 'Cejas & Pestañas' },
    { label: 'Maquillaje', value: 'Maquillaje' },
    { label: 'Cerca de mí', value: 'nearby', isIcon: true },
  ];

  const baseLooks = looks.filter((look) => {
    // Category match from chips
    if (activeCategory !== 'Todos' && activeCategory !== 'nearby') {
      if (look.category !== activeCategory) return false;
    }
    // Advanced category filter
    if (currentFilters?.category && currentFilters.category !== 'Todas') {
      if (look.category !== currentFilters.category) return false;
    }
    // Rating filter
    if (currentFilters?.minRating && look.rating < currentFilters.minRating) {
      return false;
    }
    // Price filter
    if (currentFilters?.maxPrice && look.priceNumeric > currentFilters.maxPrice) {
      return false;
    }
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = look.title.toLowerCase().includes(q);
      const matchSalon = look.salonName.toLowerCase().includes(q);
      const matchLoc = look.location.toLowerCase().includes(q);
      const matchCat = look.category.toLowerCase().includes(q);
      if (!matchTitle && !matchSalon && !matchLoc && !matchCat) return false;
    }
    return true;
  });

  // Búsqueda por foto: ordena por afinidad y deja solo lo que se parece
  const filteredLooks = photo.result
    ? baseLooks
        .map((look) => ({ look, score: scoreLook(look, photo.result!) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.look)
    : baseLooks;

  // Calculate dynamic aspect ratio classes for the Pinterest masonry look
  const getAspectRatioClass = (look: Look, index: number) => {
    if (look.aspectRatio === 'tall') return 'aspect-[9/14] sm:aspect-[2/3]';
    if (look.aspectRatio === 'portrait') return 'aspect-[3/4]';
    if (look.aspectRatio === 'square') return 'aspect-[1/1]';
    // Fallback staggered alternation based on index for true Pinterest rhythm
    const patterns = [
      'aspect-[3/4]',
      'aspect-[2/3]',
      'aspect-[4/5]',
      'aspect-[1/1]',
      'aspect-[9/13]',
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="flex flex-col w-full pb-28 md:pb-24 bg-[#FFFFFF] min-h-screen">
      {/* Sticky Top Header - Responsive desktop & mobile */}
      <header className="sticky top-0 w-full z-40 pt-safe bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#F1F1F1]/60 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <HeaderLogo onNavigate={onNavigate} />

            {/* Desktop Center Search Bar (Expanded on medium & large screens) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative flex items-center w-full bg-[#F7F7F7] hover:bg-[#F4F4F4] focus-within:bg-white rounded-full px-4 py-2 border border-[#E5E5E5] focus-within:border-[#111111] transition-all shadow-xs">
                <span className="material-symbols-outlined text-[#6B6B6B] text-[20px] mr-2.5">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar inspiración, Botox, Balayage, Uñas, Estética..."
                  className="w-full bg-transparent text-[#111111] placeholder:text-[#6B6B6B] text-xs focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#6B6B6B] mr-1 hover:text-[#111111]"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
                <PhotoSearchButton onFile={photo.start} className="mr-1.5" />
                <button
                  type="button"
                  onClick={onOpenFilters}
                  aria-label="Filtrar búsqueda"
                  className="w-7 h-7 rounded-full bg-[#FDE7EE] hover:bg-[#B82E5F] text-[#B82E5F] hover:text-white flex items-center justify-center transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <NotificationBell onNavigate={onNavigate} unreadCount={unreadCount} />
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (Only shown below md) */}
        <div className="md:hidden px-4 pb-2.5 pt-0.5">
          <div className="relative flex items-center w-full bg-[#F7F7F7] rounded-full px-3.5 py-2 shadow-xs border border-[#E5E5E5] focus-within:border-[#111111] focus-within:bg-white transition-all">
            <span className="material-symbols-outlined text-[#6B6B6B] text-[18px] mr-2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar estilos, Botox, faciales, uñas..."
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
              aria-label="Filtrar búsqueda"
              className="w-7 h-7 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] active:scale-95 transition-transform shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          </div>
        </div>

        {/* Horizontal Category Navigation Chips */}
        <div className="w-full border-t border-[#F1F1F1]/40 bg-[#FFFFFF]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section
              aria-label="Filtros de categorías"
              className="flex overflow-x-auto no-scrollbar gap-2 py-2"
            >
              {filterCategories.map((item) => {
                const isActive = activeCategory === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      if (item.value === 'nearby') {
                        onNavigate({ name: 'explore' });
                      } else {
                        setActiveCategory(item.value);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#FDE7EE] text-[#B82E5F] shadow-xs'
                        : item.isIcon
                        ? 'bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2] flex items-center gap-1'
                        : 'bg-white text-[#444444] hover:text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5]/80'
                    }`}
                  >
                    {item.isIcon && (
                      <span className="material-symbols-outlined text-[14px]">near_me</span>
                    )}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </section>
          </div>
        </div>
      </header>

      {/* Main Content: True Pinterest-Style Masonry Stream */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-5">
        <PhotoSearchBanner search={photo} resultsLabel="looks" resultsCount={filteredLooks.length} />

        {/* Pinterest-like Multi-column Masonry Grid */}
        <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-3 md:gap-4 [column-fill:_balance]">
          {filteredLooks.map((look, idx) => {
            const isSaved = savedLookIds.includes(look.id);
            const mainImage = look.images[0];
            const aspectClass = getAspectRatioClass(look, idx);

            return (
              <article
                key={look.id}
                onClick={() => {
                  if (longPressFired.current) {
                    longPressFired.current = false;
                    return;
                  }
                  onNavigate({ name: 'look_detail', lookId: look.id });
                }}
                onPointerDown={(e) => startPress(e, look.id)}
                onPointerMove={movePress}
                onPointerUp={cancelPress}
                onPointerCancel={cancelPress}
                onPointerLeave={cancelPress}
                onContextMenu={(e) => e.preventDefault()}
                className="break-inside-avoid mb-3 md:mb-4 group cursor-pointer relative overflow-hidden rounded-2xl bg-[#F1F1F1] [-webkit-touch-callout:none] select-none"
              >
                <div className={`relative w-full ${aspectClass} overflow-hidden`}>
                  <img
                    src={mainImage.url}
                    alt={mainImage.alt || look.title}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />

                  {/* Solo en computadora: opciones al pasar el mouse */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-b from-black/35 via-transparent to-black/45">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(look.id);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`absolute top-3 right-3 h-9 px-4 rounded-full text-sm font-semibold transition-colors ${
                        isSaved
                          ? 'bg-white text-[#111111]'
                          : 'bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2]'
                      }`}
                    >
                      {isSaved ? 'Guardado' : 'Guardar'}
                    </button>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-sm font-semibold leading-tight line-clamp-2">
                        {look.title}
                      </p>
                      <p className="text-xs text-white/80 mt-0.5 truncate">{look.salonName}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Empty state if search/filter yield no results */}
        {filteredLooks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h3 className="text-base font-bold text-[#111111]">No se encontraron looks</h3>
            <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              No hay publicaciones que coincidan con &ldquo;{searchQuery || activeCategory}&rdquo;. Probá buscando &quot;Botox&quot;, &quot;Facial&quot; o &quot;Uñas&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Todos');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2 rounded-full bg-[#FDE7EE] text-[#B82E5F] text-xs font-bold shadow-xs hover:bg-[#FBD5E2] transition-all"
            >
              Ver todas las publicaciones
            </button>
          </div>
        )}
      </main>

      {/* Acciones de una publicación (mantener presionado) */}
      {menuLook && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
          onClick={() => {
            // ignora el click que llega al soltar el dedo tras la pulsación larga
            if (Date.now() - menuOpenedAt.current < 600) return;
            setMenuLookId(null);
          }}
        >
          <div
            role="dialog"
            aria-label="Opciones de la publicación"
            className="w-full max-w-md bg-white rounded-t-3xl p-2 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#D9D9D9] mx-auto mt-2 mb-3" />
            <div className="flex items-center gap-3 px-4 pb-3 mb-1 border-b border-[#F1F1F1]">
              <img
                src={menuLook.images[0].url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover bg-[#F1F1F1]"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111111] truncate">{menuLook.title}</p>
                <p className="text-xs text-[#6B6B6B] truncate">{menuLook.salonName}</p>
              </div>
            </div>
            {[
              {
                icon: savedLookIds.includes(menuLook.id) ? 'bookmark_remove' : 'bookmark_add',
                label: savedLookIds.includes(menuLook.id) ? 'Quitar de guardados' : 'Guardar',
                run: () => onToggleSave(menuLook.id),
              },
              {
                icon: 'visibility',
                label: 'Ver detalle',
                run: () => onNavigate({ name: 'look_detail', lookId: menuLook.id }),
              },
              {
                icon: 'storefront',
                label: 'Ir al salón',
                run: () => onNavigate({ name: 'salon_profile', salonId: menuLook.salonId }),
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (Date.now() - menuOpenedAt.current < 600) return;
                  setMenuLookId(null);
                  item.run();
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[#F7F7F7] text-left transition-colors"
              >
                <span className="material-symbols-outlined text-[22px] text-[#111111]">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-[#111111]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
