import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.brunierobadia.com',
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  // Brand transformation a remplacé Performance digitale : l'ancienne adresse mène à la nouvelle offre
  redirects: {
    '/offres/performance-digitale': '/offres/brand-transformation',
    '/en/offres/performance-digitale': '/en/offres/brand-transformation',
  },
  build: { inlineStylesheets: 'auto' },
  // NOMIN=1 : construction non compressée, pour lire les traces de performance
  vite: process.env.NOMIN ? { build: { minify: false } } : {},
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: {
          fr: 'fr',
          en: 'en',
        },
      },
      serialize(item) {
        if (item.url !== 'https://www.brunierobadia.com/' && item.url.endsWith('/')) {
          item.url = item.url.slice(0, -1);
        }
        if (item.links) {
          const cleanLinks = item.links.map((link) => {
            let url = link.url;
            if (url !== 'https://www.brunierobadia.com/' && url.endsWith('/')) {
              url = url.slice(0, -1);
            }
            return { ...link, url };
          });
          const frLink = cleanLinks.find((l) => l.lang === 'fr');
          if (frLink && !cleanLinks.some((l) => l.lang === 'x-default')) {
            cleanLinks.push({ lang: 'x-default', url: frLink.url });
          }
          item.links = cleanLinks;
        }
        return item;
      },
      filter: (page) => !page.includes('/mentions-legales') && !page.includes('/confidentialite'),
    }),
  ],
});
