import React from 'react';

interface GlowBuzzLogoProps {
  variant?: 'header' | 'lockup-light' | 'lockup-dark' | 'icon' | 'icon-mono' | 'wordmark' | 'onboarding';
  className?: string;
  size?: number;
}

export const GlowBuzzLogo: React.FC<GlowBuzzLogoProps> = ({
  variant = 'header',
  className = '',
  size = 32,
}) => {
  if (variant === 'icon' || variant === 'icon-mono') {
    const isMono = variant === 'icon-mono';
    const bgColor = isMono ? '#181416' : '#B82E5F';
    const hangerColor = isMono ? '#342F31' : '#571C31';
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Calendar Card Body with Rounded Edges */}
        <rect x="5" y="14" width="90" height="82" rx="26" fill={bgColor} />
        {/* Top Wire / Accent Line */}
        <rect x="18" y="27" width="64" height="2.5" rx="1.25" fill="#FFF8F3" fillOpacity="0.4" />
        {/* Top Hangers */}
        <rect x="26" y="2" width="10" height="18" rx="5" fill={hangerColor} />
        <rect x="64" y="2" width="10" height="18" rx="5" fill={hangerColor} />
        {/* 'GB' Bold Typography */}
        <text
          x="50"
          y="63"
          textAnchor="middle"
          fill="#FFF8F3"
          fontFamily="'DM Sans', sans-serif"
          fontWeight="900"
          fontSize="36"
          letterSpacing="-0.04em"
        >
          GB
        </text>
        {/* Beauty Buzz Dot */}
        <circle cx="73" cy="74" r="5" fill="#FFF8F3" />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <span
        className={`font-black tracking-tight text-on-surface ${className}`}
        style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.03em' }}
      >
        GlowBuzz
      </span>
    );
  }

  if (variant === 'lockup-dark') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <GlowBuzzLogo variant="icon" size={size} />
        <span
          className="text-xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <span className="text-[#F5DCE5]">Glow</span>
          <span className="text-[#B82E5F]">Buzz</span>
        </span>
      </div>
    );
  }

  // Mismo logo que el encabezado (y que el panel de profesionales)
  if (variant === 'lockup-light' || variant === 'onboarding') {
    return <GlowBuzzLogo variant="header" size={size} className={className} />;
  }

  // Variante de encabezado: idéntica a la del panel de profesionales (tamaño "sm", sin etiqueta Business).
  // Mismas proporciones: ícono 30 / texto 16 px; 38 / 20 px; 48 / 24 px; 64 / 30 px.
  const textSizeClass =
    size <= 30 ? 'text-base' : size <= 38 ? 'text-xl' : size <= 48 ? 'text-2xl' : 'text-3xl';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <GlowBuzzLogo variant="icon" size={size} className="flex-shrink-0" />
      <div className="flex flex-col leading-none">
        <div
          className={`font-black tracking-tight ${textSizeClass}`}
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}
        >
          <span className="text-[#B82E5F]">Glow</span>
          <span className="text-[#571C31]">Buzz</span>
        </div>
      </div>
    </div>
  );
};
