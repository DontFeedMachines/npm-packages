// crisp 9x9 pixel glyphs + 2x3 teletext G1 mosaics for fonts missing unicode symbols

export type TeletextCharOpts = {
  size?: string;
  label?: string;
  className?: string;
  title?: string;
};

export type TeletextMosaicOpts = TeletextCharOpts & {
  separated?: boolean;
};

export type Rect = { x: number; y: number; w: number; h: number };

export type GlyphSpec = {
  w: number;
  h: number;
  rects: Rect[];
  d: string;
};

const BITMAPS = {
  external: [
    ".....####",
    ".......##",
    "####..#.#",
    "#....#..#",
    "#...#....",
    "#.......#",
    "#.......#",
    "#.......#",
    "#########",
  ],
  "arrow-ne": [
    ".........",
    "...#####.",
    "......##.",
    ".....#.#.",
    "....#..#.",
    "...#...#.",
    "..#......",
    ".#.......",
    ".........",
  ],
  "arrow-nw": [
    ".........",
    ".#####...",
    ".##......",
    ".#.#.....",
    ".#..#....",
    ".#...#...",
    "......#..",
    ".......#.",
    ".........",
  ],
  "arrow-se": [
    ".........",
    ".#.......",
    "..#......",
    "...#...#.",
    "....#..#.",
    ".....#.#.",
    "......##.",
    "...#####.",
    ".........",
  ],
  "arrow-sw": [
    ".........",
    ".......#.",
    "......#..",
    ".#...#...",
    ".#..#....",
    ".#.#.....",
    ".##......",
    ".#####...",
    ".........",
  ],
  "arrow-up": [
    "....#....",
    "...###...",
    "..#.#.#..",
    ".#..#..#.",
    "....#....",
    "....#....",
    "....#....",
    "....#....",
    "....#....",
  ],
  "arrow-down": [
    "....#....",
    "....#....",
    "....#....",
    "....#....",
    "....#....",
    ".#..#..#.",
    "..#.#.#..",
    "...###...",
    "....#....",
  ],
  "arrow-left": [
    ".........",
    "...#.....",
    "..#......",
    ".#.......",
    "#########",
    ".#.......",
    "..#......",
    "...#.....",
    ".........",
  ],
  "arrow-right": [
    ".........",
    ".....#...",
    "......#..",
    ".......#.",
    "#########",
    ".......#.",
    "......#..",
    ".....#...",
    ".........",
  ],
  "corner-ur": [
    ".....#...",
    "....###..",
    "...#.#.#.",
    ".....#...",
    ".....#...",
    ".....#...",
    "....#....",
    ".###.....",
    ".........",
  ],
  return: [
    ".......#.",
    ".......#.",
    ".......#.",
    "..#....#.",
    ".#.....#.",
    "########.",
    ".#.......",
    "..#......",
    ".........",
  ],
  "chevron-right": [
    ".........",
    "..##.....",
    "...##....",
    "....##...",
    ".....##..",
    "....##...",
    "...##....",
    "..##.....",
    ".........",
  ],
  "chevron-left": [
    ".........",
    ".....##..",
    "....##...",
    "...##....",
    "..##.....",
    "...##....",
    "....##...",
    ".....##..",
    ".........",
  ],
  "chevron-up": [
    ".........",
    ".........",
    "....#....",
    "...###...",
    "..##.##..",
    ".##...##.",
    ".........",
    ".........",
    ".........",
  ],
  "chevron-down": [
    ".........",
    ".........",
    ".##...##.",
    "..##.##..",
    "...###...",
    "....#....",
    ".........",
    ".........",
    ".........",
  ],
  check: [
    ".........",
    "........#",
    ".......##",
    "......##.",
    ".#...##..",
    ".##.##...",
    "..###....",
    "...#.....",
    ".........",
  ],
  cross: [
    ".........",
    ".#.....#.",
    "..#...#..",
    "...#.#...",
    "....#....",
    "...#.#...",
    "..#...#..",
    ".#.....#.",
    ".........",
  ],
  plus: [
    ".........",
    "....#....",
    "....#....",
    "....#....",
    ".#######.",
    "....#....",
    "....#....",
    "....#....",
    ".........",
  ],
  minus: [
    ".........",
    ".........",
    ".........",
    ".........",
    ".#######.",
    ".........",
    ".........",
    ".........",
    ".........",
  ],
  bullet: [
    ".........",
    ".........",
    "...###...",
    "..#####..",
    "..#####..",
    "..#####..",
    "...###...",
    ".........",
    ".........",
  ],
  dot: [
    ".........",
    ".........",
    ".........",
    "...###...",
    "...###...",
    "...###...",
    ".........",
    ".........",
    ".........",
  ],
  ring: [
    ".........",
    "...###...",
    "..#...#..",
    ".#.....#.",
    ".#.....#.",
    ".#.....#.",
    "..#...#..",
    "...###...",
    ".........",
  ],
  square: [
    ".........",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".........",
  ],
  box: [
    ".........",
    ".#######.",
    ".#.....#.",
    ".#.....#.",
    ".#.....#.",
    ".#.....#.",
    ".#.....#.",
    ".#######.",
    ".........",
  ],
  diamond: [
    "....#....",
    "...###...",
    "..#####..",
    ".#######.",
    "#########",
    ".#######.",
    "..#####..",
    "...###...",
    "....#....",
  ],
  "diamond-open": [
    "....#....",
    "...#.#...",
    "..#...#..",
    ".#.....#.",
    "#.......#",
    ".#.....#.",
    "..#...#..",
    "...#.#...",
    "....#....",
  ],
  warn: [
    "....#....",
    "...#.#...",
    "...#.#...",
    "..#.#.#..",
    "..#.#.#..",
    ".#..#..#.",
    ".#.....#.",
    "#...#...#",
    "#########",
  ],
  info: [
    ".#######.",
    "#.......#",
    "#...#...#",
    "#.......#",
    "#...#...#",
    "#...#...#",
    "#...#...#",
    "#.......#",
    ".#######.",
  ],
  lock: [
    "...###...",
    "..#...#..",
    "..#...#..",
    ".#######.",
    ".#######.",
    ".###.###.",
    ".###.###.",
    ".#######.",
    ".........",
  ],
  unlock: [
    "...###...",
    "..#...#..",
    "......#..",
    ".#######.",
    ".#######.",
    ".###.###.",
    ".###.###.",
    ".#######.",
    ".........",
  ],
  key: [
    "..###....",
    ".#...#...",
    ".#...#...",
    "..###....",
    "...#.....",
    "...#.....",
    "...###...",
    "...#.....",
    "...###...",
  ],
  rss: [
    "####.....",
    "....##...",
    "......#..",
    "###....#.",
    "...#....#",
    "....#...#",
    "##...#..#",
    "##...#..#",
    ".........",
  ],
  search: [
    "..####...",
    ".#....#..",
    "#......#.",
    "#......#.",
    "#......#.",
    ".#....#..",
    "..#####..",
    ".......#.",
    "........#",
  ],
  clock: [
    "..#####..",
    ".#.....#.",
    "#...#...#",
    "#...#...#",
    "#...###.#",
    "#.......#",
    "#.......#",
    ".#.....#.",
    "..#####..",
  ],
  eye: [
    ".........",
    "..#####..",
    ".#.....#.",
    "#..###..#",
    "#..#.#..#",
    "#..###..#",
    ".#.....#.",
    "..#####..",
    ".........",
  ],
  bell: [
    "....#....",
    "...###...",
    "..#...#..",
    "..#...#..",
    "..#...#..",
    ".#.....#.",
    "#########",
    "....#....",
    ".........",
  ],
  copy: [
    "...######",
    "...#....#",
    "...#....#",
    "######..#",
    "#....#..#",
    "#....####",
    "#....#...",
    "#....#...",
    "######...",
  ],
  download: [
    "....#....",
    "....#....",
    "..#.#.#..",
    "...###...",
    "....#....",
    ".........",
    "#.......#",
    "#.......#",
    "#########",
  ],
  star: [
    "....#....",
    "....#....",
    "..#####..",
    "#########",
    "..#####..",
    "..##.##..",
    ".#.....#.",
    "#.......#",
    ".........",
  ],
  bolt: [
    ".....#...",
    "....#....",
    "...#.....",
    "..######.",
    "....#....",
    "...#.....",
    "..#......",
    ".#.......",
    ".........",
  ],
  home: [
    "....#....",
    "...###...",
    "..#####..",
    ".#.....#.",
    "#########",
    ".#.....#.",
    ".#.###.#.",
    ".#.###.#.",
    ".#######.",
  ],
  link: [
    "....####.",
    "...#....#",
    "...#..#.#",
    "..####..#",
    "....#....",
    "#..####..",
    "#.#..#...",
    "#....#...",
    ".####....",
  ],
  play: [
    "..#......",
    "..##.....",
    "..###....",
    "..####...",
    "..#####..",
    "..####...",
    "..###....",
    "..##.....",
    "..#......",
  ],
  pause: [
    ".........",
    "..##.##..",
    "..##.##..",
    "..##.##..",
    "..##.##..",
    "..##.##..",
    "..##.##..",
    "..##.##..",
    ".........",
  ],
  stop: [
    ".........",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".#######.",
    ".........",
  ],
  ellipsis: [
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".........",
    ".#..#..#.",
    ".#..#..#.",
    ".........",
  ],
} as const;

