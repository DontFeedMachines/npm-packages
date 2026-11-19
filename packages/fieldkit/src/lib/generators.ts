// output formats follow UA WALL and REFERER VEIL

export type Target =
  | "nginx"
  | "apache"
  | "caddy"
  | "worker"
  | "cfwaf"
  | "express"
  | "netlify"
  | "meta"
  | "robots"
  | "aitxt"
  | "tdmrep";

export const TARGETS: { id: Target; label: string; file: string; kind: "server" | "edge" | "file" }[] = [
  { id: "nginx", label: "NGINX", file: "dfm-wall.conf", kind: "server" },
  { id: "apache", label: "APACHE", file: ".htaccess", kind: "server" },
  { id: "caddy", label: "CADDY", file: "Caddyfile.dfm", kind: "server" },
  { id: "worker", label: "CLOUDFLARE WORKER", file: "worker.js", kind: "edge" },
  { id: "cfwaf", label: "CLOUDFLARE WAF RULE", file: "waf-expression.txt", kind: "edge" },
  { id: "express", label: "EXPRESS", file: "dfm-wall.js", kind: "server" },
  { id: "netlify", label: "NETLIFY _HEADERS", file: "_headers", kind: "edge" },
  { id: "meta", label: "HTML META", file: "head.html", kind: "file" },
  { id: "robots", label: "ROBOTS.TXT", file: "robots.txt", kind: "file" },
  { id: "aitxt", label: "AI.TXT", file: "ai.txt", kind: "file" },
  { id: "tdmrep", label: "TDMREP.JSON", file: "tdmrep.json", kind: "file" },
];

export const DEFAULT_AGENTS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai",
  "CCBot", "Google-Extended", "Applebot-Extended", "PerplexityBot", "Bytespider",
  "Amazonbot", "cohere-ai", "Diffbot", "ImagesiftBot", "Omgilibot", "Omgili",
  "FacebookBot", "Meta-ExternalAgent", "Meta-ExternalFetcher", "YouBot", "AI2Bot",
  "Timpibot", "Scrapy", "magpie-crawler", "DataForSeoBot", "Kangaroo Bot", "PetalBot",
];

export type Action = "403" | "444" | "tarpit";

export type Options = {
  agents: string[];
  action: Action;
  tarpitPath: string;
  referrer: string;
  noai: boolean;
  noindex: boolean;
  noarchive: boolean;
  tdm: boolean;
  perms: boolean;
  policyUrl: string;
  contact: string;
  site: string;
};

export const DEFAULT_OPTIONS: Options = {
  agents: DEFAULT_AGENTS,
  action: "403",
  tarpitPath: "/archive/",
  referrer: "strict-origin-when-cross-origin",
  noai: true,
  noindex: false,
  noarchive: true,
  tdm: true,
  perms: true,
  policyUrl: "",
  contact: "",
  site: "",
};

const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pattern = (agents: string[]) => agents.map(reEsc).join("|");

function robotsDirectives(o: Options) {
  const p: string[] = [];
  if (o.noindex) p.push("noindex", "nofollow");
  if (o.noai) p.push("noai", "noimageai");
  if (o.noarchive) p.push("noarchive", "nosnippet");
  return p.join(", ");
}

function headerPairs(o: Options): [string, string][] {
  const h: [string, string][] = [["Referrer-Policy", o.referrer]];
  const robots = robotsDirectives(o);
  if (robots) h.push(["X-Robots-Tag", robots]);
  if (o.tdm) h.push(["TDM-Reservation", "1"]);
  if (o.tdm && o.policyUrl) h.push(["TDM-Policy", o.policyUrl]);
  if (o.perms) h.push(["Permissions-Policy", "browsing-topics=(), interest-cohort=()"]);
  return h;
}

