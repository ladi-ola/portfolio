# Deployment checklist

## Local readiness

- [x] Static output; no runtime secrets, hosted APIs or database dependencies.
- [x] Content and owner assets remain separate from components.
- [x] No analytics, third-party runtime requests or hotlinked images.
- [x] Source identity and publication questions tracked in `REPORT.md`.
- [x] Final local check/audit results recorded in `REPORT.md`: 32 browser tests, fixture checks, zero dependency vulnerabilities, mobile Lighthouse 100 in all four categories on all public content pages.

## Owner / release prerequisites

- [ ] Supply production domain and set `productionSite` in `astro.config.mjs`.
- [ ] Rebuild and verify populated sitemap, canonicals, absolute OG URLs and robots sitemap directive.
- [ ] Verify all CONFIRM items and decide on public Xleuth links/whitepaper.
- [ ] Add `public/resume.pdf` when ready; verify download after rebuilding.
- [ ] Supply licensed Roobert file if exact primary-font matching is required.
- [ ] Review local screenshots and content in an actual screen reader/browser.

## Deploy (not performed)

- [ ] Use Node 22.23.4+ and npm 9.6.5+, then `npm ci` and `npm run build`.
- [ ] Publish only `dist/` to static hosting; do not publish the repository/source brief.
- [ ] Enable HTTPS; configure actual unknown-URL HTTP 404 using `404.html`.
- [ ] Confirm home, index, both direct project URLs, gallery and résumé if supplied.
- [ ] Check the supplied SYN live-app link separately; its application availability is outside this portfolio’s control.
- [ ] Confirm safe cache headers for hashed assets and updateable HTML.
- [ ] Run deployed-origin mobile Lighthouse and inspect the real social preview.

## Rollback

Redeploy the previous known-good static `dist/` artifact if routes, assets, content or accessibility regress. No data migration or backend rollback exists. Do not reset or discard owner files or commit changes as part of rollback.
