import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('word reveals enter on scroll, settle cleanly and play only once', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('#hero-name');
  await expect(hero.locator('.motion-word')).toHaveCount(3);
  await expect(hero).toHaveAttribute('data-motion-state', 'visible');
  const lead = page.locator('.about-lead');
  await expect(lead).toHaveAttribute('data-motion-state', 'pending');
  expect(await lead.locator('.motion-word').first().evaluate((word) => getComputedStyle(word).opacity)).toBe('0');
  await lead.scrollIntoViewIfNeeded();
  await expect(lead).toHaveAttribute('data-motion-state', 'entering');
  const frames = await lead.locator('.motion-word').first().evaluate((word) => word.getAnimations().flatMap((effect) => (effect.effect as KeyframeEffect).getKeyframes()));
  expect(frames.some((frame) => frame.filter === 'blur(6px)')).toBe(true);
  await expect(lead).toHaveAttribute('data-motion-state', 'visible');
  for (const word of await lead.locator('.motion-word').all()) {
    await expect(word).toHaveCSS('opacity', '1');
    await expect(word).toHaveCSS('filter', 'none');
    await expect(word).toHaveCSS('transform', 'none');
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await lead.scrollIntoViewIfNeeded();
  expect(await lead.locator('.motion-word').evaluateAll((words) => words.flatMap((word) => word.getAnimations()).length)).toBe(0);
  await page.waitForFunction(() => !document.querySelector('[data-motion-state="entering"]'));
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test('reduced motion reveals all content and cancels active entrances immediately', async ({ page }) => {
  await page.goto('/');
  await page.locator('.about-lead').scrollIntoViewIfNeeded();
  await expect(page.locator('.about-lead')).toHaveAttribute('data-motion-state', 'entering');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
  const styles = await page.locator('[data-motion], .motion-word').evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { opacity: style.opacity, filter: style.filter, transform: style.transform };
  }));
  expect(styles.every((style) => style.opacity === '1' && style.filter === 'none' && style.transform === 'none')).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-parallax]').first()).toHaveAttribute('style', /translateY/);
  await expect(page.locator('.about-lead')).toHaveAttribute('data-motion-state', 'visible');
});

test('keyboard focus never waits for an entrance and rolling labels keep their accessible names', async ({ page }) => {
  await page.goto('/');
  const contact = page.locator('#contact .button');
  await contact.focus();
  await expect(contact).toBeFocused();
  await expect(contact).toHaveCSS('opacity', '1');
  await expect(contact).toHaveCSS('transform', 'none');
  await expect(contact).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.getByRole('link', { name: 'View my work', exact: false })).toHaveCount(1);
  await expect(page.locator('.site-header nav').getByRole('link', { name: 'Work', exact: true })).toHaveCount(1);
  expect(await page.locator('.motion-label-copy:not([aria-hidden="true"])').count()).toBe(0);
});

test('hover labels roll and magnetic buttons reset; reduced motion disables both', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.hero-actions .button');
  await expect(page.locator('.hero-actions')).toHaveAttribute('data-motion-state', 'visible');
  await button.hover({ position: { x: 20, y: 20 } });
  await expect(button).toHaveAttribute('style', /--magnet-x:/);
  await expect(button.locator('.motion-label-original')).not.toHaveCSS('transform', 'none');
  await page.mouse.move(0, 500);
  await expect(button).not.toHaveAttribute('style', /--magnet-x:/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await button.hover({ position: { x: 20, y: 20 } });
  await expect(button).toHaveCSS('translate', 'none');
  await expect(button.locator('.motion-label-original')).toHaveCSS('transform', 'none');
});

for (const width of [360, 768, 1024, 1440]) {
  test(`fixed progressive-blur navigation stays usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const header = page.locator('.site-header');
    const initial = await header.boundingBox();
    await page.evaluate(() => window.scrollTo({ top: 1000, behavior: 'instant' }));
    expect((await header.boundingBox())?.y).toBe(initial?.y);
    await expect(header).toHaveCSS('position', 'fixed');
    const layers = await page.locator('.header-blur span').evaluateAll((elements) => elements.map((element) => {
      const style = getComputedStyle(element);
      return { filter: style.backdropFilter, mask: style.maskImage, pointer: style.pointerEvents };
    }));
    expect(layers).toHaveLength(8);
    expect(layers.every((layer) => layer.filter.includes('blur(') && layer.mask.includes('linear-gradient') && layer.pointer === 'none')).toBe(true);
    await page.locator('.site-header nav a[href="/#about"]').click();
    await expect(page).toHaveURL(/#about$/);
    await expect.poll(async () => (await page.locator('#about-title').boundingBox())!.y).toBeGreaterThan(initial!.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('case-study reveals preserve sticky contents and direct anchor navigation', async ({ page }) => {
  await page.goto('/projects/xleuth');
  const heading = page.locator('.prose > h2[id]').last();
  const id = await heading.getAttribute('id');
  await page.locator(`.contents a[href="#${id}"]`).click();
  await expect(heading).toHaveAttribute('data-motion-state', 'visible');
  await expect(page.locator('.contents')).toHaveCSS('position', 'sticky');
  await expect(page.locator('.case-study')).toHaveCSS('transform', 'none');
  expect((await heading.boundingBox())!.y).toBeGreaterThan((await page.locator('.site-header').boundingBox())!.height);
});

test('no-JavaScript home remains fully readable with usable navigation', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://localhost:4322/');
  await expect(page.locator('#hero-name')).toHaveCSS('opacity', '1');
  await expect(page.locator('.about-lead')).toHaveCSS('opacity', '1');
  await expect(page.locator('.motion-word')).toHaveCount(0);
  await page.locator('.site-header nav a[href="/#about"]').click();
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('.site-header')).toHaveCSS('position', 'fixed');
  await context.close();
});