export function generate(t: Target, o: Options): string {
  const ags = o.agents;
  const none = !ags.length;
  const hp = headerPairs(o);
  switch (t) {
    case "nginx": {
      let s = "# dfm wall // nginx, inside server {}\n";
      if (!none) {
        s += `if ($http_user_agent ~* "(${pattern(ags).replace(/ /g, "\\ ")})") {\n`;
        if (o.action === "403") s += "    return 403;\n";
        else if (o.action === "444") s += "    return 444;   # drop the connection, send nothing\n";
        else s += `    rewrite ^ ${o.tarpitPath} last;   # into the tarpit\n`;
        s += "}\n";
      }
      for (const [k, v] of hp) s += `add_header ${k} "${v}" always;\n`;
      return s;
    }
    case "apache": {
      let s = "# dfm wall // apache .htaccess or <VirtualHost>\n";
      if (!none) {
        s += "<IfModule mod_rewrite.c>\nRewriteEngine On\n";
        ags.forEach((a, i) => {
          s += `RewriteCond %{HTTP_USER_AGENT} "${a.replace(/ /g, "\\ ")}" [NC${i < ags.length - 1 ? ",OR" : ""}]\n`;
        });
        s += o.action === "tarpit" ? `RewriteRule ^ ${o.tarpitPath} [L]\n` : "RewriteRule ^ - [F,L]\n";
        s += "</IfModule>\n";
      }
      s += "<IfModule mod_headers.c>\n";
      for (const [k, v] of hp) s += `  Header set ${k} "${v}"\n`;
      s += "</IfModule>\n";
      if (o.action === "444") s += "# 444 is nginx only. apache answers 403 instead.\n";
      return s;
    }
    case "caddy": {
      let s = "# dfm wall // caddy, inside a site block\n";
      if (!none) {
        s += `@aicrawlers header_regexp User-Agent "(?i)(${pattern(ags).replace(/"/g, '\\"')})"\n`;
        if (o.action === "403") s += 'respond @aicrawlers "no" 403\n';
        else if (o.action === "444") s += "abort @aicrawlers\n";
        else s += `rewrite @aicrawlers ${o.tarpitPath}\n`;
      }
      s += "header {\n";
      for (const [k, v] of hp) s += `    ${k} "${v}"\n`;
      s += "}\n";
      return s;
    }
    case "worker": {
      let s = "// dfm wall // cloudflare worker\n";
      s += `const BLOCK = ${none ? "null" : `/(${pattern(ags)})/i`};\n`;
      s += `const HEADERS = ${JSON.stringify(Object.fromEntries(hp), null, 2)};\n\n`;
      s += "export default {\n  async fetch(request) {\n";
      s += '    const ua = request.headers.get("user-agent") || "";\n';
      if (o.action === "tarpit") {
        s += `    if (BLOCK && BLOCK.test(ua)) return Response.redirect(new URL("${o.tarpitPath}", request.url), 302);\n`;
      } else {
        s += '    if (BLOCK && BLOCK.test(ua)) return new Response("no", { status: 403 });\n';
      }
      s += "    const res = await fetch(request);\n";
      s += "    const out = new Response(res.body, res);\n";
      s += "    for (const [k, v] of Object.entries(HEADERS)) out.headers.set(k, v);\n";
      s += "    return out;\n  },\n};\n";
      return s;
    }
    case "cfwaf": {
      if (none) return "# pick at least one agent\n";
      const expr = ags.map((a) => `http.user_agent contains "${a}"`).join(" or ");
      return `# dfm wall // cloudflare WAF custom rule expression\n# action: Block\n\n(${expr})\n`;
    }
    case "express": {
      let s = "// dfm wall // express middleware\n";
      s += `const BLOCK = ${none ? "null" : `/(${pattern(ags)})/i`};\n`;
      s += "app.use((req, res, next) => {\n";
      s += '  if (BLOCK && BLOCK.test(req.get("user-agent") || "")) {\n';
      s += o.action === "tarpit"
        ? `    return res.redirect(302, "${o.tarpitPath}");\n`
        : '    return res.status(403).type("text/plain").send("no");\n';
      s += "  }\n";
      for (const [k, v] of hp) s += `  res.set("${k}", "${v}");\n`;
      s += "  next();\n});\n";
      return s;
    }
    case "netlify": {
      let s = "# dfm wall // netlify _headers. headers only: netlify cannot match on user agent here\n/*\n";
      for (const [k, v] of hp) s += `  ${k}: ${v}\n`;
      return s;
    }
    case "meta": {
      const robots = robotsDirectives(o);
      let s = "<!-- dfm wall: paste inside <head>. response headers are stronger than meta -->\n";
      s += `<meta name="referrer" content="${o.referrer}">\n`;
      if (robots) s += `<meta name="robots" content="${robots}">\n`;
      if (o.noai) s += '<meta name="googlebot" content="noai, noimageai">\n';
      if (o.tdm) s += '<meta name="tdm-reservation" content="1">\n<link rel="tdm-reservation" href="/.well-known/tdmrep.json">\n';
      if (o.tdm && o.policyUrl) s += `<meta name="tdm-policy" content="${o.policyUrl}">\n`;
      return s;
    }
    case "robots": {
      let s = "# robots.txt // the polite no in front of the wall\n\n";
      for (const a of ags) s += `User-agent: ${a}\nDisallow: /\n\n`;
      s += "User-agent: *\nAllow: /\n";
      return s;
    }
    case "aitxt": {
      let s = "# ai.txt\n";
      if (o.site) s += `# machine readable use reservation for ${o.site}\n`;
      s += "\nUser-Agent: *\nDisallow: /\n\n";
      s += "# express reservation of rights under Article 4(3) of Directive (EU) 2019/790\n";
      s += "# and under every other text and data mining reservation mechanism.\n";
      s += "DisallowAITraining: *\nDisallowAIUse: *\nTDM-Reservation: 1\n";
      if (o.policyUrl) s += `Policy: ${o.policyUrl}\nTDM-Policy: ${o.policyUrl}\n`;
      if (o.contact) s += `Contact: ${o.contact}\n`;
      return s;
    }
    case "tdmrep": {
      const entry: Record<string, string | number> = { location: "/", "tdm-reservation": 1 };
      if (o.policyUrl) entry["tdm-policy"] = o.policyUrl;
      return JSON.stringify([entry], null, 2) + "\n";
    }
  }
}

