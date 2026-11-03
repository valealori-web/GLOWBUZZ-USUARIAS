import { Look, LiveBooking, LiveHour, LiveService, SalonData } from '../types';
import { monogram } from '../data/images';
import { sbInsert, sbSelect } from './supabase';

/** Usuaria de la demo (la misma del perfil de la app). */
export const DEMO_USER = {
  id: 'usuaria-demo',
  name: 'Valentina Rossi',
  phone: '+598 91 303 912',
  email: 'valentina.rossi@example.com',
};

// ---------- Formato ----------
const money = (n: number): string => `$ ${n.toLocaleString('es-UY')}`;

export const durationLabel = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h}h ${m}m`;
  return h ? `${h}h` : `${m}m`;
};

export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const compact = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n));

// ---------- Filas de la base ----------
interface BusinessRow {
  id: string;
  name: string;
  description: string;
  categories: string[];
  location: string;
  address: string;
  avatar_url: string;
  cover_url: string;
  hours: LiveHour[];
  rating: number;
  reviews_count: number;
}

interface ServiceRow {
  id: string;
  name: string;
  category: string;
  description: string;
  duration_minutes: number;
  price_uyu: number;
  price_prefix: string | null;
  professional_id: string;
  professional_name: string;
}

interface WorkRow {
  id: string;
  title: string;
  service_id: string;
  service_name: string;
  professional_name: string;
  price_uyu: number;
  description: string;
  image_url: string;
  source: 'my_work' | 'client_ugc';
  client_name: string | null;
  review_rating: number | null;
  review_text: string | null;
  views: number;
  saves: number;
}

interface BookingRow {
  id: string;
  business_id: string;
  service_name: string;
  professional_name: string;
  date: string;
  time: string;
  price_uyu: number;
  status: LiveBooking['status'];
}

const lookCategory = (serviceCategory: string): Look['category'] =>
  /pesta|ceja/i.test(serviceCategory) ? 'Cejas & Pestañas' : 'Uñas';

const categoryLabel = (category: Look['category']): string =>
  category === 'Uñas' ? 'Uñas & Manicuría' : 'Cejas & Pestañas';

const hoursText = (hours: LiveHour[], names: string[]): string => {
  const found = hours.find((h) => names.includes(h.day) && h.active);
  return found ? `${found.open} - ${found.close}` : 'Cerrado';
};

// ---------- Catálogo de comercios conectados ----------
export interface LiveCatalog {
  salons: Record<string, SalonData>;
  looks: Look[];
}

export const fetchLiveCatalog = async (): Promise<LiveCatalog | null> => {
  const businesses = await sbSelect<BusinessRow>('businesses', 'published=eq.true');
  if (!businesses || businesses.length === 0) return null;

  const salons: Record<string, SalonData> = {};
  const looks: Look[] = [];

  for (const biz of businesses) {
    const [services, works] = await Promise.all([
      sbSelect<ServiceRow>('services', `business_id=eq.${biz.id}&active=eq.true&order=price_uyu.asc`),
      sbSelect<WorkRow>('works', `business_id=eq.${biz.id}&status=eq.approved&order=views.desc`),
    ]);
    if (!services || !works) return null;

    const serviceById = new Map(services.map((s) => [s.id, s]));
    const myWorks = works.filter((w) => w.source === 'my_work');
    const clientWorks = works.filter((w) => w.source === 'client_ugc');
    const neighborhood = biz.location.split(',')[0]?.trim() || biz.location;

    const bizLooks: Look[] = myWorks.map((w) => {
      const service = serviceById.get(w.service_id);
      const category = lookCategory(service?.category ?? '');
      const duration = service ? durationLabel(service.duration_minutes) : '1h';
      return {
        id: `live-${w.id}`,
        liveServiceId: w.service_id,
        title: w.title,
        category,
        categoryLabel: categoryLabel(category),
        salonId: biz.id,
        salonName: biz.name,
        salonInitials: biz.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
        stylistName: w.professional_name.split('·')[0].trim(),
        location: biz.location,
        price: `Desde ${money(w.price_uyu)}`,
        priceNumeric: w.price_uyu,
        duration: `${duration} de sesión`,
        rating: biz.rating,
        reviewsCount: biz.reviews_count,
        savedCount: compact(w.saves),
        badge: 'Trabajo real verificado',
        verified: true,
        highDemand: w.views > 3000,
        images: [{ url: w.image_url, caption: w.title, alt: w.title }],
        description: w.description,
        specs: { estimatedPrice: money(w.price_uyu), sessionDuration: duration },
        clientReviews: [],
        similarLooks: [],
      };
    });
    looks.push(...bizLooks);

    salons[biz.id] = {
      id: biz.id,
      name: biz.name,
      initials: biz.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
      logo: biz.avatar_url || monogram(biz.name),
      coverImage: biz.cover_url,
      verified: true,
      rating: biz.rating,
      reviewsCount: biz.reviews_count,
      followersCount: '312',
      worksCount: myWorks.length,
      bio: biz.description,
      address: biz.address,
      neighborhood,
      city: 'Montevideo',
      coordinates: { lat: -34.9112, lng: -56.1461 },
      socialProof: 'Comercio conectado a GlowBuzz Business',
      mutualFollowers: [],
      openingHours: {
        weekdays: hoursText(biz.hours, ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']),
        saturday: hoursText(biz.hours, ['Sábado']),
        sunday: hoursText(biz.hours, ['Domingo']),
      },
      services: services.map((s) => ({
        id: s.id,
        category: s.category,
        name: s.name,
        description: s.description,
        duration: durationLabel(s.duration_minutes),
        price: `${s.price_prefix ? `${s.price_prefix} ` : ''}${money(s.price_uyu)}`,
        priceNumeric: s.price_uyu,
      })),
      portfolio: bizLooks.map((look, i) => ({
        id: `p-${myWorks[i].id}`,
        title: myWorks[i].title,
        technique: myWorks[i].service_name,
        stylist: look.stylistName ?? '',
        price: look.price,
        duration: look.specs.sessionDuration,
        image: myWorks[i].image_url,
        alt: myWorks[i].title,
        lookId: look.id,
      })),
      clientProofs: clientWorks.map((w) => ({
        id: `proof-${w.id}`,
        clientName: w.client_name ?? 'Clienta',
        clientAvatar: monogram(w.client_name ?? 'Clienta'),
        treatment: w.service_name,
        timeframe: 'Hace unas semanas',
        rating: w.review_rating ?? 5,
        image: w.image_url,
        caption: w.title,
        quote: w.review_text ?? w.description,
        likes: w.saves,
        price: money(w.price_uyu),
      })),
      reviews: [],
      nextSlot: 'Elegí día y hora',
      externalBookingProvider: 'WhatsApp',
      live: {
        businessId: biz.id,
        hours: biz.hours,
        services: services.map<LiveService>((s) => ({
          id: s.id,
          name: s.name,
          professionalId: s.professional_id,
          professionalName: s.professional_name,
          durationMinutes: s.duration_minutes,
          priceUYU: s.price_uyu,
        })),
      },
    };
  }

  return { salons, looks };
};

// ---------- Disponibilidad ----------
export interface BusySlot {
  date: string;
  time: string;
  duration_minutes: number;
  professional_id: string;
}

export const fetchBusySlots = async (businessId: string, fromDate: string): Promise<BusySlot[]> =>
  (await sbSelect<BusySlot>(
    'bookings',
    `select=date,time,duration_minutes,professional_id&business_id=eq.${businessId}&date=gte.${fromDate}&status=neq.cancelled`
  )) ?? [];

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toHHmm = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** El comercio atiende ese día de la semana. */
export const isOpenOn = (hours: LiveHour[], date: Date): boolean =>
  hours.some((h) => h.day === WEEKDAYS[date.getDay()] && h.active);

/** Horarios de inicio (cada 30 min) que entran en el horario de atención y no pisan otro turno de la profesional. */
export const buildSlots = (
  hours: LiveHour[],
  date: Date,
  durationMinutes: number,
  professionalId: string,
  busy: BusySlot[],
  now: Date = new Date()
): string[] => {
  const day = hours.find((h) => h.day === WEEKDAYS[date.getDay()] && h.active);
  if (!day) return [];
  const dateKey = toDateKey(date);
  const taken = busy
    .filter((b) => b.date === dateKey && b.professional_id === professionalId)
    .map((b) => [toMinutes(b.time), toMinutes(b.time) + b.duration_minutes] as const);
  const isToday = dateKey === toDateKey(now);
  const earliest = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : 0;

  const slots: string[] = [];
  for (let start = toMinutes(day.open); start + durationMinutes <= toMinutes(day.close); start += 30) {
    if (start < earliest) continue;
    const end = start + durationMinutes;
    if (taken.some(([from, to]) => start < to && end > from)) continue;
    slots.push(toHHmm(start));
  }
  return slots;
};

// ---------- Reservas ----------
export interface NewLiveBooking {
  businessId: string;
  service: LiveService;
  date: string;
  time: string;
}

export const createLiveBooking = async ({ businessId, service, date, time }: NewLiveBooking): Promise<boolean> =>
  sbInsert('bookings', {
    id: `ub_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    business_id: businessId,
    client_user_id: DEMO_USER.id,
    client_name: DEMO_USER.name,
    client_phone: DEMO_USER.phone,
    client_email: DEMO_USER.email,
    service_id: service.id,
    service_name: service.name,
    professional_id: service.professionalId,
    professional_name: service.professionalName,
    date,
    time,
    duration_minutes: service.durationMinutes,
    price_uyu: service.priceUYU,
    status: 'pending',
    source: 'GlowBuzz Feed',
  });

export const fetchMyBookings = async (): Promise<LiveBooking[] | null> => {
  const rows = await sbSelect<BookingRow>('bookings', `client_user_id=eq.${DEMO_USER.id}&order=created_at.desc`);
  return rows
    ? rows.map((r) => ({
        id: r.id,
        businessId: r.business_id,
        serviceName: r.service_name,
        professionalName: r.professional_name,
        date: r.date,
        time: r.time,
        priceUYU: r.price_uyu,
        status: r.status,
      }))
    : null;
};
