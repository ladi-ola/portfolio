import { cp, mkdtemp, mkdir, readFile, writeFile, symlink, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

// No edits to owner image folders or live content: all edge cases run in a copy.
const root = resolve('.');
const originalProjectFiles = await readdir(join(root, 'src/content/projects'));
const temporaryRoot = process.env.FIXTURE_TMPDIR ?? (process.platform === 'linux' ? '/tmp/opencode' : tmpdir());
const fixture = await mkdtemp(join(temporaryRoot, 'portfolio-fixture-'));
for (const name of ['src', 'public', 'tsconfig.json', 'astro.config.mjs', 'package.json']) {
  await cp(join(root, name), join(fixture, name), {
    recursive: true,
    filter: (source) => !source.startsWith(join(root, 'src/assets/projects/')),
  });
}
await mkdir(join(fixture, 'src/assets/projects'), { recursive: true });
await symlink(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
const configPath = join(fixture, 'astro.config.mjs');
const config = await readFile(configPath, 'utf8');
await writeFile(configPath, config.replace('productionSite = undefined', "productionSite = 'https://portfolio.test'"));
const syn = await readFile(join(fixture, 'src/content/projects/syn.md'), 'utf8');
// Reuse supplied content; only a test route slug/order changes, not portfolio facts.
await writeFile(join(fixture, 'src/content/projects/fixture.md'), syn.replace('slug: syn', 'slug: fixture').replace('order: 2', 'order: 3'));
// Simulates owner-supplied file presence only; this is not an authored résumé.
await writeFile(join(fixture, 'public/resume.pdf'), '%PDF-1.4\n% fixture: file-presence test only\n');

execFileSync(process.execPath, [join(root, 'node_modules/astro/bin/astro.mjs'), 'build', '--root', fixture], {
  cwd: fixture,
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  stdio: 'pipe',
});
const home = await readFile(join(fixture, 'dist/index.html'), 'utf8');
const project = await readFile(join(fixture, 'dist/projects/xleuth/index.html'), 'utf8');
const newProject = await readFile(join(fixture, 'dist/projects/fixture/index.html'), 'utf8');
const index = await readFile(join(fixture, 'dist/projects/index.html'), 'utf8');
const sitemap = await readFile(join(fixture, 'dist/sitemap.xml'), 'utf8');
const robots = await readFile(join(fixture, 'dist/robots.txt'), 'utf8');
assert(home.includes('Screenshots will be added here.'));
assert(project.includes('Screenshots will be added here.'));
assert(!/<a\b[^>]*data-gallery-item/.test(project));
assert(/<h1\b[^>]*>SYN<\/h1>/.test(newProject));
assert(home.includes('href="/projects/fixture"'));
assert(index.includes('href="/projects/fixture"'));
assert(sitemap.includes('https://portfolio.test/projects/fixture'));
assert(!sitemap.includes('/writing'));
assert(home.includes('rel="canonical" href="https://portfolio.test/"'));
assert(home.includes('content="https://portfolio.test/social-preview.png"'));
assert(home.includes('href="/resume.pdf"'));
assert(!home.includes('Résumé coming soon'));
assert(robots.includes('Sitemap: https://portfolio.test/sitemap.xml'));
assert.deepEqual(await readdir(join(root, 'src/content/projects')), originalProjectFiles);
console.log(`PASS: empty image folders, one-file project discovery, résumé presence, domain-aware canonical/social/sitemap/robots. Fixture retained at ${fixture}`);