export type TeletextCharName = keyof typeof BITMAPS;

export const TT_CHAR_NAMES = Object.keys(BITMAPS) as TeletextCharName[];

const ALIASES: Record<string, TeletextCharName> = {
  ext: "external",
  outbound: "external",
  "↗": "arrow-ne",
  "↖": "arrow-nw",
  "↘": "arrow-se",
  "↙": "arrow-sw",
  "↑": "arrow-up",
  "↓": "arrow-down",
  "←": "arrow-left",
  "→": "arrow-right",
  "⤴": "corner-ur",
  "↵": "return",
  "›": "chevron-right",
  "‹": "chevron-left",
  "⌃": "chevron-up",
  "⌄": "chevron-down",
  "✓": "check",
  "✔": "check",
  "✕": "cross",
  "✖": "cross",
  "✗": "cross",
  "×": "cross",
  "+": "plus",
  "−": "minus",
  "•": "bullet",
  "·": "dot",
  "○": "ring",
  "■": "square",
  "□": "box",
  "◆": "diamond",
  "◇": "diamond-open",
  "⚠": "warn",
  "ℹ": "info",
  "🔒": "lock",
  "🔓": "unlock",
  "🔑": "key",
  "🔍": "search",
  "🕒": "clock",
  "👁": "eye",
  "🔔": "bell",
  "★": "star",
  "⚡": "bolt",
  "▶": "play",
  "⏸": "pause",
  "⏹": "stop",
  "…": "ellipsis",
};

