# Motion layer

Owner approved **motion only** on 2026-11-05: preserve the existing content, branding, typography, layout and routes. No avatar or expanding docks.

## References inspected

- [Leo Marlowe](https://leomarlowe.framer.website/): live desktop browser inspection and published animation settings. Word entrances resolve from 6px blur and a 14px vertical offset, staggered by 50ms, over 800ms with `cubic-bezier(.22, 1, .36, 1)`. Supporting content rises 12–20px. Hover labels roll vertically; buttons respond subtly to the pointer. These behaviours are adapted to the existing portfolio, not its template's colours, fonts or layout.
- [Fedor](https://fedor.design/): fixed navigation over a white fade and eight masked backdrop-blur layers, from 0.5px to 64px. Blur tapers towards the bottom rather than ending at a hard horizontal edge. The portfolio keeps its existing header geometry; the fade extends 62px below it.

No reference assets, hosted scripts, React runtime or trackers were imported. The installed, self-hosted Motion package is reused.

## Implementation

- `src/lib/motion.ts` owns progressive enhancement, one-time viewport entrances, text splitting, rolling labels, magnetic buttons and the original restrained project-image parallax.
- `data-motion="text"` opts short, prominent text into the word reveal. `data-motion="reveal"` opts a supporting block into a fade/lift. `data-motion-delay` supplies a delay in seconds.
- `data-motion-content` on the reusable case-study article enhances its direct children automatically, including future Markdown projects. Sticky containers themselves are never transformed.
- Entrance animations use Motion's native/mini animator with explicit keyframes. Geometry reads are batched before entrance styles are written; final transforms/filters are removed after completion.
- `src/styles/global.css` contains the word/label treatment and reduced-motion safeguards. Rolling copies are `aria-hidden`; original text and accessible names remain intact. Button magnetism is limited to mouse/fine-pointer devices (maximum 4px horizontally and 3px vertically).
- `src/components/Header.astro` owns the CSS-only progressive blur. Decoration never intercepts pointer input. Browsers without backdrop filtering receive an opaque white header fallback.

HTML starts visible. JavaScript alone prepares entrances, focus immediately reveals an animated control, and content above a restored scroll position stays visible. Reduced motion disables entrances, parallax, rolling labels and magnetism; changing the preference cancels active effects. Entrances don't replay when scrolling back.

## Check locally

Run `npm run dev`, then inspect `/`, `/projects` and both case studies. Scroll slowly through About and Contact; hover a navigation label or CTA with a mouse. Enable reduced motion in browser emulation and repeat. Header position and blur work without JavaScript.

Run `npm run build` and `npm test` for the full regression suite. `tests/motion.spec.ts` checks entrance lifecycle/cleanup, one-time playback, live reduced-motion changes, keyboard access, accessible labels, hover reset, fixed/masked header at 360/768/1024/1440px, sticky case-study contents, anchor navigation and no-JavaScript content. Full-page layout captures use reduced motion so offscreen entrances don't appear as empty space in the screenshots.

Run `npm run audit` against a production preview **after** browser tests finish, not concurrently; CPU contention distorts the simulated mobile scores. Current measured results live in `docs/lighthouse/summary.json` and `docs/REPORT.md`.
