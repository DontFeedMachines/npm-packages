import defaultConfig from "../../config/wiki.default.json" with { type: "json" };
import defaultMenu from "../../config/menu.default.json" with { type: "json" };

type Plain = Record<string, any>;

export type WikiOptions = {
  config?: Plain;
  menu?: Record<string, Plain>;
};

const isPlain = (v: unknown): v is Plain => !!v && typeof v === "object" && !Array.isArray(v);

// arrays are replaced whole, objects merge key by key
function merge(base: Plain, over: Plain): Plain {
  const out: Plain = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isPlain(v) && isPlain(base[k]) ? merge(base[k], v) : v;
  return out;
}

const ID = "virtual:dfm-fieldkit/wiki";

export function fieldkitWiki(options: WikiOptions = {}) {
  const payload = {
    config: merge(defaultConfig, options.config ?? {}),
    menu: { en: defaultMenu, ...(options.menu ?? {}) },
  };
  return {
    name: "dfm-fieldkit-wiki",
    hooks: {
      "astro:config:setup": ({ updateConfig }: { updateConfig: (c: Plain) => void }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: "dfm-fieldkit-wiki",
                resolveId: (id: string) => (id === ID ? "\0" + ID : null),
                load: (id: string) => (id === "\0" + ID ? `export default ${JSON.stringify(payload)};` : null),
              },
            ],
          },
        });
      },
    },
  };
}
