import { ttCharSpec, ttMosaicSpec } from "./lib/teletext-chars";

export type SectorId = "dfm" | "dfm-tools" | "humanlayer" | "stopthescrape" | "synthstop" | 
"synthstop" | "sweetspot" | "poisongarden" | "porchlights" | "the-leash" | "voidops" | "flockbuster";

const SECTORS: { id: SectorId; label: string; href: string; devPort?: number }[] = [
  { id: "dfm", label: "DFM", href: "https://dontfeedmachines.com/" },
  { id: "dfm-tools", label: "DFM.TOOLS", href: "http://dfm.tools" },
  { id: "humanlayer", label: "HUMANLAYER", href: "https://humanlayer.vip/" },
  { id: "stopthescrape", label: "STOPTHESCRAPE", href: "https://stopthescrape.com/" },
  { id: "synthstop", label: "SYNTHSTOP", href: "https://synths.top/" },
  { id: "sweetspot", label: "SWEETSPOT", href: "https://s-w-e-e-t.spot/" },
  { id: "poisongarden", label: "POISONGARDEN", href: "http://poisoned.work" },
  { id: "porchlights", label: "PORCHLIGHTS", href: "https://porchlights.fyi" },
  { id: "the-leash", label: "THE LEASH", href: "https://leash.dontfeedmachines.com" },
  { id: "voidops", label: "VOIDOPS", href: "https://voidops.observer" },
  { id: "flockbuster", label: "FLOCKBUSTER", href: "https://flockbuster.org" },
];

const isLocal = () => ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

export function sectorHref(id: SectorId): string {
  const s = SECTORS.find((x) => x.id === id)!;
  if (isLocal()) {
    if (id === "bloodoath") return "https://bloodoath.dev";
  }
  return s.href;
}

function store(key: string, value?: string | null): string | null {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
  return null;
}

export function setPlain(on: boolean) {
  document.documentElement.toggleAttribute("data-plain", on);
  store("dfm:plain", on ? "1" : null);
  document.dispatchEvent(new CustomEvent("dfm:plain", { detail: { on } }));
}

export function setLens(on: boolean) {
  document.documentElement.toggleAttribute("data-lens", on);
  document.dispatchEvent(new CustomEvent("dfm:lens", { detail: { on } }));
}

const lensOn = () => document.documentElement.hasAttribute("data-lens");
const plainOn = () => document.documentElement.hasAttribute("data-plain");

class SectorBar extends HTMLElement {
  connectedCallback() {
    const current = this.getAttribute("current");
    const nav = document.createElement("nav");
    nav.setAttribute("aria-label", "dfm sectors");
    for (const s of SECTORS) {
      const a = document.createElement("a");
      a.href = sectorHref(s.id);
      a.textContent = s.label;
      if (s.id === current) a.setAttribute("aria-current", "page");
      nav.append(a);
    }
    const keys = document.createElement("button");
    keys.className = "keys";
    keys.type = "button";
    keys.textContent = "? KEYS";
    keys.addEventListener("click", () => document.querySelector("dfm-keys")?.toggleAttribute("open"));
    nav.append(keys);
    this.replaceChildren(nav);
  }
}

class CodeSlip extends HTMLElement {
  #pre!: HTMLPreElement;
  #count!: HTMLSpanElement;
  #stamp!: HTMLSpanElement;
  #obs?: MutationObserver;

