import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.AUDIT_ORIGIN ?? 'http://localhost:4322';
const routes = ['/', '/projects', '/projects/xleuth', '/projects/syn'];
await mkdir('docs/lighthouse', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--remote-debugging-port=9222'],
});
const results = [];
try {
  for (const route of routes) {
    const result = await lighthouse(`${origin}${route}`, {
      port: 9222,
      output: ['html', 'json'],
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      formFactor: 'mobile',
      throttlingMethod: 'simulate',
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
    });
    if (!result) throw new Error(`No Lighthouse result for ${route}`);
    const filename = route === '/' ? 'home' : route.slice(1).replaceAll('/', '-');
    await writeFile(`docs/lighthouse/${filename}.html`, result.report[0]);
    await writeFile(`docs/lighthouse/${filename}.json`, result.report[1]);
    const scores = Object.fromEntries(Object.entries(result.lhr.categories).map(([key, value]) => [key, Math.round(value.score * 100)]));
    const entry = { route, ...scores };
    results.push(entry);
    console.log(JSON.stringify(entry));
    for (const [id, audit] of Object.entries(result.lhr.audits)) {
      if (audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== 'informative') console.log(`${route}: ${id} — ${audit.title} (${audit.displayValue ?? audit.description.slice(0, 100)})`);
    }
  }
} finally {
  await browser.close();
}
await writeFile('docs/lighthouse/summary.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  origin,
  note: 'Local static preview, simulated mobile throttling. Not a production-host audit.',
  results,
}, null, 2));
if (results.some((entry) => Object.entries(entry).some(([key, score]) => key !== 'route' && score < 95))) process.exitCode = 1;
