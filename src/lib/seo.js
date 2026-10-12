import { SITE } from '../data/site.js';

// FR à la racine, EN sous /en. Un seul emplacement par page, alternates réciproques.
export function localizePath(path, lang) {
  const clean = path === '/' ? '/' : '/' + path.replace(/^\/|\/$/g, '');
  if (lang === 'en') return clean === '/' ? '/en' : '/en' + clean;
  return clean;
}

export function abs(path) {
  return SITE.url.replace(/\/$/, '') + path;
}

export function alternates(path) {
  return {
    fr: abs(localizePath(path, 'fr')),
    en: abs(localizePath(path, 'en')),
  };
}
