# CREDITS

third party parts in this package, with their authors and licenses.

## DocKit Theme

- author: Themefisher
- source: https://github.com/themefisher/dockit-astro
- license: MIT
- redistribution: unstated
- modified: yes for the first group, not diffed for the second

the first group is adapted from DocKit's component set by SVDE:

- Grid
- BuildStep, BuildSteps, Glossary, InteractiveCircuit, SpecTable, ThreatLevel

the second group is stock DocKit, with any later edits not recorded. treat them as DocKit's work:

- Breadcrumb, Button, Section

the third group is DocKit layout code rewritten for the wiki set:

- CTA, MobileMenuToggle, SidebarNav, SidebarRestorePoint, ThemeSwitch

the MIT license text for DocKit is in `pouches/sutures/astro/LICENSE-DOCKIT.txt`, and `pouches/sutures/astro/DOCKIT.md` has the breakdown per component.

## Starlight

- author: the Astro contributors
- source: https://github.com/withastro/starlight
- license: MIT
- redistribution: unstated
- modified: yes

Header, Hero, Footer, PageFrame, Search, SidebarSublist, SiteTitle and TwoColumnContent are Starlight and DocKit overrides rewritten by SVDE. Search wraps Pagefind's default UI.

## Libraries

| package | author | license | used for |
|:--|:--|:--|:--|
| @noble/ed25519 | Paul Miller | MIT | signing in `src/lib/seal.ts` |
| @pagefind/default-ui | CloudCannon | MIT | the Search component |
| figlet | Patrick Gillespie and contributors | MIT | AnsiLogo lettering (ANSI Shadow font) |
| marked | the marked contributors | MIT | markdown in the footer and the tool registry |

## Fonts

in `pouches/spools/3rd-party-fonts/`, one folder per family, each with its license beside it. none was modified.

| family | by | license | license file | redistribution |
|:--|:--|:--|:--|:--|
| Atkinson Hyperlegible Next | Braille Institute | SIL OFL 1.1 | OFL.txt | stated by the license |
| Atkinson Hyperlegible Mono | Braille Institute | SIL OFL 1.1 | OFL.txt | stated by the license |
| Bedstead | Ben Harris | CC0 1.0 | COPYING | public domain dedication |
| Spectral | Production Type | SIL OFL 1.1 | OFL.txt | stated by the license |
| Spline Sans Mono | The Spline Sans Mono Project Authors | SIL OFL 1.1 | OFL.txt | stated by the license |
| VT323 | The VT323 Project Authors (Peter Hull) | SIL OFL 1.1 | OFL.txt | stated by the license |

the OFL has one condition worth knowing: the fonts may not be sold on their own.

`skins.css` names other fonts (Eater, Cabin Sketch, Cooper Black and more). they are not in this package. each site loads its own and credits them there.

## SVDE

- original Astro components: AnsiLogo (using `figlet`), Barcode, BomTable, Difficulty, ImageMod, LegalWarning, TeletextChar, ThreatModel, Win
- everything in `src/`, `css/` and `config/`, and `skins.css`

copyright the respective owners.
