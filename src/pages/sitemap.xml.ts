import type { APIRoute } from 'astro';
import { projects } from '../lib/projects';

export const GET: APIRoute = ({ site }) => {
  const paths = ['/', '/projects', ...projects.map((project) => `/projects/${project.frontmatter.slug}`)];
  const entries = site ? paths.map((path) => `<url><loc>${new URL(path, site).href.replace(/&/g, '&amp;')}</loc></url>`).join('') : '<!-- Production domain not supplied. Set productionSite and rebuild to populate. -->';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