  connectedCallback() {
    if (this.#pre) return;
    const existing = this.querySelector("pre");
    const pre = existing ?? document.createElement("pre");
    const name = this.getAttribute("name") ?? "output.txt";
    const wrap = document.createElement("div");
    wrap.className = "slip";
    const head = document.createElement("div");
    head.className = "slip-head";
    const label = document.createElement("span");
    label.className = "slip-name";
    label.textContent = name;
    this.#count = document.createElement("span");
    this.#count.className = "slip-count";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.textContent = "COPY";
    copy.addEventListener("click", () => this.copy());
    const dl = document.createElement("button");
    dl.type = "button";
    dl.textContent = "DOWNLOAD";
    dl.addEventListener("click", () => this.download());
    head.append(label, this.#count, copy, dl);
    this.#stamp = document.createElement("span");
    this.#stamp.className = "slip-stamp";
    this.#stamp.setAttribute("aria-hidden", "true");
    this.#stamp.textContent = this.getAttribute("stamp") ?? "COPIED";
    wrap.append(head, pre);
    this.replaceChildren(wrap, this.#stamp);
    this.#pre = pre;
    this.#obs = new MutationObserver(() => this.#recount());
    this.#obs.observe(pre, { childList: true, characterData: true, subtree: true });
    this.#recount();
  }

  disconnectedCallback() {
    this.#obs?.disconnect();
  }

  set text(v: string) {
    if (this.#pre) this.#pre.textContent = v;
  }
  get text() {
    return this.#pre?.textContent ?? "";
  }

  #recount() {
    const lines = this.text ? this.text.split("\n").length : 0;
    this.#count.textContent = `${lines} line${lines === 1 ? "" : "s"}`;
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.text);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(this.#pre);
      const sel = getSelection();
      sel?.removeAllRanges();
      sel?.addRange(r);
    }
    this.#stamp.classList.add("on");
    setTimeout(() => this.#stamp.classList.remove("on"), 900);
  }

  download() {
    const name = this.getAttribute("name") ?? "output.txt";
    const blob = new Blob([this.text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
}

type IndexEntry = { title: string; href: string; kind: string; text?: string };

class Palette extends HTMLElement {
  #items: IndexEntry[] | null = null;
  #input!: HTMLInputElement;
  #list!: HTMLUListElement;
  #sel = 0;
  #shown: IndexEntry[] = [];
  #ret: Element | null = null;

  connectedCallback() {
    if (this.#input) return;
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-label", "search this site");
    const box = document.createElement("div");
    box.className = "pal";
    this.#input = document.createElement("input");
    this.#input.type = "search";
    this.#input.placeholder = this.getAttribute("placeholder") ?? "search pages and tools";
    this.#input.setAttribute("aria-label", "search");
    this.#list = document.createElement("ul");
    this.#list.setAttribute("role", "listbox");
    box.append(this.#input, this.#list);
    this.replaceChildren(box);
    this.#input.addEventListener("input", () => this.#filter());
    this.#input.addEventListener("keydown", (e) => this.#key(e));
    this.addEventListener("click", (e) => {
      if (e.target === this) this.close();
    });
  }

  async open() {
    this.#ret = document.activeElement;
    this.setAttribute("open", "");
    this.#input.value = "";
    if (!this.#items) {
      const src = this.getAttribute("src") ?? "/search.json";
      try {
        // a "#id" src reads an inline json script, for pages whose CSP forbids fetch
        if (src.startsWith("#")) this.#items = JSON.parse(document.querySelector(src)?.textContent ?? "[]");
        else this.#items = await (await fetch(src)).json();
      } catch {
        this.#items = [];
      }
    }
    this.#filter();
    this.#input.focus();
  }

  close() {
    this.removeAttribute("open");
    (this.#ret as HTMLElement | null)?.focus?.();
  }

  #filter() {
    const q = this.#input.value.trim().toLowerCase();
    const all = this.#items ?? [];
    const terms = q.split(/\s+/).filter(Boolean);
    this.#shown = (terms.length
      ? all.filter((it) => {
          const hay = `${it.title} ${it.kind} ${it.text ?? ""}`.toLowerCase();
          return terms.every((t) => hay.includes(t));
        })
      : all
    ).slice(0, 40);
    this.#sel = 0;
    this.#render();
  }

  #render() {
    this.#list.replaceChildren();
    if (!this.#shown.length) {
      const li = document.createElement("li");
      li.className = "pal-empty";
      li.textContent = "nothing matches. try fewer words.";
      this.#list.append(li);
      return;
    }
    this.#shown.forEach((it, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === this.#sel));
      const a = document.createElement("a");
      a.href = it.href;
      const t = document.createElement("span");
      t.textContent = it.title;
      const k = document.createElement("small");
      k.textContent = it.kind;
      a.append(t, k);
      li.append(a);
      this.#list.append(li);
    });
    this.#list.children[this.#sel]?.scrollIntoView({ block: "nearest" });
  }

  #key(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.#sel = Math.min(this.#sel + 1, this.#shown.length - 1);
      this.#render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.#sel = Math.max(this.#sel - 1, 0);
      this.#render();
    } else if (e.key === "Enter") {
      const it = this.#shown[this.#sel];
      if (it) location.href = it.href;
    }
  }
}

class KeysHelp extends HTMLElement {
  connectedCallback() {
    if (this.childElementCount) return;
    const lens = this.getAttribute("lens") ?? "LENS";
    const plain = this.getAttribute("plain") ?? "PLAIN MODE";
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-label", "keyboard keys");
    const card = document.createElement("div");
    card.className = "keys-card";
    const rows: [string, string][] = [
      ["L", lens],
      ["P", plain],
      ["/", "search"],
      ["?", "this list"],
      ["ESC", "close"],
    ];
    const dl = document.createElement("dl");
    for (const [k, v] of rows) {
      const dt = document.createElement("dt");
      const kbd = document.createElement("kbd");
      kbd.textContent = k;
      dt.append(kbd);
      const dd = document.createElement("dd");
      dd.textContent = v;
      dl.append(dt, dd);
    }
    const h = document.createElement("strong");
    h.textContent = "KEYS";
    card.append(h, dl);
    this.append(card);
    this.addEventListener("click", () => this.removeAttribute("open"));
  }
}

class TeletextCharElement extends HTMLElement {
  static observedAttributes = ["name", "char", "mosaic", "separated", "size", "label"];

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  #render() {
    const mosaic = this.getAttribute("mosaic");
    const isMosaic = mosaic !== null;
    const spec = isMosaic
      ? ttMosaicSpec(mosaic, this.hasAttribute("separated"))
      : ttCharSpec(this.getAttribute("name") ?? this.getAttribute("char") ?? "");
    if (!spec) {
      this.textContent = this.getAttribute("char") ?? this.getAttribute("name") ?? "";
      return;
    }
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    const h = this.getAttribute("size") ?? (isMosaic ? "var(--tt-mosaic-height,1em)" : "var(--tt-char-size,0.85em)");
    const w = isMosaic ? `calc((${h}) * 2 / 3)` : h;
    svg.setAttribute("class", isMosaic ? "tt-char tt-mosaic" : "tt-char");
    svg.setAttribute("viewBox", `0 0 ${spec.w} ${spec.h}`);
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.style.display = "inline-block";
    svg.style.width = w;
    svg.style.height = h;
    svg.style.verticalAlign = `calc(0.5cap - (${h}) / 2 + var(--tt-char-voffset, -0.02em))`;
    svg.style.flex = "none";
    const label = this.getAttribute("label");
    if (label) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", label);
    } else {
      svg.setAttribute("aria-hidden", "true");
    }
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", spec.d);
    svg.append(path);
    this.replaceChildren(svg);
  }
}

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