export type GradeRow = { agent: string; verdict: "BLOCKED" | "ALLOWED" | "NOT NAMED"; line: number | null };

type Group = { agents: string[]; rules: { allow: boolean; path: string; line: number }[] };

export function parseRobots(txt: string): Group[] {
  const groups: Group[] = [];
  let cur: Group | null = null;
  let lastWasAgent = false;
  txt.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) return;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) return;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) {
        cur = { agents: [], rules: [] };
        groups.push(cur);
      }
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if ((key === "disallow" || key === "allow") && cur) {
      cur.rules.push({ allow: key === "allow", path: val, line: i + 1 });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  });
  return groups;
}

// a crawler obeys the most specific group naming it, else the * group, per RFC 9309
export function grade(txt: string, agents: string[]): GradeRow[] {
  const groups = parseRobots(txt);
  return agents.map((agent) => {
    const a = agent.toLowerCase();
    let g = groups.find((gr) => gr.agents.some((x) => x !== "*" && a.includes(x)));
    const named = !!g;
    if (!g) g = groups.find((gr) => gr.agents.includes("*"));
    if (!g) return { agent, verdict: "NOT NAMED", line: null };
    const whole = (p: string) => p === "/" || p === "/*";
    const disallowAll = g.rules.find((r) => !r.allow && whole(r.path));
    const allowAll = g.rules.find((r) => r.allow && whole(r.path));
    if (disallowAll && !allowAll) return { agent, verdict: "BLOCKED", line: disallowAll.line };
    return { agent, verdict: named ? "ALLOWED" : "NOT NAMED", line: (allowAll ?? g.rules[0])?.line ?? null };
  });
}
