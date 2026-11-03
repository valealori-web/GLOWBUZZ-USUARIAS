import React, { useState } from 'react';
import { HEADER_CONTAINER, HeaderLogo, NotificationBell, HeaderIconButton } from '../components/HeaderParts';
import { Look, ActiveScreen, SavedCollection } from '../types';
import { monogram } from '../data/images';
import { AccountSettingsModal } from '../components/AccountSettingsModal';
import { LiveReservations } from '../components/LiveReservations';
import { useCurrentUser } from '../context/AuthContext';

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
  /** Nombre de cada comercio por id, para mostrar las reservas. */
  salonNames?: Record<string, string>;
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
  salonNames = {},
}) => {
  const me = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'guardados' | 'reservas'>(initialTab === 'reservas' ? 'reservas' : 'guardados');
  const [collections, setCollections] = useState<SavedCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderFilterKey, setNewFolderFilterKey] = useState('Uñas');

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
  ];

  const menuItems = [
    {
      icon: 'settings',
      label: 'Mi cuenta',
      onClick: () => setIsSettingsOpen(true),
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
        {/* Avatar + datos de la cuenta */}
        <section className="px-5 pt-5">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#F1F1F1] shrink-0">
              <img alt={me.name} className="w-full h-full object-cover" src={monogram(me.name)} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-[#111111] truncate">{me.name}</h1>
              <p className="text-xs text-[#6B6B6B] truncate">{me.email}</p>
              {me.phone && <p className="text-xs text-[#6B6B6B] truncate">{me.phone}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="mt-4 w-full h-9 rounded-lg bg-[#FDE7EE] text-[#B82E5F] text-sm font-semibold hover:bg-[#FBD5E2] transition-colors"
          >
            Editar perfil
          </button>
        </section>

        {/* Tabs (icons, Instagram-style) */}
        <nav
          className="mt-5 sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#EFEFEF] grid grid-cols-2"
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

        {/* TAB 2: Mis reservas */}
        {activeTab === 'reservas' && (
          <div className="px-5 pt-2 pb-8">
            <LiveReservations salonNames={salonNames} />
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
