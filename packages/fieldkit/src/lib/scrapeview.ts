export type ScrapeResult = {
  readable: string;
  structured: {
    title: string;
    meta: { name: string; content: string }[];
    jsonld: string[];
    og: { property: string; content: string }[];
  };
  canaries: string[];
  poison: string[];
  chars: number;
};

export function stripScripts(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "")
    .replace(/ on[a-z]+='[^']*'/gi, "");
}

export function tagText(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(html: string, tag: string) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

export function scrape(html: string): ScrapeResult {
  const noScript = stripScripts(html);
  const region = pick(noScript, "article") || pick(noScript, "main") || pick(noScript, "body") || noScript;
  const readable = tagText(region);
  const structured: ScrapeResult["structured"] = { title: tagText(pick(html, "title")), meta: [], jsonld: [], og: [] };
  let m: RegExpExecArray | null;
  const metaRe = /<meta\s+([^>]+)>/gi;
  while ((m = metaRe.exec(html))) {
    const name = (m[1].match(/name=["']([^"']+)["']/i) || [])[1];
    const prop = (m[1].match(/property=["']([^"']+)["']/i) || [])[1];
    const content = (m[1].match(/content=["']([^"']*)["']/i) || [])[1] ?? "";
    if (prop && prop.startsWith("og:")) structured.og.push({ property: prop, content });
    else if (name) structured.meta.push({ name, content });
  }
  const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((m = ldRe.exec(html))) structured.jsonld.push(m[1].trim());
  const canaries = (html.match(/c[0-9a-f]{16,32}/gi) || []).filter((t) => /^c[0-9a-f]{16}/.test(t));
  const poison: string[] = [];
  const poisonRe = /<div[^>]*data-dfm-poison[^>]*>([\s\S]*?)<\/div>/gi;
  while ((m = poisonRe.exec(html))) poison.push(tagText(m[1]));
  return { readable, structured, canaries: [...new Set(canaries)], poison, chars: readable.length };
}
