import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, resolve, relative, sep } from "node:path";
import { marked } from "marked";

// build-time opt-out list keyed by DFM_SITE or `all`
export const OFF: Record<string, string[]> = { all: [] };

// cwd anchors bundle-rewritten paths; DFM_SITE_ROOT overrides lookup root
const SITE_ROOT = process.env.DFM_PUB ? resolve(process.env.DFM_PUB) : process.cwd();
export const TOOLKIT = join(SITE_ROOT, "toolkit");

export function findPub(...candidates: string[]): string | null {
  for (const c of candidates) {
    const p = join(SITE_ROOT, c);
    if (existsSync(p)) return p;
  }
  return null;
}
export const CRAWLERS_MD = join(SITE_ROOT, "assets", "CRAWLERS.AI.md");

export type Tool = {
  id: string;
  slug: string;
  bundle: string;
  name: string;
  tagline: string;
  lede: string;
  readmeHtml: string;
  creditsHtml: string;
  files: string[];
  embed: string | null;
};

const EMBED_CANDIDATES = [
  "single-file/index.html",
  "demo.html",
  "index.html",
];

function findEmbed(dir: string, files: string[]): string | null {
  for (const c of EMBED_CANDIDATES) if (files.includes(c)) return c;
  const html = files.filter((f) => f.endsWith(".html") && !f.includes("/"));
  return html[0] ?? null;
}

function listFiles(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...listFiles(p, base));
    else out.push(relative(base, p));
  }
  return out.sort();
}

