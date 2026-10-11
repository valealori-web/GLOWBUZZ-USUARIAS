/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ActiveScreen, Look, Salon } from './types';
import { distanceKm, formatDistance } from './lib/geo';
import { useUserLocation } from './lib/useUserLocation';
import { LOOKS_DATA, SALONS_DATA, INITIAL_NOTIFICATIONS, OTHER_USERS_DATA } from './data/mockData';
import { LoyaltyView } from './views/LoyaltyView';
import { BottomNavBar } from './components/BottomNavBar';
import { Toast } from './components/Toast';
import { ExternalBookingModal } from './components/ExternalBookingModal';
import { FilterSheetModal } from './components/FilterSheetModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { ShareSheetModal } from './components/ShareSheetModal';
import { SalonChatModal } from './components/SalonChatModal';

import { FeedView } from './views/FeedView';
import { ServiceDetailView } from './views/ServiceDetailView';
import { SalonProfileView } from './views/SalonProfileView';
import { ExploreMapView } from './views/ExploreMapView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { ReservationsView } from './views/ReservationsView';
import { OtherUserProfileView } from './views/OtherUserProfileView';

export default function App() {
  // Navigation State with history stack
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>({ name: 'feed' });
  const [history, setHistory] = useState<ActiveScreen[]>([]);

  // Application Data & Interactive States
  const [looks] = useState<Look[]>(LOOKS_DATA);
  const userLocation = useUserLocation();
  const salons = useMemo(() => {
    const result: Record<string, Salon> = {};
    for (const [id, data] of Object.entries(SALONS_DATA)) {
      const km = distanceKm(userLocation.position, data.coordinates);
      result[id] = { ...data, distanceKm: km, distance: formatDistance(km) };
    }
    return result;
  }, [userLocation.position]);
  const [savedLookIds, setSavedLookIds] = useState<string[]>([
    'look-kapping-cherry',
    'look-balayage-vainilla',
    'look-soft-glam-makeup',
    'look-laminado-cejas',
  ]);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastIcon, setToastIcon] = useState<string>('favorite');

  // External Booking Handover Modal State
  const [bookingData, setBookingData] = useState<{
    isOpen: boolean;
    salonName: string;
    serviceName?: string;
    stylistName?: string;
    price?: string;
    slot?: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }>({
    isOpen: false,
    salonName: 'Maison Hair Co. Studio',
    slot: 'Mañana 15:30 hs',
  });

  // Filter Sheet Modal State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    category: 'Todas',
    maxDistance: 'Todo Montevideo',
    availability: 'Cualquiera',
    minRating: 4.8,
    maxPrice: 30000,
  });

  // Onboarding / Interests Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Image Lightbox Modal State
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    url: string | null;
    caption?: string;
  }>({
    isOpen: false,
    url: null,
  });

  // Share Sheet Modal State
  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    url?: string;
  }>({
    isOpen: false,
    title: '',
  });

  // Salon Direct Chat Modal State
  const [chatData, setChatData] = useState<{
    isOpen: boolean;
    salon: Salon | null;
  }>({
    isOpen: false,
    salon: null,
  });

  // Show Toast Utility
  const showToast = (msg: string, icon = 'favorite') => {
    setToastMessage(msg);
    setToastIcon(icon);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Open Lightbox
  const handleOpenLightbox = (imageUrl: string, caption?: string) => {
    setLightboxData({
      isOpen: true,
      url: imageUrl,
      caption,
    });
  };

  // Open Share Sheet
  const handleOpenShare = (title: string, subtitle?: string, url?: string) => {
    setShareData({
      isOpen: true,
      title,
      subtitle,
      url,
    });
  };

  // Open Salon Chat
  const handleOpenChat = (salon: Salon) => {
    setChatData({
      isOpen: true,
      salon,
    });
  };

  // Navigation handlers
  const handleNavigate = (nextScreen: ActiveScreen) => {
    if (nextScreen.name === currentScreen.name) {
      // If same root tab, update parameters or scroll top
      setCurrentScreen(nextScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(nextScreen);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setHistory((prev) => prev.slice(0, prev.length - 1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen({ name: 'feed' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Toggle Save Look
  const handleToggleSave = (lookId: string) => {
    setSavedLookIds((prev) => {
      const exists = prev.includes(lookId);
      if (exists) {
        showToast('Eliminado de tus guardados', 'bookmark_border');
        return prev.filter((id) => id !== lookId);
      } else {
        showToast('¡Guardado en tus tableros de inspiración privada!', 'bookmark');
        return [...prev, lookId];
      }
    });
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Permanently dismiss a notification
  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  // Open external booking handover modal
  const handleOpenBooking = (details: {
    salonName: string;
    serviceName: string;
    stylistName?: string;
    price?: string;
    slot: string;
    provider?: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  }) => {
    setBookingData({
      isOpen: true,
      ...details,
    });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] flex flex-col font-['Inter',system-ui,sans-serif] selection:bg-[#F1F1F1] selection:text-[#111111]">
      {/* Toast Feedback Banner */}
      <Toast message={toastMessage} icon={toastIcon} />

      {/* Screen Router */}
      <div className="flex-1 flex flex-col">
        {currentScreen.name === 'feed' && (
          <FeedView
            looks={looks}
            savedLookIds={savedLookIds}
            onToggleSave={handleToggleSave}
            onNavigate={handleNavigate}
            onOpenFilters={() => setIsFilterOpen(true)}
            currentFilters={filterOptions}
            unreadCount={unreadNotificationsCount}
            onOpenShare={handleOpenShare}
          />
        )}

        {currentScreen.name === 'look_detail' && (
          (() => {
            const foundLook = looks.find((l) => l.id === currentScreen.lookId) || looks[0];
            const foundSalon = salons[foundLook.salonId] || salons['maison-hair-co'];
            return (
              <ServiceDetailView
                look={foundLook}
                salon={foundSalon}
                isSaved={savedLookIds.includes(foundLook.id)}
                onToggleSave={handleToggleSave}
                onNavigate={handleNavigate}
                onBack={handleBack}
                onOpenBooking={handleOpenBooking}
                onOpenLightbox={handleOpenLightbox}
                onOpenShare={handleOpenShare}
                onShowToast={showToast}
              />
            );
          })()
        )}

        {currentScreen.name === 'salon_profile' && (
          (() => {
            const foundSalon = salons[currentScreen.salonId] || salons['maison-hair-co'];
            return (
              <SalonProfileView
                salon={foundSalon}
                initialTab={currentScreen.initialTab}
                onNavigate={handleNavigate}
                onBack={handleBack}
                onOpenBooking={handleOpenBooking}
                onOpenChat={handleOpenChat}
                onOpenLightbox={handleOpenLightbox}
                onOpenShare={handleOpenShare}
                onShowToast={showToast}
              />
            );
          })()
        )}

        {currentScreen.name === 'user_profile' && (
          (() => {
            const foundUser =
              OTHER_USERS_DATA[currentScreen.userId] || Object.values(OTHER_USERS_DATA)[0];
            return (
              <OtherUserProfileView
                user={foundUser}
                onNavigate={handleNavigate}
                onBack={handleBack}
                onOpenLightbox={handleOpenLightbox}
                onOpenShare={handleOpenShare}
                onShowToast={showToast}
              />
            );
          })()
        )}

        {currentScreen.name === 'explore' && (
          <ExploreMapView
            salons={Object.values(salons)}
            looks={looks}
            onNavigate={handleNavigate}
            onBack={handleBack}
            canGoBack={history.length > 0}
            onOpenBooking={handleOpenBooking}
            onOpenFilters={() => setIsFilterOpen(true)}
            currentFilters={filterOptions}
            onShowToast={showToast}
            unreadCount={unreadNotificationsCount}
            initialSalonId={currentScreen.initialSalonId}
            userLocation={userLocation}
          />
        )}

        {currentScreen.name === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllNotificationsRead}
            onDismissNotification={handleDismissNotification}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onOpenBooking={handleOpenBooking}
            onShowToast={showToast}
          />
        )}

        {currentScreen.name === 'profile' && (
          <ProfileView
            looks={looks}
            savedLookIds={savedLookIds}
            initialTab={currentScreen.initialTab}
            onToggleSave={handleToggleSave}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onOpenLightbox={handleOpenLightbox}
            onShowToast={showToast}
            unreadCount={unreadNotificationsCount}
          />
        )}

        {currentScreen.name === 'loyalty' && (
          <LoyaltyView onNavigate={handleNavigate} onBack={handleBack} onShowToast={showToast} />
        )}

        {currentScreen.name === 'reservations' && (
          <ReservationsView
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onShowToast={showToast}
            unreadCount={unreadNotificationsCount}
          />
        )}
      </div>

      {/* Persistent Bottom Tab Bar visible across ALL screens as requested */}
      <BottomNavBar
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        unreadCount={unreadNotificationsCount}
      />

      {/* Simulated External Booking Handover Modal */}
      <ExternalBookingModal
        isOpen={bookingData.isOpen}
        onClose={() => setBookingData((prev) => ({ ...prev, isOpen: false }))}
        salonName={bookingData.salonName}
        serviceName={bookingData.serviceName}
        stylistName={bookingData.stylistName}
        price={bookingData.price}
        slot={bookingData.slot}
        provider={bookingData.provider}
        onBookingConfirmed={({ salon, service, slot }) => {
          showToast(`Derivación iniciada para ${service} en ${salon} (${slot})`, 'event_available');
        }}
      />

      {/* Advanced Filters Modal Sheet */}
      <FilterSheetModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={filterOptions}
        onApplyFilters={(filters) => {
          setFilterOptions(filters);
          showToast('Filtros aplicados con éxito', 'tune');
        }}
      />

      {/* Image Lightbox Full View Modal */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.url}
        caption={lightboxData.caption}
        onClose={() => setLightboxData({ isOpen: false, url: null })}
      />

      {/* Share Sheet Modal */}
      <ShareSheetModal
        isOpen={shareData.isOpen}
        title={shareData.title}
        subtitle={shareData.subtitle}
        url={shareData.url}
        onClose={() => setShareData({ isOpen: false, title: '' })}
        onShowToast={showToast}
      />

      {/* Salon Direct Chat Modal */}
      {chatData.salon && (
        <SalonChatModal
          isOpen={chatData.isOpen}
          salon={chatData.salon}
          onClose={() => setChatData({ isOpen: false, salon: null })}
          onOpenBooking={() => {
            const currentSalon = chatData.salon!;
            setChatData({ isOpen: false, salon: null });
            handleOpenBooking({
              salonName: currentSalon.name,
              serviceName: currentSalon.services[0]?.name || 'Turno coordinado por chat',
              slot: currentSalon.nextSlot,
              provider: currentSalon.externalBookingProvider,
            });
          }}
        />
      )}

      {/* Onboarding & Interests Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onCompleted={(interests) => {
          showToast(`Intereses actualizados: ${interests.length} categorías`, 'auto_awesome');
        }}
      />
    </div>
  );
}
