# @dontfeedmachines/fieldkit

the shared code behind the Don't Feed Machines sites: Astro components, web components, typescript libraries, build helpers, stylesheets and fonts. this release carries only what the sites use right now. more of the kit comes to npm as each part is finished.

## Install

```bash
pnpm add @dontfeedmachines/fieldkit
```

any package manager works.

## Exports

| import | what it is |
|:--|:--|
| `@dontfeedmachines/fieldkit/base.css` | the base stylesheet |
| `@dontfeedmachines/fieldkit/teletext-chars.css` | teletext glyphs as css custom properties |
| `@dontfeedmachines/fieldkit/skins.css` | light and dark skins for the DFM sites (`data-skin`, `data-mode`) |
| `@dontfeedmachines/fieldkit/fonts/<family>/<file>` | seven font files, each with its license |
| `@dontfeedmachines/fieldkit/pouches/manifest.json` | the list of fieldkit parts |
| `@dontfeedmachines/fieldkit/elements` | the web components the sites boot |
| `@dontfeedmachines/fieldkit/lib/<name>` | typescript libraries: `seal`, `scrapeview`, `teletext-chars`, `tells`, `glyph`, `generators`, `watermark`, `probe`, `styledna`, `synthdiff`, `rand`, `canon`, `contrast` |
| `@dontfeedmachines/fieldkit/node/<name>` | build helpers: `astro`, `registry`, `seal`, `wiki` |
| `@dontfeedmachines/fieldkit/wiki/<name>` | wiki helpers: `ansi`, `config`, `teletext`, `textConverter` |
| `@dontfeedmachines/fieldkit/astro` | the 32 Astro components |
| `@dontfeedmachines/fieldkit/astro/<Name>.astro` | one Astro component |

## Fonts

| family | file |
|:--|:--|
| Atkinson Hyperlegible Next | `atkinson-hyperlegible-next/AtkinsonHyperlegibleNext-Regular.woff2`, `-Bold.woff2` |
| Atkinson Hyperlegible Mono | `atkinson-hyperlegible-mono/AtkinsonHyperlegibleMono-Regular.woff2` |
| Bedstead | `bedstead/bedstead-bold.otf` |
| Spectral | `spectral/Spectral-Regular.ttf` |
| Spline Sans Mono | `spline-sans-mono/SplineSansMono-Regular.ttf` |
| VT323 | `vt323/VT323-Regular.ttf` |

## Network

none. nothing here phones home. the seal helpers sign pages at build time, on your machine.

## License

Apache-2.0, see `LICENSE` and `NOTICE`. third party parts and their licenses are in `/docs/CREDITS.md`.
