export type Signature = { type: string; detail: string };

function asciiIncludes(bytes: Uint8Array, needle: string) {
  const n = [...needle].map((c) => c.charCodeAt(0));
  outer: for (let i = 0; i <= bytes.length - n.length; i++) {
    for (let j = 0; j < n.length; j++) if (bytes[i + j] !== n[j]) continue outer;
    return true;
  }
  return false;
}

export const LOOKS_FOR: Signature[] = [
  { type: "C2PA", detail: "a content credentials manifest (c2pa or jumbf box)" },
  { type: "Stable Diffusion", detail: "PNG generation parameters: Steps plus Sampler, CFG scale or Negative prompt" },
  { type: "Stable Diffusion", detail: "the strings Stability or stable-diffusion in metadata" },
  { type: "Midjourney", detail: "the string Midjourney in metadata" },
  { type: "DALL-E", detail: "the strings DALL-E or OpenAI in metadata" },
  { type: "Adobe Firefly", detail: "the string Firefly in metadata" },
  { type: "SynthID/Imagen", detail: "the strings imagen, Google DeepMind or SynthID in metadata" },
];

export function detectFromBytes(bytes: Uint8Array): Signature[] {
  const has = (s: string) => asciiIncludes(bytes, s);
  const out: Signature[] = [];
  if (has("c2pa") || has("jumbf")) out.push({ type: "C2PA", detail: "content credentials manifest present" });
  if (has("Steps:") && (has("Sampler:") || has("CFG scale") || has("Negative prompt"))) out.push({ type: "Stable Diffusion", detail: "PNG generation parameters (Steps/Sampler)" });
  if (has("Midjourney")) out.push({ type: "Midjourney", detail: "Midjourney metadata" });
  if (has("DALL-E") || has("DALL·E") || has("OpenAI")) out.push({ type: "DALL-E", detail: "OpenAI/DALL-E metadata" });
  if (has("Firefly")) out.push({ type: "Adobe Firefly", detail: "Firefly metadata" });
  if (has("Stability") || has("stable-diffusion")) out.push({ type: "Stable Diffusion", detail: "Stability metadata" });
  if (has("imagen") || has("Google DeepMind") || has("SynthID")) out.push({ type: "SynthID/Imagen", detail: "Google provenance marker" });
  return out;
}

export function highFreqScore(img: ImageData): number {
  const { data, width, height } = img;
  let energy = 0;
  let count = 0;
  for (let y = 1; y < height; y++)
    for (let x = 1; x < width; x++) {
      const i = (y * width + x) * 4;
      const l = (y * width + x - 1) * 4;
      const u = ((y - 1) * width + x) * 4;
      energy += Math.abs(data[i] - data[l]) + Math.abs(data[i] - data[u]);
      count++;
    }
  return count ? energy / count : 0;
}

export const HF_THRESHOLD = 40;
