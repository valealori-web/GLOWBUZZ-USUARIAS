export type LookCategory =
  | 'Uñas'
  | 'Pelo & Color'
  | 'Cejas & Pestañas'
  | 'Maquillaje'
  | 'Estética Facial'
  | 'Botox & Armonización';

export interface Look {
  id: string;
  /** Servicio del comercio conectado al que corresponde este trabajo. */
  liveServiceId?: string;
  title: string;
  category: LookCategory;
  categoryLabel: string;
  salonId: string;
  salonName: string;
  salonInitials: string;
  stylistName?: string;
  aspectRatio?: 'tall' | 'portrait' | 'square' | 'standard';
  location: string;
  price: string;
  priceNumeric: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  savedCount: string;
  badge?: string;
  verified: boolean;
  highDemand?: boolean;
  images: {
    url: string;
    caption: string;
    alt: string;
  }[];
  description: string;
  specs: {
    estimatedPrice: string;
    sessionDuration: string;
    products?: string;
  };
  clientReviews: {
    clientName: string;
    clientAvatar: string;
    userId?: string;
    verified: boolean;
    date: string;
    rating: number;
    comment: string;
    photos?: string[];
    highlightTag?: string;
  }[];
  similarLooks: {
    id: string;
    title: string;
    salon: string;
    salonId?: string;
    price: string;
    rating: number;
    reviewsCount: number;
    tag: string;
    image: string;
  }[];
}

export interface SalonData {
  id: string;
  name: string;
  initials: string;
  logo: string;
  coverImage: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: string;
  worksCount: number;
  bio: string;
  address: string;
  neighborhood: string;
  city?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  socialProof: string;
  mutualFollowers: {
    avatar: string;
    name: string;
    userId?: string;
  }[];
  openingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  services: {
    id: string;
    category: string;
    name: string;
    description: string;
    duration: string;
    price: string;
    priceNumeric: number;
    includesNotes?: string;
  }[];
  portfolio: {
    id: string;
    title: string;
    technique: string;
    stylist: string;
    price: string;
    duration: string;
    image: string;
    alt: string;
    lookId?: string;
  }[];
  clientProofs: {
    id: string;
    clientName: string;
    clientAvatar: string;
    userId?: string;
    treatment: string;
    timeframe: string;
    rating: number;
    image: string;
    caption: string;
    quote: string;
    likes: number;
    price: string;
  }[];
  reviews: {
    id: string;
    author: string;
    avatar: string;
    userId?: string;
    verified: boolean;
    rating: number;
    date: string;
    comment: string;
    photos?: string[];
  }[];
  nextSlot: string;
  externalBookingProvider: 'Fresha' | 'Timely' | 'Calendly' | 'WhatsApp';
  /** Solo para comercios conectados a GlowBuzz Business: permite reservar directo en su agenda. */
  live?: {
    businessId: string;
    hours: LiveHour[];
    services: LiveService[];
  };
}

export interface LiveHour {
  day: string;
  open: string;
  close: string;
  active: boolean;
}

export interface LiveService {
  id: string;
  name: string;
  professionalId: string;
  professionalName: string;
  durationMinutes: number;
  priceUYU: number;
}

/** Reserva hecha desde esta app en la agenda de un comercio conectado. */
export interface LiveBooking {
  id: string;
  businessId: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
  priceUYU: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

/** Salón enriquecido con la distancia al usuario (calculada en runtime). */
export interface Salon extends SalonData {
  /** Texto listo para mostrar, ej. "a 1.2 km". Vacío si no se conoce la ubicación. */
  distance: string;
  distanceKm: number | null;
}

export interface NotificationItem {
  id: string;
  category: 'turnos' | 'espera' | 'inspiracion' | 'todas';
  section: 'hoy' | 'esta_semana' | 'anteriores';
  tag: string;
  timeAgo: string;
  title: string;
  body: string;
  unread: boolean;
  salonId?: string;
  lookId?: string;
  actionText?: string;
  actionType?: 'book_slot' | 'view_details' | 'explore' | 'redeem_points';
  actionData?: {
    salonName?: string;
    serviceName?: string;
    slot?: string;
    location?: string;
  };
  thumbnail?: string;
  photoReel?: {
    image: string;
    label: string;
  }[];
  pointsBadge?: string;
}

export interface SavedCollection {
  id: string;
  name: string;
  count: number;
  icon: string;
  filterKey?: string; // category tag like 'Uñas', 'Pelo & Color', etc.
}

export interface OtherUserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  city: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  badge?: string;
  sharedPhotos: {
    id: string;
    url: string;
    caption: string;
    salonName: string;
    salonId?: string;
    treatment: string;
    rating: number;
    likes: number;
  }[];
  favoriteCollections: {
    id: string;
    name: string;
    count: number;
    coverUrl: string;
  }[];
}

export interface FilterOptions {
  category: string;
  maxDistance: string;
  availability: string;
  minRating: number;
  maxPrice: number;
  searchQuery?: string;
}

export type ActiveScreen = 
  | { name: 'feed' }
  | { name: 'look_detail'; lookId: string }
  | { name: 'salon_profile'; salonId: string; initialTab?: string }
  | { name: 'user_profile'; userId: string }
  | { name: 'explore'; initialQuery?: string; initialSalonId?: string }
  | { name: 'notifications' }
  | { name: 'profile'; initialTab?: string }
  | { name: 'reservations' }
  | { name: 'loyalty' }
  | { name: 'onboarding'; step: 'auth' | 'interests' };
