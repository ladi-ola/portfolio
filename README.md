# Solomon’s portfolio

Static Astro + TypeScript portfolio for **Solomon (Oladimeji) Oredola**. Content comes from `portfolio-content.md`; design follows the supplied HTML reference and its live source. The originals in `reference/`, `skills/` and the content brief are not modified.

## Run

Requires **Node 22.23.4+** and **npm 9.6.5+** (the patched Astro release’s requirements).

```sh
npm ci
npm run dev
```

Open **http://localhost:4321**. To inspect production output:

```sh
npm run build
npm run preview
```

`dist/` is the deployable website. No secrets, environment variables, database or server adapter are required.

### This workstation

The system’s original Node/npm are too old for the latest patched Astro. An isolated, temporary runtime was installed without changing system tools. In this session you can use:

```sh
export PATH=/tmp/opencode/portfolio-runtime/node_modules/.bin:$PATH
npm run dev
```

That temporary runtime is not a project dependency or a deployment requirement; use a supported Node installation on other machines. If Astro reports an existing background server, use `npx astro dev stop` before restarting, or `npx astro dev --ignore-lock --port 4323` for a separate foreground instance.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Reproducible install from lockfile |
| `npm run dev` | Local development, port 4321 |
| `npm run build` | Type-check and generate static output |
| `npm run preview -- --port 4322` | Serve `dist/` for checks |
| `npm run lint` | Astro/TypeScript diagnostics |
| `npm test` | Chromium responsive, accessibility and interaction suite; starts/reuses preview on 4322 |
| `npm run test:fixtures` | Build isolated edge-case copy: empty images, one-file new project, domain-aware SEO |
| `npm run audit` | Mobile Lighthouse for all four public content routes; requires preview on 4322 |
| `npm audit` | Dependency security audit (different from the Lighthouse script) |

Install the test browser once:

```sh
npx playwright install chromium
npm run build
npm test
```

Linux may require Chromium system dependencies (`npx playwright install-deps chromium`). `docs/testing.md` describes coverage and limitations. Test screenshots and HTML reports are in ignored `test-results/` and `playwright-report/`. Lighthouse HTML/JSON reports are saved in `docs/lighthouse/`; they are not deployed with the site.

## Edit content

- `src/content/site.ts`: shared identity, hero, full About, ordered skills, experience, UI labels, contact and SEO copy.
- `src/content/projects/xleuth.md` and `syn.md`: project metadata and case-study Markdown.
- `src/layouts/ProjectLayout.astro`: the shared case-study page.
- `src/styles/global.css`: reference-derived typography, colours and spacing.

The content brief remains authoritative. Do not add unverified facts. Required verbatim text must not be shortened; keep all supplied disclaimers and honest implementation attribution. Open inputs and publication confirmations are in **[`docs/REPORT.md`](docs/REPORT.md)**, not rendered as markers on the site.

## Add images

The provided profile and project screenshots were initially copied from `reference/pictures/` without altering those originals. Add further owner-supplied images to:

```text
src/assets/projects/xleuth/
src/assets/projects/syn/
```

Use lowercase `.png`, `.jpg`, `.jpeg`, `.webp` or `.avif` extensions. Prefix filenames if you want a specific order: galleries discover images automatically and sort by filename. No component edits are necessary. The owner controls these image folders; the agent treats existing images as read-only.

Astro creates dimensioned responsive WebP variants. The lightbox uses a higher-quality local version with keyboard controls, focus containment, Escape to close and focus restoration. Without JavaScript, screenshot links open the full-size image. Empty folders produce a clean placeholder, not a broken image. The site’s single light theme is independent of light/dark product screenshots.

The profile is at `src/assets/profile/solomon.jpg`. Its accessible name uses the exact display name.

## Add a project

Add one `.md` file under `src/content/projects/`, with frontmatter following the existing examples:

- `slug`: unique lowercase path/folder name.
- `order`, `title`, `summary`, `cardSummary`, `status`, `role`, `dates`, `tags`.
- `cover`: optional filename in that project’s image folder; otherwise first available image is used.
- `links`: optional supplied URLs, each with `label` and `href`.
- `diagram`: optional SVG graph data (`description`, `width`, `height`, `nodes`, `edges`), following the existing examples.
- Markdown headings start at `##`; the layout supplies the page’s H1 and generates its contents links.

Create the matching image folder when ready. The home card, projects index, project route, next-project link and domain-configured sitemap all discover the file automatically. No route registration or component change is needed. Only add content approved in the source brief.

External links in frontmatter open safely in a new tab. If you add raw external Markdown links, apply `target="_blank" rel="noopener noreferrer"` using an HTML anchor so they follow the same rule.

## Résumé

The owner should add **`public/resume.pdf`**. Rebuild; the hero automatically switches from an unobtrusive pending label to the working **Download résumé** link at `/resume.pdf`. No fabricated PDF or broken download is included.

## Domain and deployment

The owner deferred the production domain. In `astro.config.mjs`, replace the `undefined` value of `productionSite` with the actual HTTPS origin, then rebuild. This enables:

- Absolute canonical URLs and `og:url`.
- Absolute social-image URLs and Person URL.
- Populated `sitemap.xml` and the sitemap directive in `robots.txt`.

Until then, no production origin is guessed. `sitemap.xml` has no URL entries and is **not submission-ready**; social crawlers may not resolve the relative image URL. This is an explicit deployment prerequisite, not a fabricated finished sitemap.

### Static hosting

1. Set the actual domain and resolve publication confirmations in the report.
2. Install using the supported Node/npm versions.
3. Run `npm ci`, `npm run build`, `npm test`, and inspect the local preview.
4. Deploy **only `dist/`** to a static host (for example Vercel, Netlify or Cloudflare Pages). Build command: `npm run build`; publish directory: `dist`. No server adapter or SPA catch-all rewrite is needed.
5. Enable HTTPS and configure the host to serve `404.html` for unknown URLs with HTTP 404. Verify direct project-page navigation and the supplied SYN external link.
6. Add long-lived immutable cache headers for `/_astro/*`; do not cache HTML indefinitely. Re-run Lighthouse against the deployed origin.

For Cloudflare, choose static Pages hosting, not a worker application. With manual Nginx hosting, use directory-index resolution and an `error_page 404 /404.html` rule, not an SPA fallback. See `docs/deploy-checklist.md`.

No production deployment, domain registration, commit or push has been performed.

## Design notes

The supplied HTML and live reference take precedence over the conflicting orange-red branding export. The site follows the reference’s white canvas, calm scale, grey text, dark rounded buttons, generous whitespace and scroll-linked project imagery. It has no theme toggle, trackers, testimonials or borrowed sample project images.

The reference’s commercial **Roobert** font was not supplied with a license; self-hosted **Manrope**, also used by the reference, is used instead. A licensed Roobert font file is needed for exact primary-font matching. Its SIL Open Font License is included in `public/manrope-license.txt` and the installed font package.

Architecture and conflict-resolution decisions are documented in `docs/architecture.md`.

### Animation

The owner-approved motion layer borrows Leo Marlowe's staggered blur-to-sharp text reveals, scroll entrances and rolling/magnetic hover interactions, while preserving this site's design. The navigation stays fixed over Fedor's progressive-blur treatment. Reduced motion and no-JavaScript fallbacks are supported; no avatar, docks or extra dependencies were added.

Motion settings and testing guidance are in [`docs/motion.md`](docs/motion.md). Shared behaviour lives in `src/lib/motion.ts`; use the existing `data-motion` attributes to opt elements in. Run Lighthouse separately from browser tests for meaningful performance results.
