// a fingerprint-style glyph drawn from the public key's own bytes, so two people can compare keys by eye.
// byte map: 0 pattern, 1 ridge count, 2 spacing, 3 rotation, 4-5 core offset, 6-31 ridge breaks

export type GlyphOpts = { size?: number; ink?: string; core?: string; title?: string };

export function glyphSvg(pubkeyHex: string, opts: GlyphOpts = {}): string {
  const { size = 48, ink = "currentColor", core = "#7a1018", title } = opts;
  const hex = (pubkeyHex || "").replace(/[^0-9a-f]/gi, "").padEnd(64, "0").slice(0, 64);
  const b = Array.from({ length: 32 }, (_, i) => parseInt(hex.slice(i * 2, i * 2 + 2), 16));
  const kind = b[0] % 3;
  const ridges = 6 + (b[1] % 8);
  const gap = 2.6 + (b[2] % 6) * 0.35;
  const rot = (b[3] / 255) * 360;
  const cx = 50 + ((b[4] / 255) - 0.5) * 12;
  const cy = 52 + ((b[5] / 255) - 0.5) * 12;
  const paths: string[] = [];
  for (let r = 0; r < ridges; r++) {
    const rx = 6 + r * gap * 1.15;
    const ry = 8 + r * gap * 1.4;
    const brk = b[6 + (r % 26)];
    const dash = brk % 4 === 0 ? `stroke-dasharray="${8 + (brk % 23)} ${3 + (brk % 5)}"` : "";
    let d: string;
    if (kind === 0) {
      d = `M${cx - rx},${cy} a${rx},${ry} 0 1,1 ${rx * 2},0 a${rx},${ry} 0 1,1 ${-rx * 2},0`;
    } else if (kind === 1) {
      d = `M${cx - rx},${cy + ry * 1.2} L${cx - rx},${cy} a${rx},${ry} 0 0,1 ${rx * 2},0 L${cx + rx},${cy + ry * 1.2}`;
    } else {
      const w = rx * 2.2;
      const h = 4 + r * gap * 0.9;
      d = `M${cx - w},${cy + 18 - r * 2.2} Q${cx},${cy + 18 - r * 2.2 - h} ${cx + w},${cy + 18 - r * 2.2}`;
    }
    paths.push(`<path d="${d}" ${dash}/>`);
  }
  const t = title ? `<title>${title.replace(/</g, "&lt;")}</title>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${(title ?? "key glyph").replace(/"/g, "&quot;")}">${t}<defs><clipPath id="gc${hex.slice(0, 8)}"><ellipse cx="50" cy="50" rx="42" ry="48"/></clipPath></defs><g clip-path="url(#gc${hex.slice(0, 8)})"><g transform="rotate(${rot.toFixed(1)} 50 50)" fill="none" stroke="${ink}" stroke-width="2.1" stroke-linecap="round">${paths.join("")}</g><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.4" fill="${core}" transform="rotate(${rot.toFixed(1)} 50 50)"/></g><ellipse cx="50" cy="50" rx="42" ry="48" fill="none" stroke="${ink}" stroke-width="1" opacity=".35"/></svg>`;
}

export const shortKey = (pubkeyHex: string) => `${pubkeyHex.slice(0, 6)}..${pubkeyHex.slice(-4)}`;
