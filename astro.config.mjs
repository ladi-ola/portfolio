import { defineConfig } from 'astro/config';

// Set the real origin here when supplied. No invented production URLs.
export const productionSite = undefined;

export default defineConfig({
  site: productionSite,
  output: 'static',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