function mergeRows(rows: readonly string[]): Rect[] {
  const rects: Rect[] = [];
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    let x = 0;
    while (x < row.length) {
      if (row[x] !== "#") {
        x++;
        continue;
      }
      const start = x;
      while (x < row.length && row[x] === "#") x++;
      rects.push({ x: start, y, w: x - start, h: 1 });
    }
  }
  return rects;
}

function rectsToPath(rects: readonly Rect[]): string {
  return rects.map((r) => `M${r.x} ${r.y}h${r.w}v${r.h}h-${r.w}z`).join("");
}

const CACHE = new Map<TeletextCharName, GlyphSpec>();

export function resolveTeletextChar(nameOrChar: string): TeletextCharName | null {
  if (nameOrChar in BITMAPS) return nameOrChar as TeletextCharName;
  const trimmed = nameOrChar.trim();
  if (trimmed in BITMAPS) return trimmed as TeletextCharName;
  return ALIASES[trimmed] ?? ALIASES[trimmed.toLowerCase()] ?? null;
}

export function ttCharSpec(nameOrChar: string): GlyphSpec | null {
  const name = resolveTeletextChar(nameOrChar);
  if (!name) return null;
  let spec = CACHE.get(name);
  if (!spec) {
    const rows = BITMAPS[name];
    const rects = mergeRows(rows);
    spec = { w: rows[0].length, h: rows.length, rects, d: rectsToPath(rects) };
    CACHE.set(name, spec);
  }
  return spec;
}

function escAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSvg(spec: GlyphSpec, wCss: string, hCss: string, opts: TeletextCharOpts = {}): string {
  const cls = opts.className ? `tt-char ${opts.className}` : "tt-char";
  const a11y = opts.label
    ? `role="img" aria-label="${escAttr(opts.label)}"`
    : `aria-hidden="true"`;
  const title = opts.title ? `<title>${escHtml(opts.title)}</title>` : "";
  const style = `display:inline-block;width:${wCss};height:${hCss};vertical-align:calc(0.5cap - (${hCss}) / 2 + var(--tt-char-voffset,-0.02em));flex:none`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${escAttr(cls)}" viewBox="0 0 ${spec.w} ${spec.h}" fill="currentColor" shape-rendering="crispEdges" style="${escAttr(style)}" ${a11y}>${title}<path d="${spec.d}"/></svg>`;
}

export function ttCharSvg(nameOrChar: string, opts: TeletextCharOpts = {}): string {
  const spec = ttCharSpec(nameOrChar);
  if (!spec) return escHtml(nameOrChar);
  const size = opts.size ?? "var(--tt-char-size,0.85em)";
  return buildSvg(spec, size, size, opts);
}

export function ttCharDataUri(nameOrChar: string): string | null {
  const spec = ttCharSpec(nameOrChar);
  if (!spec) return null;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${spec.w} ${spec.h}' fill='black' shape-rendering='crispEdges'><path d='${spec.d}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// unicode sextants skip 0 [space], 21 [left half], 42 [right half], 63 [full block]
export function sextantToMask(input: number | string): number | null {
  if (typeof input === "number") return Number.isInteger(input) && input >= 0 && input <= 63 ? input : null;
  if (!input) return null;
  if (input === " ") return 0;
  const trimmed = input.trim();
  if (/^(?:0|[1-9]\d*|0x[0-9a-f]+)$/i.test(trimmed)) {
    const n = trimmed.startsWith("0x") || trimmed.startsWith("0X") ? parseInt(trimmed, 16) : Number(trimmed);
    return Number.isInteger(n) && n >= 0 && n <= 63 ? n : null;
  }
  if (input === "▌") return 0b010101;
  if (input === "▐") return 0b101010;
  if (input === "█") return 0b111111;
  if (input === "▀") return 0b000011;
  if (input === "▄") return 0b110000;
  const cp = input.codePointAt(0);
  if (cp === undefined || cp < 0x1fb00 || cp > 0x1fb3b) return null;
  const idx = cp - 0x1fb00;
  let mask = idx + 1;
  if (mask >= 21) mask++;
  if (mask >= 42) mask++;
  return mask;
}

export function ttMosaicSpec(maskOrChar: number | string, separated = false): GlyphSpec | null {
  const mask = sextantToMask(maskOrChar);
  if (mask === null) return null;
  // 12x18 gives a 2:3 teletext cell; separated shrinks each 6x6 sixel to 4x4 inset by 1
  const cw = 6;
  const ch = 6;
  const inset = separated ? 1 : 0;
  const rects: Rect[] = [];
  for (let bit = 0; bit < 6; bit++) {
    if ((mask & (1 << bit)) === 0) continue;
    const col = bit & 1;
    const row = bit >> 1;
    rects.push({
      x: col * cw + inset,
      y: row * ch + inset,
      w: cw - inset * 2,
      h: ch - inset * 2,
    });
  }
  return { w: 12, h: 18, rects, d: rectsToPath(rects) };
}

export function ttMosaicSvg(maskOrChar: number | string, opts: TeletextMosaicOpts = {}): string {
  const spec = ttMosaicSpec(maskOrChar, Boolean(opts.separated));
  if (!spec) return typeof maskOrChar === "string" ? escHtml(maskOrChar) : "";
  const h = opts.size ?? "var(--tt-mosaic-height,1em)";
  const w = `calc((${h}) * 2 / 3)`;
  return buildSvg(spec, w, h, { ...opts, className: opts.className ? `tt-mosaic ${opts.className}` : "tt-mosaic" });
}

export function ttReplaceText(text: string, opts: TeletextCharOpts = {}): string {
  let out = "";
  for (const ch of text) {
    if (ttCharSpec(ch)) out += ttCharSvg(ch, opts);
    else if (sextantToMask(ch) !== null && ch !== " ") out += ttMosaicSvg(ch, opts);
    else out += escHtml(ch);
  }
  return out;
}
