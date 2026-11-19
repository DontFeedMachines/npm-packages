# DOCKIT COMPONENT DERIVATIONS

a tracking log of Astro components originally derived or adapted from the [DocKit theme](https://github.com/themefisher/dockit-astro) by Themefisher (MIT License, see [LICENSE-DOCKIT.txt](LICENSE-DOCKIT.txt)).

---

## 1. Stock DocKit components

unmodified (re-styled) components originated from DocKit as used in the DFM wiki, retaining DocKit's component structure:

- `Breadcrumb.astro`
- `Button.astro`
- `Section.astro`

## 2. Components adapted from DocKit

customized components derived from DocKit's component set and tailored for DFM documentation:

- `Grid.astro`
- `BuildStep.astro`
- `BuildSteps.astro`
- `Glossary.astro`
- `InteractiveCircuit.astro`
- `SpecTable.astro`
- `ThreatLevel.astro`

## 3. DocKit layout code rewritten for Starlight

navigation and layout components adapted from DocKit and rewritten to decouple them from the upstream theme shell so they stay modular across Starlight and DFM sites:

- `CTA.astro`
- `MobileMenuToggle.astro`
- `SidebarNav.astro`
- `SidebarRestorePoint.astro`
- `ThemeSwitch.astro`

## 4. Starlight Overrides (DocKit / Starlight Hybrid)

custom overrides replacing default `@astrojs/starlight` layout elements:

- `Header.astro`
- `Hero.astro`
- `Footer.astro`
- `PageFrame.astro`
- `Search.astro` (wraps Pagefind UI)
- `SidebarSublist.astro`
- `SiteTitle.astro`
- `TwoColumnContent.astro`

---

## 5. DFM Original Components (Non-DocKit)

100% original & not derived from DocKit/Starlight/Astro:

- `AnsiLogo.astro` (based on [FIGlet](https://www.figlet.org/))
- `Barcode.astro`
- `BomTable.astro`
- `Difficulty.astro`
- `ImageMod.astro`
- `LegalWarning.astro`
- `TeletextChar.astro`
- `ThreatModel.astro`
- `Win.astro`
