import { Look, Salon } from '../types';
import { supabase } from './supabase';

export const PHOTO_CATEGORIES = [
  'Uñas',
  'Pelo & Color',
  'Cejas & Pestañas',
  'Maquillaje',
  'Estética Facial',
  'Botox & Armonización',
] as const;

export interface PhotoSearchResult {
  category: string | null;
  keywords: string[];
  description: string;
}

export type PhotoSearchState =
  | { status: 'idle' }
  | { status: 'loading'; preview: string }
  | { status: 'done'; preview: string; result: PhotoSearchResult }
  /** El análisis automático no estuvo disponible: se le pide a la persona elegir la categoría. */
  | { status: 'manual'; preview: string; reason?: string };

/** Reduce la foto (máx. 768 px) para enviarla liviana y devuelve data URL + base64. */
export function prepareImage(file: File, max = 768): Promise<{ dataUrl: string; base64: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('not_an_image'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(url);
      resolve({ dataUrl, base64: dataUrl.split(',')[1] });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad_image'));
    };
    img.src = url;
  });
}

export async function analyzePhoto(base64: string): Promise<PhotoSearchResult> {
  // La función solo responde a usuarias con sesión iniciada.
  const { data } = await supabase.auth.getSession();
  const res = await fetch('/api/visual-search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ image: base64, mimeType: 'image/jpeg' }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
    throw new Error(`${res.status} ${body.error ?? ''} ${body.detail ?? ''}`.trim());
  }
  return (await res.json()) as PhotoSearchResult;
}

const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const countKeywords = (haystack: string, keywords: string[]) => {
  const h = norm(haystack);
  return keywords.filter((k) => k.length > 2 && h.includes(norm(k))).length;
};

/** Puntaje de afinidad entre la foto y un look: la categoría pesa más que las palabras clave. */
export function scoreLook(look: Look, r: PhotoSearchResult): number {
  let score = r.category && look.category === r.category ? 3 : 0;
  score += countKeywords(`${look.title} ${look.description} ${look.categoryLabel}`, r.keywords);
  return score;
}

export function scoreSalon(salon: Salon, r: PhotoSearchResult): number {
  let score = 0;
  for (const s of salon.services) {
    if (r.category && norm(s.category) === norm(r.category)) score = Math.max(score, 3);
  }
  const text = `${salon.bio} ${salon.services.map((s) => `${s.name} ${s.description}`).join(' ')}`;
  return score + countKeywords(text, r.keywords);
}
