import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const name = 'Solomon (Oladimeji) Oredola';
const headline = 'Product Designer & Full-Stack Builder | Founder, Xleuth';
const routes = ['/', '/projects', '/projects/xleuth', '/projects/syn', '/404', '/writing'];
const normalise = (value: string) => value.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

for (const width of [360, 768, 1024, 1440]) {
  for (const route of routes) {
    test(`${route} at ${width}px: responsive, accessible, local assets`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      const remoteRequests: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('request', (request) => {
        if (!request.url().startsWith('http://localhost:4322') && !request.url().startsWith('data:')) remoteRequests.push(request.url());
      });
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page).toHaveTitle(new RegExp(name.replace(/[()]/g, '\\$&')));
      await expect(page.locator('.site-header')).toContainText(headline);
      await expect(page.locator('.site-footer')).toContainText(headline);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.locator('body').innerText()).not.toMatch(/\[TODO|\[CONFIRM|Fedor|Dimeji|QA Engineer/);

      for (const image of await page.locator('img:not(dialog img)').all()) {
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
        expect(await image.getAttribute('width')).toBeTruthy();
        expect(await image.getAttribute('height')).toBeTruthy();
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      // Audit readable final states, not a transient fade frame. Also expose
      // every offscreen entrance so axe checks all content, not only the viewport.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.map((issue) => ({ id: issue.id, nodes: issue.nodes.map((node) => node.target) }))).toEqual([]);
      expect(errors).toEqual([]);
      expect(remoteRequests).toEqual([]);

      await page.screenshot({ path: `test-results/screenshots/${route.replaceAll('/', '_') || 'home'}-${width}.png`, fullPage: true, animations: 'disabled' });
    });
  }
}

test('About and skills match the source brief verbatim and in order', async ({ page }) => {
  const source = readFileSync('portfolio-content.md', 'utf8');
  const aboutSource = source.split('## 3. About')[1].split('**Layout note')[0];
  const lines = aboutSource.split('\n').filter((line) => line.startsWith('>') && line.replace(/[>\s]/g, ''));
  const expected = lines.map((line) => normalise(line.replace(/^>\s?/, '').replace(/^- /, '').replaceAll('**', '')));
  await page.goto('/');
  const actual = normalise(await page.locator('#about').innerText());
  let position = 0;
  for (const line of expected) {
    const found = actual.indexOf(line, position);
    expect(found, line).toBeGreaterThanOrEqual(position);
    position = found + line.length;
  }
  const skillSource = source.split('## 8. Skills')[1].split('## 9. Writing')[0];
  const expectedSkills = [...skillSource.matchAll(/^\d+\. (.+)$/gm)].map((match) => match[1]);
  expect(await page.locator('#skills li').allTextContents()).toEqual(expectedSkills);
  await expect(page.locator('#hero-name')).toHaveText(name);
  await expect(page.locator('.role-line')).toHaveText(headline);
  await expect(page.locator('a[href="/resume.pdf"]')).toHaveCount(existsSync('public/resume.pdf') ? 1 : 0);
  await expect(page.locator('nav a[href*="writing"]')).toHaveCount(0);
});

for (const slug of ['xleuth', 'syn']) {
  test(`${slug}: lightbox keyboard, focus trap, navigation and restoration`, async ({ page }) => {
    await page.goto(`/projects/${slug}`);
    const items = page.locator('[data-gallery-item]');
    const count = await items.count();
    expect(count).toBe(readdirSync(`src/assets/projects/${slug}`).filter((name) => /\.(png|jpe?g|webp|avif)$/.test(name)).length);
    await items.first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.lightbox-counter')).toContainText(`1 / ${count}`);
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.lightbox-counter')).toContainText(`2 / ${count}`);
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('.lightbox-counter')).toContainText(`1 / ${count}`);
    await dialog.getByRole('button', { name: 'Close gallery' }).focus();
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement))).toBe(true);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(items.first()).toBeFocused();
    await expect(page.locator('svg[role="img"]')).toHaveCount(1);
  });
}

test('required disclaimers, weighting and attribution', async ({ page }) => {
  await page.goto('/projects/xleuth');
  await expect(page.locator('main')).toContainText('Not live-money. Withdrawals are intentionally disabled in the testnet MVP.');
  await expect(page.locator('article')).toContainText('designed and specified by me, implemented with AI agents, reviewed by me');
  await page.goto('/projects/syn');
  await expect(page.locator('article')).toContainText('It does not execute trades or manage user funds.');
  await expect(page.locator('article')).toContainText('The score is a screening mechanism, not a guarantee of profitability or a calibrated probability of success.');
  for (const weight of ['40%', '35%', '25%']) await expect(page.locator('article')).toContainText(weight);
  await expect(page.locator('article > p').last()).toHaveText('SYN demonstrates the application of full-stack engineering, financial data processing, and quantitative evaluation methodologies to a real-world prediction market use case.');
});

test('metadata, external safety and internal links', async ({ page, request }) => {
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', new RegExp('Founder, Xleuth'));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
    const person = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent() ?? '{}');
    expect(person.name).toBe(name);
    expect(person.jobTitle).toBe(headline);
    expect(person.url).toBeUndefined();
    for (const link of await page.locator('a[href^="https://"]').all()) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    const links = await page.locator('a[href^="/"]').evaluateAll((elements) => elements.map((element) => element.getAttribute('href')!).filter((href) => !href.includes('#')));
    for (const href of new Set(links)) expect((await request.get(href)).status(), href).toBe(200);
  }
  expect((await request.get('/social-preview.png')).headers()['content-type']).toContain('image/png');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toMatch(/example\.com|localhost|<loc>/);
  expect(sitemap).not.toContain('/writing');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /writing');
  expect(robots).not.toContain('Sitemap:');
});

test('reduced motion: no scroll animations, including preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  expect(await page.locator('[data-parallax]').first().evaluate((element) => element.getAnimations().length)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-parallax]').first()).toHaveAttribute('style', /translateY/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => page.locator('[data-parallax]').first().evaluate((element) => element.getAnimations().length)).toBe(0);
  await expect(page.locator('[data-parallax]').first()).toHaveCSS('transform', 'none');
});

test('unknown URLs serve the custom error page with HTTP 404', async ({ page }) => {
  const response = await page.goto('/this-page-is-missing');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('progressive enhancement: content and screenshot links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4322/projects/xleuth');
  await expect(page.getByRole('heading', { name: 'Xleuth', exact: true })).toBeVisible();
  const href = await page.locator('[data-gallery-item]').first().getAttribute('href');
  expect(href).toMatch(/\.webp$/);
  await context.close();
});
