const FN = "the of and to a in that it is was for on as with be by this at from or but not are were i he she we you they them our your his her its have has had will would can could".split(" ");

export type Dna = {
  vector: number[];
  readable: { meanSent: number; sentVar: number; ttr: number; avgLen: number; commas: number; semis: number; fnTotal: number };
  n: number;
};

export function features(text: string): Dna | null {
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  const n = words.length;
  if (n < 20) return null;
  const sents = text.split(/[.!?]+/).map((s) => (s.match(/[a-z']+/gi) || []).length).filter((x) => x > 0);
  const meanSent = sents.reduce((a, b) => a + b, 0) / Math.max(sents.length, 1);
  const sentVar = Math.sqrt(sents.reduce((a, b) => a + (b - meanSent) ** 2, 0) / Math.max(sents.length, 1)) / Math.max(meanSent, 1);
  const ttr = new Set(words).size / n;
  const avgLen = words.reduce((a, b) => a + b.length, 0) / n;
  const commas = (text.match(/,/g) || []).length / n;
  const semis = (text.match(/;/g) || []).length / n;
  const questions = (text.match(/\?/g) || []).length / Math.max(sents.length, 1);
  const parens = (text.match(/[()]/g) || []).length / n;
  const fnRates = FN.map((w) => words.filter((x) => x === w).length / n);
  const fnTotal = fnRates.reduce((a, b) => a + b, 0);
  return {
    vector: [meanSent / 30, sentVar, ttr, avgLen / 8, commas * 10, semis * 30, questions, parens * 20, fnTotal, ...fnRates.map((r) => r * 10)],
    readable: { meanSent, sentVar, ttr, avgLen, commas, semis, fnTotal },
    n,
  };
}

const BASES = "ACGT";
export function toDna(vec: number[]): string {
  let s = "";
  for (const v of vec) {
    const q = Math.max(0, Math.min(255, Math.round((v || 0) * 64)));
    s += BASES[(q >> 6) & 3] + BASES[(q >> 4) & 3] + BASES[(q >> 2) & 3] + BASES[q & 3];
  }
  return s.replace(/(.{4})/g, "$1 ").trim();
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

export function sameHand(sim: number): string {
  if (sim > 0.985) return "very likely the same hand";
  if (sim > 0.94) return "plausibly the same author";
  return "reads like different hands";
}