let booted = false;

export function boot() {
  if (booted) return;
  booted = true;
  customElements.get("dfm-sector-bar") || customElements.define("dfm-sector-bar", SectorBar);
  customElements.get("dfm-code-slip") || customElements.define("dfm-code-slip", CodeSlip);
  customElements.get("dfm-palette") || customElements.define("dfm-palette", Palette);
  customElements.get("dfm-keys") || customElements.define("dfm-keys", KeysHelp);
  customElements.get("dfm-tt-char") || customElements.define("dfm-tt-char", TeletextCharElement);

  if (store("dfm:plain") === "1") document.documentElement.setAttribute("data-plain", "");

  document.addEventListener("click", (e) => {
    const t = (e.target as HTMLElement | null)?.closest?.("[data-toggle]");
    if (!t) return;
    const what = t.getAttribute("data-toggle");
    if (what === "plain") setPlain(!plainOn());
    if (what === "lens") setLens(!lensOn());
  });

  document.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const pal = document.querySelector<Palette>("dfm-palette");
    const keys = document.querySelector("dfm-keys");
    if (e.key === "Escape") {
      if (pal?.hasAttribute("open")) pal.close();
      keys?.removeAttribute("open");
      return;
    }
    if (typing(e.target)) return;
    const k = e.key.toLowerCase();
    if (k === "/") {
      e.preventDefault();
      pal?.open();
    } else if (k === "?") {
      keys?.toggleAttribute("open");
    } else if (k === "l") {
      setLens(!lensOn());
    } else if (k === "p") {
      setPlain(!plainOn());
    }
  });
}

export { lensOn, plainOn };
