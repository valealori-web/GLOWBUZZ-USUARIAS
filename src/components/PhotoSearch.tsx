import React, { useRef } from 'react';
import {
  PHOTO_CATEGORIES,
  PhotoSearchResult,
  PhotoSearchState,
  analyzePhoto,
  prepareImage,
} from '../lib/visualSearch';

/** Estado y acciones de la búsqueda por foto, compartidos por inicio y explorar. */
export function usePhotoSearch() {
  const [state, setState] = React.useState<PhotoSearchState>({ status: 'idle' });

  const start = async (file: File) => {
    try {
      const { dataUrl, base64 } = await prepareImage(file);
      setState({ status: 'loading', preview: dataUrl });
      try {
        const result = await analyzePhoto(base64);
        if (!result.category && result.keywords.length === 0) {
          setState({ status: 'manual', preview: dataUrl });
        } else {
          setState({ status: 'done', preview: dataUrl, result });
        }
      } catch (error) {
        console.warn('Búsqueda por foto:', error);
        setState({ status: 'manual', preview: dataUrl, reason: error instanceof Error ? error.message : String(error) });
      }
    } catch {
      setState({ status: 'idle' });
    }
  };

  const chooseCategory = (category: string) =>
    setState((s) =>
      s.status === 'manual' || s.status === 'done'
        ? { status: 'done', preview: s.preview, result: { category, keywords: [], description: '' } }
        : s
    );

  const clear = () => setState({ status: 'idle' });
  const result: PhotoSearchResult | null = state.status === 'done' ? state.result : null;
  return { state, result, start, chooseCategory, clear };
}

/** Botón de cámara para la barra de búsqueda: abre la galería/cámara (celular) o el explorador (compu). */
export const PhotoSearchButton: React.FC<{ onFile: (file: File) => void; className?: string }> = ({
  onFile,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Buscar por foto"
        title="Buscar por foto"
        className={`w-7 h-7 rounded-full bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2] flex items-center justify-center transition-colors shrink-0 ${className}`}
      >
        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
      </button>
    </>
  );
};

/** Tarjeta que muestra la foto buscada, el resultado del análisis y permite quitarla. */
export const PhotoSearchBanner: React.FC<{
  search: ReturnType<typeof usePhotoSearch>;
  resultsLabel: string;
  resultsCount?: number;
}> = ({ search, resultsLabel, resultsCount }) => {
  const { state } = search;
  if (state.status === 'idle') return null;

  return (
    <section
      className="mb-4 p-3 sm:p-4 rounded-2xl bg-[#FFF8F9] border border-[#B82E5F]/20 flex items-start gap-3"
      aria-live="polite"
    >
      <img src={state.preview} alt="Tu foto" className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        {state.status === 'loading' && (
          <>
            <p className="text-sm font-semibold text-[#181416]">Analizando tu foto…</p>
            <p className="text-xs text-[#571C31]/70 mt-0.5">Buscando {resultsLabel} parecidos.</p>
            <div className="mt-2 h-1.5 rounded-full bg-[#F5DCE5] overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#B82E5F] animate-pulse" />
            </div>
          </>
        )}

        {state.status === 'manual' && (
          <>
            <p className="text-sm font-semibold text-[#181416]">¿Qué estás buscando?</p>
            <p className="text-xs text-[#571C31]/70 mt-0.5">
              No pudimos reconocer la foto automáticamente. Elegí una categoría.
            </p>
            {state.reason && <p className="text-[10px] text-[#571C31]/50 mt-1 break-words">Motivo técnico: {state.reason}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PHOTO_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => search.chooseCategory(c)}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#B82E5F]/25 text-[#B82E5F] text-[11px] font-semibold hover:bg-[#FDE7EE] transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {state.status === 'done' && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#B82E5F]">Búsqueda por foto</p>
            <p className="text-sm font-semibold text-[#181416] mt-0.5">
              {state.result.category ?? 'Resultados parecidos'}
              {resultsCount !== undefined && (
                <span className="font-normal text-[#571C31]/70"> · {resultsCount} {resultsLabel}</span>
              )}
            </p>
            {state.result.description && (
              <p className="text-xs text-[#571C31]/75 mt-0.5 line-clamp-2">{state.result.description}</p>
            )}
            {state.result.keywords.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {state.result.keywords.map((k) => (
                  <span key={k} className="px-2 py-0.5 rounded-full bg-[#F5DCE5] text-[#B82E5F] text-[11px] font-semibold">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <button
        type="button"
        onClick={search.clear}
        aria-label="Quitar búsqueda por foto"
        className="w-8 h-8 rounded-full bg-[#FDE7EE] text-[#B82E5F] hover:bg-[#FBD5E2] flex items-center justify-center shrink-0 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </section>
  );
};
