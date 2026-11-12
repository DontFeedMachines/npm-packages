// barrel for @dontfeedmachines/fieldkit/astro. re-exports the generic shared .astro files as named
// exports, the same way @astrojs/starlight/components does, so authoring surfaces can do
// `import { ThreatLevel, SpecTable } from '@dontfeedmachines/fieldkit/astro'`.
// the wiki set (Header, Hero, Footer, PageFrame and their helpers) needs Starlight and
// the fieldkitWiki integration, so it is not in the barrel; import it by path, e.g.
// `@dontfeedmachines/fieldkit/astro/Header.astro`.
export { default as BomTable } from "./BomTable.astro";
export { default as BuildStep } from "./BuildStep.astro";
export { default as BuildSteps } from "./BuildSteps.astro";
export { default as Difficulty } from "./Difficulty.astro";
export { default as Glossary } from "./Glossary.astro";
export { default as Grid } from "./Grid.astro";
export { default as ImageMod } from "./ImageMod.astro";
export { default as InteractiveCircuit } from "./InteractiveCircuit.astro";
export { default as LegalWarning } from "./LegalWarning.astro";
export { default as SpecTable } from "./SpecTable.astro";
export { default as ThreatLevel } from "./ThreatLevel.astro";
export { default as ThreatModel } from "./ThreatModel.astro";
export { default as Win } from "./Win.astro";
export { default as Barcode } from "./Barcode.astro";
export { default as TeletextChar } from "./TeletextChar.astro";
