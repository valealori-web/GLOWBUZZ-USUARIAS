/** Fotos propias del proyecto (carpeta public/photos). c = trabajos de comercios, u = fotos de usuarias. */
const p = (name: string) => `/photos/${name}.webp`;

export const P = {
  c01: p('c01'), c02: p('c02'), c03: p('c03'), c04: p('c04'), c05: p('c05'),
  c06: p('c06'), c07: p('c07'), c08: p('c08'), c09: p('c09'), c10: p('c10'),
  c11: p('c11'), c12: p('c12'), c13: p('c13'), c14: p('c14'), c15: p('c15'),
  m01: p('m01'), m02: p('m02'), m03: p('m03'), l01: p('l01'),
  u01: p('u01'), u02: p('u02'), u03: p('u03'), u04: p('u04'), u05: p('u05'), u06: p('u06'),
} as const;

/** Avatar de iniciales (SVG en línea) para logos de comercios y personas sin foto. */
export function monogram(fullName: string): string {
  const initials = fullName
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" fill="#F5DCE5"/>` +
    `<text x="50" y="50" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="DM Sans, Inter, sans-serif" font-weight="700" font-size="40" fill="#B82E5F">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
