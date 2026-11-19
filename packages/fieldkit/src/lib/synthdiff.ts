import { findTells } from "./tells.ts";

const words = (s: string) => s.toLowerCase().match(/[a-z0-9']+/g) || [];
export const sentences = (t: string) => (t.match(/[^.!?]+[.!?]+/g) || [t]).map((s) => s.trim()).filter(Boolean);

export function baseline(v1: string) {
  const lens = sentences(v1).map((s) => words(s).length).filter((n) => n);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  return { mean, sd };
}

export type DiffSpan = { sentence: string; changed: boolean; signals: string[]; confidence: number };

export function synthDiff(v1: string, v2: string): { spans: DiffSpan[]; baseline: { mean: number; sd: number } } {
  const base = baseline(v1);
  const v1set = new Set(sentences(v1).map((s) => s.toLowerCase().replace(/\s+/g, " ")));
  const spans = sentences(v2).map((s) => {
    const changed = !v1set.has(s.toLowerCase().replace(/\s+/g, " "));
    if (!changed) return { sentence: s, changed, signals: [], confidence: 0 };
    const tells = findTells(s);
    const len = words(s).length;
    const uniform = base.sd > 0 && Math.abs(len - base.mean) < 0.35 * base.sd;
    const signals: string[] = [];
    if (tells.length) signals.push(...tells.map((t) => `tell: ${t.tell.name}`));
    if (uniform) signals.push("length hugs the old average");
    const confidence = Math.min(99, tells.reduce((a, t) => a + t.tell.weight * 13, 0) + (uniform ? 25 : 0));
    return { sentence: s, changed, signals, confidence };
  });
  return { spans, baseline: base };
}
