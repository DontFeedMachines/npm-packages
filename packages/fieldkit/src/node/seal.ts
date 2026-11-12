import { canonText, certMeta, seal } from "../lib/seal.ts";

export async function sealHtml(html: string, secretHex: string, origin: string): Promise<string> {
  if (/<meta name="bloodoath:v"/.test(html)) return html;
  const cert = await seal(canonText(html), "page", secretHex, { handle: origin });
  return html.replace(/<\/head>/i, `${certMeta(cert)}\n</head>`);
}
