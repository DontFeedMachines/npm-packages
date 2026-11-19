const FN = new Set(
  "a an the of to and in that it is was for on as with be by this at from or but not are were his her its they we you i he she them our your their has have had will would can could should do does did there here what which who when where why how".split(" "),
);
const tok = (t: string) => t.toLowerCase().match(/[a-z0-9']+/g) || [];
const sents = (t: string) => t.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);

export const PROBE_MIN_WORDS = 120;

export type ProbeReading = { n: number; burst: number; rep: number; ent: number; fnShare: number; triEcho: number };

export function probe(text: string): ProbeReading | null {
  const words = tok(text);
  const n = words.length;
  if (n < 8) return null;
  const lens = sents(text).map((s) => tok(s).length).filter((x) => x > 0);
  const mean = lens.reduce((a, b) => a + b, 0) / Math.max(lens.length, 1);
  const varr = lens.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(lens.length, 1);
  const burst = Math.min(mean > 0 ? Math.sqrt(varr) / mean : 0, 1.4);
  const seen = new Set<string>();
  let reps = 0;
  for (const w of words) {
    if (seen.has(w)) reps++;
    else seen.add(w);
  }
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  let ent = 0;
  for (const c of freq.values()) {
    const p = c / n;
    ent -= p * Math.log2(p);
  }
  let fn = 0;
  for (const w of words) if (FN.has(w)) fn++;
  const tri = new Map<string, number>();
  for (let i = 0; i + 2 < n; i++) {
    const k = words[i] + " " + words[i + 1] + " " + words[i + 2];
    tri.set(k, (tri.get(k) || 0) + 1);
  }
  let echoed = 0;
  let total = 0;
  for (const c of tri.values()) {
    total += c;
    if (c > 1) echoed += c - 1;
  }
  return { n, burst, rep: reps / n, ent, fnShare: fn / n, triEcho: total > 0 ? echoed / total : 0 };
}

export function composite(m: ProbeReading): number {
  const b = 1 - Math.min(m.burst / 0.75, 1);
  const r = Math.min(m.rep / 0.55, 1);
  const e = 1 - Math.min(m.ent / 9.5, 1);
  const t = Math.min(m.triEcho / 0.15, 1);
  return b * 0.3 + r * 0.2 + e * 0.25 + t * 0.15 + Math.min(Math.max(0, 1 - Math.abs(m.fnShare - 0.42) * 6), 1) * 0.1;
}

export type Band = "HUMAN-LEANING" | "INCONCLUSIVE" | "SYNTHETIC-LEANING";

export function band(x: number): Band {
  return x > 0.62 ? "SYNTHETIC-LEANING" : x > 0.38 ? "INCONCLUSIVE" : "HUMAN-LEANING";
}
