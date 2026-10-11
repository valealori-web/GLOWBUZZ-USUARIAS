import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface PressAction {
  id: string;
  icon: string;
  label: string;
  run: () => void;
  /** Ícono relleno (por ejemplo, "guardado"). */
  active?: boolean;
}

interface PressActionsProps {
  image: string;
  alt: string;
  /** Posición y tamaño de la tarjeta original en pantalla. */
  rect: { left: number; top: number; width: number; height: number };
  /** Punto donde está el dedo. */
  point: { x: number; y: number };
  actions: PressAction[];
  onClose: () => void;
}

const BUTTON = 56;
const RADIUS = 92;

/**
 * Menú de acciones al mantener apretada una foto (estilo Pinterest):
 * la foto se levanta, el fondo se aclara y los botones salen en abanico desde el dedo.
 * Se puede soltar el dedo sobre un botón o tocarlo después.
 */
export const PressActions: React.FC<PressActionsProps> = ({ image, alt, rect, point, actions, onClose }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const openedAt = useRef(Date.now());
  const hoveredRef = useRef<number | null>(null);
  hoveredRef.current = hovered;

  // Posiciones en abanico alrededor del dedo. El abanico se orienta hacia el lado con más
  // espacio (arriba o abajo, izquierda o derecha) y se separan los botones que se pisen.
  const positions = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const up = point.y > 190;
    const spread = 140;
    let center = up ? -90 : 90;
    if (point.x < 120) center = up ? -45 : 45;
    else if (point.x > vw - 120) center = up ? -135 : 135;
    const start = center - spread / 2;
    const n = actions.length;
    const minX = BUTTON / 2 + 12;
    const maxX = vw - BUTTON / 2 - 12;
    const minY = 76 + BUTTON / 2;
    const maxY = vh - 96;
    const pts = actions.map((_, i) => {
      const angle = ((start + (n === 1 ? spread / 2 : (spread * i) / (n - 1))) * Math.PI) / 180;
      return {
        x: Math.min(Math.max(point.x + RADIUS * Math.cos(angle), minX), maxX),
        y: Math.min(Math.max(point.y + RADIUS * Math.sin(angle), minY), maxY),
      };
    });
    // Relajación: cada botón ocupa un rectángulo (círculo + nombre); se separan los que se pisen
    const W = 70;
    const H = 84;
    for (let iter = 0; iter < 80; iter++) {
      let moved = false;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const penX = W - Math.abs(dx);
          const penY = H - Math.abs(dy);
          if (penX > 0 && penY > 0) {
            // se empuja por el eje en el que menos se superponen
            if (penX < penY) {
              const push = (penX / 2 + 0.5) * (dx >= 0 ? 1 : -1);
              pts[i].x = Math.min(Math.max(pts[i].x - push, minX), maxX);
              pts[j].x = Math.min(Math.max(pts[j].x + push, minX), maxX);
            } else {
              const push = (penY / 2 + 0.5) * (dy >= 0 ? 1 : -1);
              pts[i].y = Math.min(Math.max(pts[i].y - push, minY), maxY);
              pts[j].y = Math.min(Math.max(pts[j].y + push, minY), maxY);
            }
            moved = true;
          }
        }
      }
      if (!moved) break;
    }
    return pts;
  }, [actions, point.x, point.y]);

  // Mientras el menú está abierto: no se desplaza la página y se puede deslizar hasta un botón
  useEffect(() => {
    const prevent = (e: TouchEvent) => e.preventDefault();
    const idxAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-press-action]') as HTMLElement | null;
      return el ? Number(el.dataset.pressAction) : null;
    };
    const move = (e: PointerEvent) => setHovered(idxAt(e.clientX, e.clientY));
    const up = (e: PointerEvent) => {
      const idx = idxAt(e.clientX, e.clientY);
      if (idx !== null && Date.now() - openedAt.current > 250) {
        actions[idx].run();
        onClose();
      }
    };
    window.addEventListener('touchmove', prevent, { passive: false });
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('touchmove', prevent);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] gb-press-backdrop"
      role="dialog"
      aria-label="Opciones de la publicación"
      onClick={() => {
        if (Date.now() - openedAt.current > 400) onClose();
      }}
    >
      {/* Foto levantada */}
      <img
        src={image}
        alt={alt}
        draggable={false}
        className="gb-press-lift absolute object-cover rounded-2xl pointer-events-none bg-[#F1F1F1]"
        style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      />

      {/* Botones en abanico */}
      {actions.map((a, i) => {
        const pos = positions[i];
        const isHover = hovered === i;
        return (
          <button
            key={a.id}
            type="button"
            data-press-action={i}
            aria-label={a.label}
            onClick={(e) => {
              e.stopPropagation();
              if (Date.now() - openedAt.current < 250) return;
              a.run();
              onClose();
            }}
            className="gb-press-pop absolute flex flex-col items-center"
            style={
              {
                left: pos.x - BUTTON / 2,
                top: pos.y - BUTTON / 2,
                width: BUTTON,
                '--dx': `${point.x - pos.x}px`,
                '--dy': `${point.y - pos.y}px`,
                animationDelay: `${i * 40}ms`,
              } as React.CSSProperties
            }
          >
            <span
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-150 ${
                isHover ? 'bg-[#B82E5F] text-white scale-110' : 'bg-white text-[#111111]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[26px]"
                style={a.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {a.icon}
              </span>
            </span>
            <span
              className={`mt-1 text-[10px] font-bold whitespace-nowrap px-2 py-0.5 rounded-full shadow-md transition-colors ${
                isHover ? 'bg-[#B82E5F] text-white' : 'bg-white text-[#571C31]'
              }`}
            >
              {a.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
