import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { identity } from '../content/site';

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Deterministic typographic social preview: no external service or invented image.
export const GET: APIRoute = async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <text x="90" y="270" font-family="Arial,sans-serif" font-size="51" letter-spacing="-2" fill="#242323">${escape(identity.name)}</text>
    <text x="90" y="340" font-family="Arial,sans-serif" font-size="33" letter-spacing="-1" fill="#686565">${escape(identity.headline)}</text>
  </svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
