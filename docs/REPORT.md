# Build report

## Status

Implementation and local QA complete. The source brief, reference originals and supplied image originals are unchanged. No commit, push or production deployment performed. Owner publication confirmations and deployment prerequisites remain open below.

## Run and deploy

Requires Node 22.23.4+ and npm 9.6.5+. Run `npm ci`, then `npm run dev` (http://localhost:4321). Run `npm run build` to generate `dist/`, and `npm run preview` to inspect it. This workstation’s temporary supported runtime can be selected with `export PATH=/tmp/opencode/portfolio-runtime/node_modules/.bin:$PATH`.

Deploy only `dist/` to static hosting after setting the actual production origin in `astro.config.mjs`; no application server, database or secrets are required. Configure real unknown-URL HTTP 404 responses using `404.html`. Full instructions are in `../README.md` and `deploy-checklist.md`.

## Delivered

- Home: exact name/headline, supplied hero copy, both internal work links, full verbatim About, ordered skill list, experience and contact.
- `/projects`, `/projects/xleuth`, `/projects/syn`, custom 404, and hidden/noindex `/writing` scaffold.
- One reusable project layout and one Markdown file per project; new projects automatically appear on home/index/routes/sitemap.
- All five supplied screenshots, automatically discovered filename-sorted galleries, native-dialog lightbox and empty-folder placeholders.
- Supplied profile photo, optimised responsive local images with dimensions, inline SVG architecture diagrams, keyboard/focus/reduced-motion handling.
- Reference-derived white/grey visual system and dark pill buttons. Owner-approved motion refinement adds staggered blur-to-sharp text reveals, one-time scroll entrances, rolling labels and subtle magnetic buttons; original project-image parallax is retained. Shared self-hosted Motion runs through the base layout with reduced-motion and no-JavaScript fallbacks.
- Fixed navigation now matches Fedor's progressive masked blur and fading white overlay rather than a nearly opaque, hard-edged backdrop. Header geometry, content and site branding are unchanged; avatar/dock effects were explicitly excluded. See `motion.md`.
- Page-specific metadata, consistent identity/headline, generated local 1200×630 social preview, favicon, JSON-LD Person, domain-aware robots/sitemap.
- README, checkable task list, architecture decisions, tests, Lighthouse reports and deployment checklist.

## Owner inputs still open

Every TODO/CONFIRM in `portfolio-content.md` is tracked below. These markers are not rendered on the site.

### TODO

| Source | Missing input | Treatment |
| --- | --- | --- |
| 5 / Xleuth links | Live app URL | Omitted; no guessed URL |
| 5 / Xleuth links | GitHub URL or private status | Omitted |
| 5 / Xleuth links | Whitepaper URL/PDF | Omitted |
| 5 / Xleuth links | Demo video | Omitted |
| 5.3 | Optional note on key design decisions | Omitted; existing design description retained |
| 6 / SYN links | GitHub URL or private status | Omitted; supplied live-app URL used |
| 7 / HNG | One or two bullets about design work | Role shown without invented bullets |
| 9 | Writing platforms, handles, v1 links | Hidden/noindex scaffold, no posts invented |
| 10 | X/Twitter | Omitted |
| 10 | Résumé PDF | Pending file at `public/resume.pdf`; no broken download link |
| 10 | Xleuth whitepaper link/PDF and public status | Omitted; author line not published without document |
| 11 | Production domain | Owner explicitly deferred; no fake canonical/production URL |

### CONFIRM

| Source | Value/question | Treatment |
| --- | --- | --- |
| 1 | Nigeria (Lagos) | Used as supplied |
| 5 | Xleuth July 2026 to present | Used as supplied, including experience |
| 5.6 | Happy to publish design-to-code / AI-agent lesson? | Supplied lesson retained |
| 5.8 | Solidity attribution wording | Exact required attribution retained |
| 7 | SYN as independent project rather than job? | Product role retained; linked to its case study, not presented as employment at a company |
| 7 | HNG internship dates | Unknown dates omitted |
| 7 | Show earlier career? | Single collapsed generic line only, no employer/date detail |

## Additional constraints

- The reference uses commercial Roobert. No licensed file supplied; self-hosted Manrope is also present in the reference. See `docs/architecture.md`.
- Images are the owner’s supplied screenshots, not fabricated previews. No sample portfolio photographs, badges or testimonial content reused.
- The owner explicitly authorised initial copies from `reference/pictures/` into asset folders. These copies remain read-only during development.
- Full verbatim identity/headline requirements take precedence over the shortened SEO examples. See `docs/architecture.md`.
- The production origin is deliberately unset. Sitemap generation is implemented and tested with a reserved test origin in an isolated copy, but the delivered sitemap contains no URLs until the real origin is supplied. Canonical/absolute social URLs and Person URL are likewise deferred. Do not submit this empty sitemap to search engines.
- No résumé file was supplied. Its download appears automatically after the owner adds `public/resume.pdf` and rebuilds. This presence switch was verified in an isolated fixture, without adding a résumé to the actual project.

## Verification

### Build and browser checks

- `npm run build`: passes; Astro/TypeScript report **0 errors, 0 warnings, 0 hints**.
- `npm test`: **42 passed** after the motion refinement. Includes all six HTML routes at 360, 768, 1024 and 1440px; zero page-level horizontal overflow; all visible local images decode and have dimensions; no remote runtime requests or browser exceptions.
- axe scans: **zero automated violations** at every required viewport and with both project lightboxes open.
- Keyboard lightbox navigation, reverse-tab focus containment, Escape, focus restoration, no-JavaScript image-link fallback and live reduced-motion preference changes pass.
- Source-brief comparison confirms full About wording and sequence, exact name/headline and exact ordered skills. Required project disclaimers, attribution and SYN closing line pass.
- Internal links, external-link safety, metadata, unknown-URL HTTP 404, hidden writing and absent-domain safeguards pass.
- `npm run test:fixtures`: passes for empty screenshots, one-file new-project discovery, résumé detection and domain-configured canonical/social/sitemap/robots. Only a temporary copy was changed; no fake project or résumé exists in live content.
- `npm audit`: **0 vulnerabilities** in the installed dependency tree.
- Browser captures reviewed against the reference at desktop/mobile, including the gallery and diagram. All six copied image files compare byte-for-byte with the supplied originals.
- Motion regressions: one-time word/scroll entrances, complete filter/transform cleanup, keyboard focus during an entrance, rolling labels with unchanged accessible names, pointer reset, mid-animation reduced-motion cancellation, fixed/masked header at all four widths, sticky case-study contents and direct anchors all pass. All-content axe scans use reduced motion; a separate settled normal-motion scan also passes.
- Geometry comparison with/without JavaScript at all four widths confirms unchanged hero/About widths and line heights (only subpixel transform rounding below 0.001px). Source content, owner images and dependencies are unchanged. No avatar, docks or redesign were introduced.

### Measured mobile Lighthouse

Final post-motion audit (2026-11-05): local static production preview at `http://localhost:4323`, Lighthouse 13.5.0, Chromium, mobile 412×823 at DPR 1.75 with simulated mobile throttling, run separately from browser tests. Scores are from the final local build, not a deployed host or a guarantee of production scores.

| Route | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| `/` | 100 | 100 | 100 | 100 |
| `/projects` | 100 | 100 | 100 | 100 |
| `/projects/xleuth` | 100 | 100 | 100 | 100 |
| `/projects/syn` | 99 | 100 | 100 | 100 |

Machine-readable timestamps/results: `lighthouse/summary.json`. Full reports: `lighthouse/home.html`, `lighthouse/projects.html`, `lighthouse/projects-xleuth.html`, `lighthouse/projects-syn.html` (with corresponding JSON files). Noindex error/writing pages are intentionally not SEO-scored as public content pages.

All routes meet the 95+ target. Lighthouse still identifies optional font/CSS request-chain and JavaScript savings; these are not claimed as eliminated. Reference-derived motion settings and maintenance guidance are in `motion.md`.

### Limitations / still to verify

Automated accessibility checks do not replace actual screen-reader testing. Chromium was tested; no Safari/Firefox or real-device testing is claimed. Architecture diagrams use a horizontally scrollable, keyboard-focusable region on small screens to keep labels readable; the complete flow is also supplied as text. Real-host headers, domain/canonical URLs, social crawler output and production Lighthouse need verification after deployment. The external SYN application is not under this site’s control.

## Deliberately not built

No theme toggle (none in reference), contact form, analytics, trackers, testimonials, fabricated metrics, additional public sections, trading features or invented project links. No React hydration or invisible Three.js canvas. Writing is scaffold-only and hidden.
