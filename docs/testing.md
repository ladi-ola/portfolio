# Test strategy

Run `npm run build`, then `npm test`. Tests use a local static preview, not the development server. Playwright installs Chromium with `npx playwright install chromium` (Linux may need system browser dependencies).

## Coverage

| Area | Type | Acceptance |
| --- | --- | --- |
| All six HTML routes | Browser + axe | 360/768/1024/1440 widths; no page overflow; one H1; zero automated accessibility violations |
| About and skills | Source-brief comparison | Full verbatim About in sequence; exact skill list and order |
| Images and network | Browser integration | Dimensions present, decoded local assets; no remote runtime requests |
| Project routing | Browser integration | Internal links resolve to pages, never project modals |
| Lightbox | Keyboard/browser + axe | Native modal, arrow navigation, focus containment/restoration, Escape; no-JS image links |
| Content safeguards | Browser assertions | No TODO/CONFIRM markers or unrelated sample identity; mandatory testnet/SYN disclaimers and honest attribution |
| Metadata and domain | HTTP + DOM | Consistent identity, per-page metadata, local social image, no guessed origin; writing excluded |
| Motion | Browser | One-time word/scroll entrances, filter/transform cleanup, reduced motion at load and mid-animation, accessible rolling labels, keyboard reveal, pointer reset and no-JS fallback |
| Fixed navigation | Browser | Progressive-blur masks and fixed geometry at all four widths; clickable links and unobscured section anchors |
| Performance | Mobile Lighthouse | Target 95+ in all four categories on public content routes |
| Visual review | Manual browser captures | Review screenshots against reference character, not fabricated pixel-identical content |

## Remaining manual checks

Automated axe checks do not prove full accessibility. Before release, confirm screen-reader reading order, comfortable long-form reading, browser-native focus at high zoom, image captions with new owner assets, and actual production URLs/headers. No claims are made about Safari/Firefox until tested there.

Empty galleries, new-project discovery, résumé-file presence and domain-configured metadata are tested with `npm run test:fixtures` against a temporary copy of the project, never by changing owner image directories. No fake project or résumé is left in production content.

The first test pass found label-in-name mismatches caused by unnecessary ARIA overrides, reverse-tab behaviour leaving the lightbox controls, and Motion's queued transform reset after a reduced-motion preference change. Removing the overrides, explicit modal control wrapping, stopping Motion and a reduced-motion CSS guard fixed these issues. Tests cover the regressions. The fixture test also caught and fixed résumé detection based on bundled `import.meta.url` rather than the build’s working directory.

The motion refinement adds `tests/motion.spec.ts`. It caught queued final-style writes from the hybrid animator leaving a `blur(0px)` filter on completed words; entrances now use Motion's native/mini animator and remove final styles synchronously. All-content axe scans and full-page captures enable reduced motion to expose offscreen sections and avoid measuring contrast in a transient fade frame. A separate normal-motion axe scan waits for entrances to settle. Run Lighthouse separately from the browser suite to avoid CPU contention. Reference settings and scope are recorded in `motion.md`.
