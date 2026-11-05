# Static portfolio decision record

Status: accepted by owner; 2026-11-04.

## Constraints and decision

Use static Astro + TypeScript, content separate from components, no server, no secrets, no trackers. Project Markdown files are discovered at build time, so adding a project does not require route/component edits. Local images are discovered by folder and optimised at build time. Native dialog supplies the gallery modal, not a project-page modal.

Astro is preferred over a hydrated React application because the site is predominantly long-form content. Plain HTML would minimise packages but duplicate routes and layouts. Motion supplies the reference's scroll-linked image movement without a React runtime.

## Reference inspection

Supplied HTML and its source https://fedor.design/ inspected using live CSS and desktop/mobile browser captures. White #fff, ink #242323, muted grey, charcoal #383838 pill buttons, restrained 30/28/24px display typography, 16px body and 20px lead. Desktop content is 960px in a 1200px outer frame with generous vertical whitespace. Header is fixed; project screenshots respond to scroll. No theme toggle was found. The reference's blue #394d9e project heading colour is used without inventing a new brand palette.

`branding.json` describes a different template and conflicts with the HTML. Owner instructed exclusive reference fidelity and authorised live inspection; HTML/live reference was chosen. No sample person’s content, testimonials, device renderings or portfolio images are copied.

Roobert is the reference’s primary commercial font. No font file/license was supplied. Manrope (also used by the reference) is self-hosted from its OFL-licensed font package. Exact Roobert matching remains conditional on a licensed owner-supplied file.

The reference includes Three.js canvas machinery, but no visible canvas interaction was established during inspection, and its background image is not an owner asset. Do not invent an effect or load a 3D engine solely to reproduce invisible implementation details.

### Motion refinement — 2026-11-05

Owner approved adding Leo Marlowe's text/scroll/hover animation language while retaining this site's existing visual design, and matching Fedor's progressive-blur fixed header. The existing Motion dependency is shared through the base layout; no React hydration or new packages. Avatar/dock effects were explicitly excluded. See `docs/motion.md` for inspected settings, accessibility fallbacks and implementation details.

## SEO decisions

The repeated identity rule requires the full headline in titles and JSON-LD, whereas section 11 supplies shorter variants. The explicit identical-everywhere requirement is applied to the full name and headline. This avoids silently truncating required verbatim text. The supplied home meta description is unchanged.

No production domain is fabricated. Site builds without one; canonical/absolute social URLs and sitemap entries activate once `productionSite` is set in `astro.config.mjs`. Hidden writing and error pages are noindex.

## Consequences

- Deployable to static hosting with no application server.
- Images and content additions require a rebuild.
- Missing résumé is omitted as a live download until the owner supplies `public/resume.pdf`.
- Domain and font license are deployment/design prerequisites, not invented values.
