import { GoogleGenAI } from '@google/genai';

/**
 * Búsqueda por foto: recibe una imagen (base64) y devuelve a qué categoría de GlowBuzz
 * se parece, con palabras clave para filtrar looks y servicios.
 *
 * Corre del lado del servidor (función de Vercel). La clave GEMINI_API_KEY nunca llega al navegador.
 */

export const CATEGORIES = [
  'Uñas',
  'Pelo & Color',
  'Cejas & Pestañas',
  'Maquillaje',
  'Estética Facial',
  'Botox & Armonización',
] as const;

const PROMPT = `Sos el asistente de búsqueda visual de GlowBuzz, una plataforma de belleza.
Mirá la foto e identificá qué servicio o estilo de belleza muestra.
Respondé SOLO en JSON con:
- category: exactamente una de ${JSON.stringify(CATEGORIES)}, o null si la foto no tiene que ver con belleza.
- keywords: entre 3 y 6 palabras clave en español, en minúscula y específicas (técnica, color, estilo; por ejemplo "balayage", "rubio", "francesa", "glossy").
- description: una oración corta en español rioplatense que describa lo que ves.`;

const SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string', nullable: true, enum: [...CATEGORIES] },
    keywords: { type: 'array', items: { type: 'string' } },
    description: { type: 'string' },
  },
  required: ['category', 'keywords', 'description'],
};

type Req = { method?: string; body?: unknown; headers?: Record<string, string | string[] | undefined> };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://czbidhdklnhvsfiwdhfy.supabase.co';
// Clave pública (anon): la misma que usa la app en el navegador.
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmlkaGRrbG5odnNmaXdkaGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMDU3MDksImV4cCI6MjEwODg4MTcwOX0.jNShiBBt5b44R7fY011d_65AjSKG0dro6xvHHvXa9_g';

/** Solo responde a usuarias con sesión iniciada: Supabase valida el token que manda la app. */
async function hasValidSession(req: Req): Promise<boolean> {
  const header = req.headers?.authorization;
  const token = (Array.isArray(header) ? header[0] : header)?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  if (!(await hasValidSession(req))) return res.status(401).json({ error: 'unauthorized' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({ error: 'not_configured' });
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { image?: string; mimeType?: string }
    | undefined;
  if (!body?.image || typeof body.image !== 'string') {
    return res.status(400).json({ error: 'missing_image' });
  }
  // Límite de seguridad: ~4 MB de base64
  if (body.image.length > 4_000_000) return res.status(413).json({ error: 'image_too_large' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const request = {
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: [
        {
          role: 'user' as const,
          parts: [
            { inlineData: { mimeType: body.mimeType || 'image/jpeg', data: body.image } },
            { text: PROMPT },
          ],
        },
      ],
      config: { responseMimeType: 'application/json', responseJsonSchema: SCHEMA },
    };

    // Si Google está saturado (503) o limita el uso (429), se reintenta unas veces antes de rendirse.
    let response;
    for (let attempt = 0; ; attempt++) {
      try {
        response = await ai.models.generateContent(request);
        break;
      } catch (err) {
        const status = (err as { status?: number })?.status;
        const temporary = status === 503 || status === 429 || status === 500;
        if (!temporary || attempt >= 3) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    const parsed = JSON.parse(response.text ?? '{}');
    const category = (CATEGORIES as readonly string[]).includes(parsed.category) ? parsed.category : null;
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k: unknown) => typeof k === 'string').slice(0, 8)
      : [];
    return res.status(200).json({
      category,
      keywords,
      description: typeof parsed.description === 'string' ? parsed.description : '',
    });
  } catch (err) {
    console.error('visual-search failed', err);
    return res.status(502).json({ error: 'analysis_failed', detail: String((err as Error)?.message ?? err).slice(0, 160) });
  }
}
