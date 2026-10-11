import React, { useState } from 'react';
import { HEADER_CONTAINER, HeaderLogo, NotificationBell, HeaderIconButton } from '../components/HeaderParts';
import { Look, ActiveScreen, SavedCollection } from '../types';
import { GlowBuzzLogo } from '../components/GlowBuzzLogo';
import { USER_AVATAR, INITIAL_SAVED_COLLECTIONS, BEAUTY_INTERESTS_LIST } from '../data/mockData';
import { P } from '../data/images';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { FollowersListModal } from '../components/FollowersListModal';
import { UploadLookModal } from '../components/UploadLookModal';

interface ProfileViewProps {
  looks: Look[];
  savedLookIds: string[];
  initialTab?: string;
  onToggleSave: (lookId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenBooking: (bookingDetails: {
    salonName: string;
    serviceName: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => void;
  onOpenLightbox?: (imageUrl: string, caption?: string) => void;
  onShowToast: (msg: string, icon?: string) => void;
  unreadCount: number;
}

interface UserPhoto {
  id: string;
  url: string;
  caption: string;
  rating: number;
  treatment?: string;
  salonName?: string;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  looks,
  savedLookIds,
  initialTab = 'guardados',
  onToggleSave,
  onNavigate,
  onOpenBooking,
  onOpenLightbox,
  onShowToast,
  unreadCount,
}) => {
  const [activeTab, setActiveTab] = useState<'guardados' | 'reservas' | 'fotos' | 'resenas'>(
    (initialTab as any) || 'guardados'
  );
  const [collections, setCollections] = useState<SavedCollection[]>(INITIAL_SAVED_COLLECTIONS);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [bioText, setBioText] = useState(
    'Amante del skincare, el balayage cálido y nail art minimalista ✨ Montevideo'
  );
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [interests, setInterests] = useState<string[]>(['nails', 'hair_color', 'brows']);
  const [draftInterests, setDraftInterests] = useState<string[]>(interests);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [followersTab, setFollowersTab] = useState<'following' | 'followers'>('following');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderFilterKey, setNewFolderFilterKey] = useState('Uñas');

  // User Photos State
  const [userPhotos, setUserPhotos] = useState<UserPhoto[]>([
    {
      id: 'photo-1',
      url: P.c15,
      caption: 'Lifting y nutrición de pestañas en Brow Bar Atelier',
      rating: 4.9,
      treatment: 'Lifting de pestañas',
      salonName: 'Brow Bar Atelier',
    },
    {
      id: 'photo-2',
      url: P.u04,
      caption: 'Kapping Gel Cherry wine en Studio Velvet Nails',
      rating: 5.0,
      treatment: 'Kapping Gel Cherry',
      salonName: 'Studio Velvet Nails',
    },
    {
      id: 'photo-3',
      url: P.u02,
      caption: 'Ondas con movimiento post-baño de brillo en Maison Hair Co.',
      rating: 5.0,
      treatment: 'Balayage & Styling',
      salonName: 'Maison Hair Co. Studio',
    },
  ]);

  // Handle uploaded look
  const handleAddLook = (newLook: {
    imageUrl: string;
    caption: string;
    salonName: string;
    salonId: string;
    treatment: string;
    rating: number;
  }) => {
    const item: UserPhoto = {
      id: `photo-${Date.now()}`,
      url: newLook.imageUrl,
      caption: newLook.caption,
      rating: newLook.rating,
      treatment: newLook.treatment,
      salonName: newLook.salonName,
    };
    setUserPhotos((prev) => [item, ...prev]);
  };

  // Handle create new private collection folder
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: SavedCollection = {
      id: `col-${Date.now()}`,
      name: newFolderName.trim(),
      count: 0,
      icon: 'folder_special',
      filterKey: newFolderFilterKey,
    };
    setCollections((prev) => [...prev, newFolder]);
    setSelectedCollection(newFolder.id);
    onShowToast(`Carpeta "${newFolderName}" creada con éxito`, 'create_new_folder');
    setNewFolderName('');
    setIsNewFolderModalOpen(false);
  };

