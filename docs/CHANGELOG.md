# Changelog // Don't Feed Machines npm-packages

## [v0.5.0] - 2026-11-18

### Changed

- `packages/fieldkit` is now `@dontfeedmachines/fieldkit` 0.5.0, copied from the fieldkit source as the exact set of files the package ships. it adds the eight library modules the DFM sites import (`tells`, `glyph`, `generators`, `watermark`, `probe`, `styledna`, `synthdiff`, `rand`), `teletext-chars.css`, `skins.css`, the pouch manifest, and seven font files with their license texts. its readme lists only the exports in this package, and a new `CREDITS.md` covers only the third party parts it ships.

### Fixed

- the workspace `package.json` version is now the string `1.0.0`, not the number `1`.

## [v0.4.2] - 2026-11-12

### `Added`
- added `fieldkitWiki` (`src/node/wiki.ts`, `src/wiki/virtual.d.ts`, `config/{wiki,menu}.default.json`) to `@dontfeedmachines/fieldkit`.

## [v0.4.1] - 2026-11-12

### Added
- initialized `npm-packages` monorepo with `packages/fieldkit` (`@dontfeedmachines/fieldkit` 0.4.1).
