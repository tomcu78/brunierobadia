# Site BrunierObadia

Site statique reconstruit à l'identique (contenu, logo, jaune #ffff4a, monospace), avec le socle SEO / GEO complet. Astro, sortie statique.

## Commandes

- `npm install` : dépendances
- `npm run dev` : aperçu local (http://localhost:4321)
- `npm run build` : génère le site dans `dist/`
- `npm run preview` : sert `dist/`

## Contenu

Tout le contenu est dans `src/data/site.js` (projets, clients, textes, offres). Il vient de la base Airtable du studio, repris tel quel. Rien n'est inventé.

## Structure

- `src/layouts/Base.astro` : en-tête SEO/GEO (title, description, canonical, hreflang, Open Graph, JSON-LD Organization + WebSite).
- `src/lib/seo.js` : URLs localisées FR/EN et alternates.
- `src/components/ProjectGrid.astro` : grille des projets (3 colonnes, gap 2px, item 440px).
- `src/styles/global.css` : design system repris du site actuel.
- `src/pages/` : FR à la racine, EN sous `/en`.
- `public/robots.txt` : crawlers IA explicitement autorisés.
- `public/.htaccess` : redirections 301 des anciennes URLs, cache, 404.
- `public/fonts/Aeroport-monospaced.ttf`, `public/assets/`, `public/projets/` : assets d'origine.

## SEO / GEO en place

- HTML statique: le contenu est présent sans JavaScript.
- Un H1 par page, titres et descriptions uniques.
- canonical, hreflang fr/en/x-default, Open Graph, Twitter Card.
- JSON-LD: Organization, WebSite, ItemList, CreativeWork (projets), BreadcrumbList, Service.
- sitemap-index.xml généré au build, robots.txt avec autorisation explicite des crawlers IA.
- Redirections 301 des anciennes URLs Airtable.
