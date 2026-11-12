import * as ed from "@noble/ed25519";
import { stripScripts, tagText } from "./scrapeview.ts";

export const BLOODOATH_V = "bloodoath/1";
export const DFM_SEAL_V1 = "dfm-seal-v1";

export const toHex = (b: Uint8Array) => ed.etc.bytesToHex(b);
export const fromHex = (h: string) => ed.etc.hexToBytes(h.trim().toLowerCase());
const enc = new TextEncoder();

export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === "string" ? enc.encode(data) : data;
  const d = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return toHex(new Uint8Array(d));
}

export type SealKind = "page" | "text" | "file" | "oath" | "rung" | "post";

export type Cert = {
  v: typeof BLOODOATH_V;
  kind: SealKind;
  pubkey: string;
  hash: string;
  issued: string;
  signature: string;
  title?: string;
  handle?: string;
};

export function signingMessage(c: Pick<Cert, "kind" | "pubkey" | "hash" | "issued">) {
  return enc.encode(`${BLOODOATH_V}|${c.kind}|${c.pubkey}|${c.hash}|${c.issued}`);
}

export async function newKey() {
  const { secretKey, publicKey } = await ed.keygenAsync();
  return { secret: toHex(secretKey), pubkey: toHex(publicKey) };
}

export async function pubFromSecret(secretHex: string) {
  return toHex(await ed.getPublicKeyAsync(fromHex(secretHex)));
}

export async function signRaw(message: Uint8Array, secretHex: string) {
  return toHex(await ed.signAsync(message, fromHex(secretHex)));
}

export async function verifyRaw(message: Uint8Array, sigHex: string, pubHex: string) {
  try {
    return await ed.verifyAsync(fromHex(sigHex), message, fromHex(pubHex));
  } catch {
    return false;
  }
}

export async function seal(
  content: string | Uint8Array,
  kind: SealKind,
  secretHex: string,
  extra: { title?: string; handle?: string; issued?: string } = {},
): Promise<Cert> {
  const pubkey = await pubFromSecret(secretHex);
  const hash = await sha256Hex(content);
  const issued = extra.issued ?? new Date().toISOString();
  const signature = await signRaw(signingMessage({ kind, pubkey, hash, issued }), secretHex);
  const c: Cert = { v: BLOODOATH_V, kind, pubkey, hash, issued, signature };
  if (extra.title) c.title = extra.title;
  if (extra.handle) c.handle = extra.handle;
  return c;
}

export type CheckState = "valid" | "tampered-content" | "bad-signature" | "unsealed";

export async function checkCert(cert: Partial<Cert> | null, content?: string | Uint8Array): Promise<CheckState> {
  if (!cert || cert.v !== BLOODOATH_V || !cert.pubkey || !cert.signature || !cert.hash || !cert.issued || !cert.kind) {
    return "unsealed";
  }
  const ok = await verifyRaw(signingMessage(cert as Cert), cert.signature, cert.pubkey);
  if (!ok) return "bad-signature";
  if (content !== undefined && (await sha256Hex(content)) !== cert.hash) return "tampered-content";
  return "valid";
}

// the page seal covers the readable text of <main>, so adding the meta tags afterwards never changes the hash
export function canonText(html: string): string {
  const noScript = stripScripts(html);
  const m = noScript.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ?? noScript.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return tagText(m ? m[1] : noScript);
}

export function certMeta(c: Cert): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const rows: [string, string][] = [
    ["bloodoath:v", c.v],
    ["bloodoath:kind", c.kind],
    ["bloodoath:pubkey", c.pubkey],
    ["bloodoath:hash", c.hash],
    ["bloodoath:issued", c.issued],
    ["bloodoath:signature", c.signature],
  ];
  if (c.handle) rows.push(["bloodoath:handle", c.handle]);
  return rows.map(([k, v]) => `<meta name="${k}" content="${esc(v)}">`).join("\n");
}

export function readMeta(html: string): Partial<Cert> | null {
  const get = (k: string) => {
    const re = new RegExp(`<meta\\s+[^>]*name=["']${k.replace(":", "\\:")}["'][^>]*>`, "i");
    const tag = html.match(re)?.[0];
    return tag ? (tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "").replace(/&quot;/g, '"').replace(/&amp;/g, "&") : undefined;
  };
  const v = get("bloodoath:v");
  if (!v) return null;
  return {
    v: v as Cert["v"],
    kind: get("bloodoath:kind") as SealKind,
    pubkey: get("bloodoath:pubkey"),
    hash: get("bloodoath:hash"),
    issued: get("bloodoath:issued"),
    signature: get("bloodoath:signature"),
    handle: get("bloodoath:handle"),
  };
}

export type DfmSealV1 = { seal: string; author: string; title: string; issued: string; contentHash: string };

export function readDfmSealV1(html: string): DfmSealV1 | null {
  const get = (k: string) => html.match(new RegExp(`<meta\\s+name=["']${k}["']\\s+content=["']([^"']*)["']`, "i"))?.[1];
  const seal = get("dfm-seal");
  if (!seal) return null;
  return {
    seal,
    author: get("dfm-seal:author") ?? "",
    title: get("dfm-seal:title") ?? "",
    issued: get("dfm-seal:issued") ?? "",
    contentHash: get("dfm-seal:content") ?? "",
  };
}

export async function checkDfmSealV1(s: DfmSealV1): Promise<boolean> {
  const expect = await sha256Hex(`${DFM_SEAL_V1}|${s.author}|${s.title}|${s.issued}|${s.contentHash}`);
  return expect === s.seal;
}

export function detectC2PA(bytes: Uint8Array) {
  const has = (s: string) => {
    const n = [...s].map((c) => c.charCodeAt(0));
    outer: for (let i = 0; i <= bytes.length - n.length; i++) {
      for (let j = 0; j < n.length; j++) if (bytes[i + j] !== n[j]) continue outer;
      return true;
    }
    return false;
  };
  return has("c2pa") || has("jumbf");
}

export function detectPGP(text: string) {
  return /-----BEGIN PGP SIGNED MESSAGE-----/.test(text) || /-----BEGIN PGP SIGNATURE-----/.test(text);
}
