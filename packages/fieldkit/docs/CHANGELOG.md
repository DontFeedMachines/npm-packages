# CHANGELOG

this release ships only the parts the DFM sites need. every other pouch stays in the source and is not in the npm package until it's refined. all pouches will be restored fully for the major 1.0.0 release. 

## [0.5.0] - 2026-11-18

### Added

- the eight lib modules the sites import: `lib/tells`, `lib/glyph`, `lib/generators`, `lib/watermark`, `lib/probe`, `lib/styledna`, `lib/synthdiff`, `lib/rand`. 0.4.2 shipped only `seal`, `scrapeview` and `teletext-chars`.
- `teletext-chars.css`, `skins.css` and `pouches/manifest.json` in the package.
- seven font files with their license texts: Atkinson Hyperlegible Next (regular, bold), Atkinson Hyperlegible Mono (regular), Bedstead (bold), Spectral (regular), Spline Sans Mono (regular), VT323 (regular).

### Changed

- the `files` list names only the parts above, plus `config`, `css`, `src` and the Astro components.
- `tool.json` carries the version.
- the README lists only the exports and fonts in this package.
- `CREDITS.md` covers only the third party parts in this package: DocKit, Starlight, the four libraries and the six font families. it lives at `docs/CREDITS.md`, and the `files` list names it there.

### Removed

- from the npm package only: the `fieldkit` command, the `./teletext/*`, `./splints/*` and `./pouches/*` exports, and every pouch not listed above. the source still has them.

### Earlier, Not Yet Released

- docs: moved this changelog from the package root to `docs/CHANGELOG.md`, and updated the `files` list in `package.json` and the file tree in `README.md` to match. the `macdown-antiflash` suture's changelog moved to its own `docs/` folder, and its `build.sh` copies it from there.
- sutures: added `macdown-antiflash` (`MacDownAntiFlash.plugin`) to `pouches/sutures/macdown/macdown-antiflash` (debounces `MPDocument` preview updates and patches `document.body.innerHTML` in-place to eliminate WebView flashing), and registered it in `pouches/manifest.json`, `pouches/sutures/README.md`, `README.md`, and `CREDITS.md` alongside the other three MacDown plugins.

## 0.4.0 - 2026-11-11

- renamed pouches to match the kit taxonomy: `dressings` for themes, skins and templates, `splints` for standalone scripts and utilities, and `sutures` for addons, components and plugins.
- splints: added executable Node utilities (`sign.mjs`, `serve.mjs`, `canon-json.mjs`, `contrast.mjs`) exportable via `@dontfeedmachines/fieldkit/splints/*` or copied via `fieldkit add splints/<part>`, with dev signing keys excluded by `.gitignore` and `.npmignore`.
- sutures: moved the Astro component library into `pouches/sutures/astro/` with `DOCKIT.md` attribution, and added `TeletextChar` to `astro/index.ts`.
- sutures: added native MacDown plugins (`macdown-glossary`, `macdown-restyler`, `macdown-slash-commands`, plus `macdown-plugins-test.md`) and Godot addon `the-end-credits`.
- teletext-chars: synced `src/lib/teletext-chars.ts`, `css/teletext-chars.css`, `src/elements.ts`, `test/teletext-chars.test.ts`, and fixed `TeletextChar.astro` import path.
- security: added symlink/realpath and URI decoding guards to `pouches/splints/serve.mjs`; removed external CDN `marked` load and added HTML/URL escaping and DOM-based Markdown rendering in `pouches/flint/index-of/source/gen-index.dfm-resource.py`.
- packaging & manifests: fixed `package.json` `files` and `exports` (`./teletext-chars.css`, `./fonts/*`, `./skins.css`, `./teletext/*`, `./splints/*`, `./astro`), updated `pouches/*/package.json` and `pouches/manifest.json` (`splints/canon-json`, `sutures/astro`, `sutures/godot`, `sutures/macdown`), pinned `obsidian` workspace devDependencies with a verified `pnpm-lock.yaml`, and synced `CREDITS.md`, `NOTICE`, `tool.json`, and `FORMATS.md`.
- organized internal docs and pouch subfolders (`dressings/dfm-all-css/`, `dressings/teletext/dfm-core/`, `spools/3rd-party-fonts/`), and added full `README.md` guides in every pouch.

## 0.3.0 - 2026-11-07

- the kit is split into pouches, one per kind of part: `pouches/manifest.json` lists every part.
- added a `fieldkit` CLI (`list`, `info`, `add`) that copies parts as plain files without replacing existing files unless `--force` is passed.
- added per-pouch manifests (`@dontfeedmachines/fieldkit-<pouch>`) so individual pouches can be installed on their own.
- moved font families into the `spools` pouch while keeping the `@dontfeedmachines/fieldkit/fonts/*` import path.
- dressings: added every DFM sector, station and commons site as a skin in light and dark (17 sites, `skins.css`), and the main teletext skin for html, WordPress, Ghost, Hugo, Starlight, VS Code and Obsidian.
- flint: added `index-of`, a generic static directory index generator with its GitHub Pages workflow.
- sutures: added the nine DFM Obsidian plugins, built and as a source pnpm workspace.

## 0.2.0 - 2026-10-31

- clean standalone library package structure for `@dontfeedmachines/fieldkit`
- 29 core Astro components and retro UI primitives (`Win`, `Barcode`)
- teletext wiki header, hero, footer, and navigation system for Starlight
- ed25519 static page signing and verifier integration
- 12 font families and fallback stylesheet variables