  // Filtered saved looks based on user selections
  const savedLooks = looks
    .filter((l) => savedLookIds.includes(l.id))
    .filter((l) => {
      if (!selectedCollection) return true;
      const col = collections.find((c) => c.id === selectedCollection);
      if (!col) return true;
      if (col.filterKey) {
        return l.category.toLowerCase().includes(col.filterKey.toLowerCase());
      }
      return l.title.toLowerCase().includes(col.name.toLowerCase());
    });

  const tabs: { id: typeof activeTab; icon: string; label: string; count?: number }[] = [
    { id: 'guardados', icon: 'bookmark', label: 'Guardados', count: savedLooks.length },
    { id: 'reservas', icon: 'event_available', label: 'Reservas' },
    { id: 'fotos', icon: 'photo_camera', label: 'Mis fotos', count: userPhotos.length },
    { id: 'resenas', icon: 'rate_review', label: 'Reseñas' },
  ];

  const menuItems = [
    {
      icon: 'settings',
      label: 'Configuración de la cuenta',
      onClick: () => setIsSettingsOpen(true),
    },
    {
      icon: 'stars',
      label: 'Puntos Glow',
      hint: '1.240 puntos',
      onClick: () => onNavigate({ name: 'loyalty' }),
    },
    {
      icon: 'add_a_photo',
      label: 'Subir un look',
      onClick: () => setIsUploadModalOpen(true),
    },
    {
      icon: 'create_new_folder',
      label: 'Nueva colección',
      onClick: () => {
        setActiveTab('guardados');
        setIsNewFolderModalOpen(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full pb-24 bg-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl border-b border-[#EFEFEF]">
        <div className={HEADER_CONTAINER}>
          <HeaderLogo onNavigate={onNavigate} />
          <div className="flex items-center gap-1">
            <NotificationBell onNavigate={onNavigate} unreadCount={unreadCount} />
            <HeaderIconButton icon="menu" label="Abrir menú" onClick={() => setIsMenuOpen(true)} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full pt-16 max-w-3xl mx-auto">
        {/* Avatar + stats */}
        <section className="px-5 pt-5">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#F1F1F1] shrink-0">
              <img alt="Valentina Rossi" className="w-full h-full object-cover" src={USER_AVATAR} />
            </div>

            <div className="flex-1 grid grid-cols-3 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('fotos')}
                className="flex flex-col items-center py-1 rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                <span className="text-lg font-semibold text-[#111111] leading-tight">
                  {userPhotos.length}
                </span>
                <span className="text-xs text-[#6B6B6B]">Looks</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFollowersTab('followers');
                  setIsFollowersOpen(true);
                }}
                className="flex flex-col items-center py-1 rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                <span className="text-lg font-semibold text-[#111111] leading-tight">380</span>
                <span className="text-xs text-[#6B6B6B]">Seguidores</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFollowersTab('following');
                  setIsFollowersOpen(true);
                }}
                className="flex flex-col items-center py-1 rounded-lg hover:bg-[#F7F7F7] transition-colors"
              >
                <span className="text-lg font-semibold text-[#111111] leading-tight">142</span>
                <span className="text-xs text-[#6B6B6B]">Siguiendo</span>
              </button>
            </div>
          </div>

          {/* Name, handle, bio */}
          <div className="mt-4">
            <h1 className="text-sm font-semibold text-[#111111]">Valentina Rossi</h1>
            <p className="text-xs text-[#6B6B6B]">@valen.glow</p>
            {!isEditingBio && (
              <p className="text-sm text-[#111111] mt-2 leading-snug max-w-2xl">{bioText}</p>
            )}
          </div>

          {/* Edit profile */}
          {isEditingBio ? (
            <div className="mt-4 flex flex-col gap-4 p-4 rounded-2xl border border-[#E5E5E5]">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[#6B6B6B]">Biografía</span>
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-[#E5E5E5] bg-white text-[#111111] focus:outline-none focus:border-[#111111] resize-none"
                  rows={3}
                />
              </label>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-[#6B6B6B]">Intereses</span>
                <div className="flex flex-wrap gap-1.5">
                  {BEAUTY_INTERESTS_LIST.map((item) => {
                    const active = draftInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setDraftInterests((prev) =>
                            active ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          active
                            ? 'bg-[#FDE7EE] text-[#B82E5F]'
                            : 'bg-white text-[#444444] border border-[#E5E5E5] hover:border-[#111111]'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="flex-1 h-9 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-sm font-semibold hover:bg-[#FBD5E2] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInterests(draftInterests);
                    setIsEditingBio(false);
                    onShowToast('Perfil actualizado', 'check');
                  }}
                  className="flex-1 h-9 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-sm font-semibold hover:bg-[#FBD5E2] transition-colors"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftInterests(interests);
                setIsEditingBio(true);
              }}
              className="mt-4 w-full h-9 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-sm font-semibold hover:bg-[#FBD5E2] transition-colors"
            >
              Editar perfil
            </button>
          )}
        </section>

        {/* Next appointment + loyalty */}
        <section className="px-5 mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onNavigate({ name: 'reservations' })}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors text-left"
          >
<span className="w-10 h-10 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">calendar_clock</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs text-[#6B6B6B]">Próxima cita · En 3 días</span>
              <span className="block text-sm font-medium text-[#111111] truncate">
                Maison Hair Co. · Mar 24, 15:30
              </span>
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#8A8A8A]">
              chevron_right
            </span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate({ name: 'loyalty' })}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#571C31] hover:bg-[#3E1222] transition-colors text-left"
          >
            <span className="w-10 h-10 rounded-full bg-white/10 text-[#FFC83D] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">stars</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs text-[#F5DCE5]/80">Puntos Glow</span>
              <span className="block text-sm font-bold text-white">1.240 puntos</span>
            </span>
            <span className="material-symbols-outlined text-[20px] text-[#F5DCE5]/70">chevron_right</span>
          </button>
        </section>

        {/* Tabs (icons, Instagram-style) */}
        <nav
          className="mt-5 sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EFEFEF] grid grid-cols-4"
          role="tablist"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label}
                onClick={() => setActiveTab(tab.id)}
                className={`h-12 flex items-center justify-center border-b-2 transition-colors ${
                  active
                    ? 'border-[#111111] text-[#111111]'
                    : 'border-transparent text-[#8A8A8A] hover:text-[#111111]'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
                >
                  {tab.icon}
                </span>
              </button>
            );
          })}
        </nav>

        {/* TAB 1: Guardados (Functional Collections Filtering) */}
        {activeTab === 'guardados' && (
          <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
            {/* Collections Quick Tray with Working Filtering */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedCollection(null)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCollection === null
                    ? 'bg-[#FDE7EE] text-[#B82E5F]'
                    : 'bg-[#F1F1F1] text-[#444444]'
                }`}
              >
                <span>Todos</span>
              </button>
              {collections.map((col) => {
                const isSelected = selectedCollection === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() =>
                      setSelectedCollection(isSelected ? null : col.id)
                    }
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDE7EE] text-[#B82E5F] font-semibold'
                        : 'bg-[#F1F1F1] text-[#111111] hover:bg-[#F1F1F1]/80'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {col.icon}
                    </span>
                    <span>{col.name}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(true)}
                aria-label="Nueva colección"
                className="shrink-0 w-8 h-8 rounded-full border border-[#E5E5E5] text-[#444444] flex items-center justify-center hover:border-[#111111] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>

            {/* Editorial Multi-column Beauty Inspiration Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {savedLooks.map((look) => {
                const img = look.images[0];
                return (
                  <div
                    key={look.id}
                    className="flex flex-col group cursor-pointer"
                    onClick={() => onNavigate({ name: 'look_detail', lookId: look.id })}
                  >
                    <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-[#F1F1F1] shadow-xs border border-[#E5E5E5]/50">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(look.id);
                        }}
                        aria-label="Favorito guardado"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md text-[#111111] flex items-center justify-center shadow-xs"
                      >
                        <span
                          className="material-symbols-outlined text-[16px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          bookmark
                        </span>
                      </button>
                    </div>

                    <div className="mt-1.5 px-0.5">
                      <h4 className="text-xs font-bold text-[#111111] line-clamp-1">
                        {look.title}
                      </h4>
                      <p className="text-[11px] text-[#6B6B6B] truncate">
                        {look.salonName} · {look.price}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {savedLooks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="material-symbols-outlined text-[36px] text-[#D9D9D9] mb-2">
                  bookmark_border
                </span>
                <p className="text-sm font-bold text-[#111111]">No hay looks en esta colección</p>
                <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs">
                  {selectedCollection
                    ? 'Probá seleccionando "Todos los guardados" o guardá más trabajos reales desde el Inicio.'
                    : 'Guardá los trabajos reales que te gusten desde el Inicio tocando el ícono de bookmark.'}
                </p>
                {selectedCollection && (
                  <button
                    type="button"
                    onClick={() => setSelectedCollection(null)}
                    className="mt-3 px-4 py-2 rounded-full bg-[#FDE7EE] text-[#B82E5F] text-xs font-bold"
                  >
                    Ver todos los guardados
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Mis Reservas */}
        {activeTab === 'reservas' && (
          <div className="px-5 pt-4 pb-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#111111]">Historial de Visitas</h3>
              <span className="text-[11px] text-[#6B6B6B]">3 completadas en 2024</span>
            </div>

            {/* Past Booking 1 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-2 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] font-bold">
                    <span className="material-symbols-outlined text-[20px]">content_cut</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">
                      Corte Bob Texturado &amp; Baño de Brillo
                    </h4>
                    <p className="text-[11px] text-[#6B6B6B]">
                      Maison Hair Co. · Atendido por Lucas
                    </p>
                  </div>
                </div>
                <span className="bg-[#F1F1F1] text-[#444444] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Completado
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F4] text-xs text-[#444444]">
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
                  className="text-[#111111] font-semibold hover:underline"
                >
                  Volver a reservar
                </button>
              </div>
            </div>

            {/* Past Booking 2 */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-2 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F] font-bold">
                    <span className="material-symbols-outlined text-[20px]">brush</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#111111]">
                      Kapping Gel + Esmaltado Semipermanente
                    </h4>
                    <p className="text-[11px] text-[#6B6B6B]">
                      Studio Velvet Nails · Atendido por Camila
                    </p>
                  </div>
                </div>
                <span className="bg-[#F1F1F1] text-[#444444] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Completado
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#F4F4F4] text-xs text-[#444444]">
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
                  className="text-[#111111] font-semibold hover:underline"
                >
                  Volver a reservar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Mis Fotos Subidas (Functional Subir look + Lightbox Zoom) */}
        {activeTab === 'fotos' && (
          <div className="px-5 pt-4 pb-8 flex flex-col gap-4">
            <div className="bg-[#F1F1F1] text-[#111111] p-4 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#111111] text-[24px]">
                  verified_user
                </span>
                <div>
                  <h4 className="text-xs font-bold">Comunidad Verificada</h4>
                  <p className="text-[11px] text-[#444444]">
                    Tus fotos ayudan a otras a elegir su estilista ideal.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#FDE7EE] text-[#B82E5F] rounded-full text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-transform shrink-0"
              >
                Subir look
              </button>
            </div>

            {/* Photo Grid with Zoom Lightbox Click */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 md:gap-3">
              {userPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onOpenLightbox?.(photo.url, photo.caption)}
                  className="aspect-square rounded-2xl overflow-hidden bg-[#F1F1F1] relative shadow-xs cursor-pointer group hover:scale-102 transition-transform"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                    <span className="material-symbols-outlined text-[18px]">zoom_in</span>
                  </div>
                  <span className="absolute bottom-1 right-1 text-white text-[9px] bg-black/60 backdrop-blur-xs px-1.5 py-0.5 rounded-full font-bold">
                    {photo.rating.toFixed(1)} ★
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Mis Reseñas */}
        {activeTab === 'resenas' && (
          <div className="px-5 pt-4 pb-8 flex flex-col gap-3">
            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#111111]">Maison Hair Co. Studio</h4>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                &ldquo;Lucas entendió exactamente el tono de balayage cálido que quería sin maltratar mi pelo. El servicio de café y el masaje capilar fueron un 10. ¡Vuelvo siempre!&rdquo;
              </p>
              <span className="text-[10px] text-[#6B6B6B] mt-1">
                Septiembre 2024 · Servicio Verificado
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E5E5E5] flex flex-col gap-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#111111]">Studio Velvet Nails</h4>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="material-symbols-outlined text-[15px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#444444] leading-relaxed">
                &ldquo;El kapping quedó impecable y duró más de 3 semanas sin saltarse. Muy detallistas con la cutícula rusa.&rdquo;
              </p>
              <span className="text-[10px] text-[#6B6B6B] mt-1">
                Agosto 2024 · Servicio Verificado
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Menu sheet */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Menú"
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-2 pb-6 sm:pb-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#D9D9D9] mx-auto mt-2 mb-2 sm:hidden" />
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  item.onClick();
                }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[#F7F7F7] transition-colors text-left"
              >
                <span className="w-10 h-10 rounded-full bg-[#FDE7EE] text-[#B82E5F] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                </span>
                <span className="flex-1 text-sm font-medium text-[#111111]">{item.label}</span>
                {item.hint && <span className="text-xs text-[#6B6B6B]">{item.hint}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowToast={onShowToast}
      />

      {/* Followers & Following Modal */}
      <FollowersListModal
        isOpen={isFollowersOpen}
        initialTab={followersTab}
        onClose={() => setIsFollowersOpen(false)}
        onNavigate={onNavigate}
        onShowToast={onShowToast}
      />

      {/* Upload Look Modal */}
      <UploadLookModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadLook={handleAddLook}
        onShowToast={onShowToast}
      />

      {/* Create New Folder Modal */}
      {isNewFolderModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsNewFolderModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl flex flex-col gap-3 border border-[#F1F1F1]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-[#F4F4F4]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#111111] text-[20px]">
                  create_new_folder
                </span>
                <h3 className="text-sm font-bold text-[#111111]">Nueva Carpeta Privada</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFolderModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FDE7EE] flex items-center justify-center text-[#B82E5F]"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewFolder} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#111111]">Nombre de la carpeta</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Ej: Inspo Balayage Rubio, Uñas Fiesta..."
                  className="w-full p-2.5 rounded-xl border border-[#D9D9D9] text-xs text-[#111111] outline-none focus:border-[#111111]"
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#111111]">Categoría asociada</label>
                <select
                  value={newFolderFilterKey}
                  onChange={(e) => setNewFolderFilterKey(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D9D9D9] text-xs text-[#111111] outline-none"
                >
                  <option value="Uñas">Uñas &amp; Manicuría</option>
                  <option value="Pelo & Color">Pelo &amp; Color</option>
                  <option value="Cejas & Pestañas">Cejas &amp; Pestañas</option>
                  <option value="Maquillaje">Maquillaje</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-[#FDE7EE] text-[#B82E5F] font-bold text-xs shadow-md mt-1 active:scale-98 transition-transform"
              >
                Crear Colección
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
