import { cpSync, createReadStream, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSrc, toolDirs } from "./registry.ts";
import { sealHtml } from "./seal.ts";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

type Integration = { name: string; hooks: Record<string, (arg: any) => unknown> };

const skip = (p: string) => p.split(sep).some((part) => part === "node_modules" || part === "target" || part.startsWith("."));

export function toolkitEmbeds(bundles: string[]): Integration {
  return {
    name: "dfm-toolkit-embeds",
    hooks: {
      "astro:server:setup": ({ server }: any) => {
        server.middlewares.use("/toolkit-src/", (req: any, res: any, next: () => void) => {
          const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
          const full = resolveSrc(path);
          const [bundle] = path.split("/").filter(Boolean);
          if (!full || !bundles.includes(bundle) || skip(full) || !existsSync(full) || statSync(full).isDirectory()) {
            return next();
          }
          res.setHeader("Content-Type", MIME[extname(full)] ?? "application/octet-stream");
          createReadStream(full).pipe(res);
        });
      },
      "astro:build:done": ({ dir }: any) => {
        const out = fileURLToPath(dir);
        for (const b of bundles) {
          for (const src of toolDirs(b)) {
            if (!existsSync(src)) continue;
            cpSync(src, join(out, "toolkit-src", b, basename(src)), {
              recursive: true,
              filter: (p) => !skip(p.slice(src.length)),
            });
          }
        }
      },
    },
  };
}

function htmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === "toolkit-src") continue;
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

// signs each built page in place when DFM_SEAL_KEY is set
export function sealPages(opts: { origin: string }): Integration {
  return {
    name: "dfm-seal-pages",
    hooks: {
      "astro:build:done": async ({ dir, logger }: any) => {
        const seed = process.env.DFM_SEAL_KEY;
        if (!seed) {
          logger.warn("DFM_SEAL_KEY not set, pages left unsealed");
          return;
        }
        const out = fileURLToPath(dir);
        let n = 0;
        for (const f of htmlFiles(out)) {
          const html = readFileSync(f, "utf8");
          writeFileSync(f, await sealHtml(html, seed, opts.origin));
          n++;
        }
        logger.info(`sealed ${n} pages`);
      },
    },
  };
}

export function copyCheck(opts: { phrases: string[]; exclude: RegExp[] }): Integration {
  return {
    name: "dfm-copy-check",
    hooks: {
      "astro:build:done": ({ dir, logger }: any) => {
        const out = fileURLToPath(dir);
        const hits: string[] = [];
        for (const f of htmlFiles(out)) {
          const rel = f.slice(out.length - 1);
          if (opts.exclude.some((re) => re.test(rel))) continue;
          const text = readFileSync(f, "utf8")
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&#39;|&apos;/g, "'")
            .replace(/\s+/g, " ")
            .toLowerCase();
          for (const p of opts.phrases) {
            const re = new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
            if (re.test(text)) hits.push(`${rel}: "${p}"`);
          }
        }
        if (hits.length) {
          throw new Error(`copy check failed, the site's own copy trips its own detector:\n  ${hits.join("\n  ")}`);
        }
        logger.info("copy check: 0 hits");
      },
    },
  };
}