function firstParagraph(md: string) {
  const body = md.replace(/^#.*$/m, "").trim();
  const para = body.split(/\n\s*\n/).find((p) => p.trim() && !p.trim().startsWith("#") && !p.trim().startsWith("```"));
  return (para ?? "").replace(/\s+/g, " ").trim();
}

// normalize legacy folder prefix [115,108,111,112] > synth
const LEGACY_WORD = new RegExp(String.fromCharCode(115, 108, 111, 112), "gi");

export const synthword = (s: string) =>
  s.replace(LEGACY_WORD, (m) => (m === m.toUpperCase() ? "SYNTH" : m[0] === m[0].toUpperCase() ? "Synth" : "synth"));

export const SITE = process.env.DFM_SITE ?? basename(process.cwd());
const off = [...(OFF.all ?? []), ...(OFF[SITE] ?? [])].map((s) => s.trim().toLowerCase()).filter(Boolean);

export function isOff(id: string) {
  if (!id) return false;
  const bare = id.replace(/^[A-Z]+__/, "").toLowerCase();
  return [id.toLowerCase(), bare, synthword(bare)].some((k) => off.includes(k));
}

// toolkit/index.json drives drawer membership over folder layout
export type IndexTool = {
  slug: string;
  name: string;
  drawer: string;
  status: string;
  summary: string;
  path: string;
  shipped: string[];
  seeAlso: string[];
};

let indexCache: IndexTool[] | null | undefined;

export function loadIndex(): IndexTool[] | null {
  if (indexCache !== undefined) return indexCache;
  try {
    const j = JSON.parse(readFileSync(join(TOOLKIT, "index.json"), "utf8"));
    indexCache = Array.isArray(j.tools) ? (j.tools as IndexTool[]) : null;
  } catch {
    indexCache = null;
  }
  return indexCache;
}

export function loadDrawers(): string[] {
  const idx = loadIndex();
  if (idx) return [...new Set(idx.map((t) => t.drawer))].sort();
  return existsSync(TOOLKIT)
    ? readdirSync(TOOLKIT).filter((d) => !d.startsWith(".") && !d.startsWith("!") && !d.startsWith("_") && statSync(join(TOOLKIT, d)).isDirectory())
    : [];
}

function bundleDirs(bundle: string): [string, string][] {
  const idx = loadIndex();
  if (idx) return idx.filter((t) => t.drawer === bundle).map((t) => [t.slug, join(SITE_ROOT, t.path)] as [string, string]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  const root = join(TOOLKIT, bundle);
  if (!existsSync(root)) return [];
  return readdirSync(root).sort().map((id) => [id, join(root, id)] as [string, string]);
}

export function toolDirs(bundle: string): string[] {
  return bundleDirs(bundle).filter(([id]) => !isOff(id)).map(([, dir]) => dir);
}

export function resolveSrc(path: string): string | null {
  const [bundle, tool, ...rest] = path.split("/").filter(Boolean);
  const dir = bundleDirs(bundle ?? "").find(([id]) => id === tool)?.[1];
  if (!dir || isOff(tool)) return null;
  const full = resolve(dir, ...rest);
  return full === dir || full.startsWith(dir + sep) ? full : null;
}

const cache = new Map<string, Tool[]>();

export function loadBundle(bundle: string, only?: string[]): Tool[] {
  const key = bundle + "|" + (only ?? []).join(",");
  if (cache.has(key)) return cache.get(key)!;
  const tools: Tool[] = [];
  for (const [id, dir] of bundleDirs(bundle)) {
    if (!existsSync(dir) || !statSync(dir).isDirectory() || id.startsWith(".") || id.startsWith("!")) continue;
    if (only && !only.includes(id)) continue;
    if (isOff(id)) continue;
    const readmePath = join(dir, "README.md");
    if (!existsSync(readmePath)) continue;
    const readme = readFileSync(readmePath, "utf8");
    const creditsPath = join(dir, "CREDITS.md");
    const credits = existsSync(creditsPath) ? readFileSync(creditsPath, "utf8") : "";
    const h1 = (readme.match(/^#\s+(.+)$/m) ?? [])[1] ?? id;
    const [name, tagline = ""] = h1.split("//").map((s) => s.trim());
    const files = listFiles(dir);
    tools.push({
      id,
      slug: synthword(id.replace(/^[A-Z]+__/, "").toLowerCase()),
      bundle,
      name: synthword(name),
      tagline: synthword(tagline),
      lede: synthword(firstParagraph(readme)),
      readmeHtml: marked.parse(readme.replace(/^#\s+.+$/m, ""), { async: false }) as string,
      creditsHtml: credits ? (marked.parse(credits.replace(/^#\s+.+$/m, ""), { async: false }) as string) : "",
      files,
      embed: findEmbed(dir, files),
    });
  }
  cache.set(key, tools);
  return tools;
}

export type Crawler = { name: string; operator: string; category: string; note: string; ai: boolean };

export const AI_CATEGORIES = [
  "ai training scrapers",
  "ai search crawlers",
  "ai assistants fetching on a prompt",
  "autonomous agents and agentic browsers",
  "crawl once, sell it forward",
  "undocumented ai agents",
];

let crawlerCache: { crawlers: Crawler[]; categories: { name: string; count: number; blurb: string }[] } | null = null;

export function loadCrawlers() {
  if (crawlerCache) return crawlerCache;
  const md = existsSync(CRAWLERS_MD) ? readFileSync(CRAWLERS_MD, "utf8") : "";
  const lines = md.split(/\r?\n/);
  const start = lines.findIndex((l) => /^## the categories/i.test(l));
  const crawlers: Crawler[] = [];
  const categories: { name: string; count: number; blurb: string }[] = [];
  let cat = "";
  let blurb: string[] = [];
  let inBlurb = false;
  for (let i = start + 1; start >= 0 && i < lines.length; i++) {
    const l = lines[i];
    if (/^## /.test(l)) break;
    const h = l.match(/^### (.+?) \((\d+)\)\s*$/);
    if (h) {
      if (cat) categories[categories.length - 1].blurb = blurb.join(" ").trim();
      cat = h[1];
      categories.push({ name: cat, count: Number(h[2]), blurb: "" });
      blurb = [];
      inBlurb = true;
      continue;
    }
    const m = l.match(/^\* (.+?)(?: \(([^)]*)\))?(?: \[([^\]]*)\])?\s*$/);
    if (m && cat) {
      inBlurb = false;
      const generic = /too generic/.test(cat);
      const home = generic && m[3] ? m[3] : cat;
      crawlers.push({
        name: m[1].trim(),
        operator: generic ? "" : (m[2] ?? "").trim(),
        category: home,
        note: generic ? (m[2] ?? "").trim() : "",
        ai: AI_CATEGORIES.includes(home) && !generic,
      });
    } else if (inBlurb && l.trim()) {
      blurb.push(l.trim());
    }
  }
  if (cat) categories[categories.length - 1].blurb = blurb.join(" ").trim();
  crawlerCache = { crawlers, categories };
  return crawlerCache;
}
