// Transition par la boule, de l'accueil vers une offre (éléments partagés).
// Au clic sur une offre :
//  - sa boule quitte sa ligne, décrit un arc en roulant sur elle-même et se pose à sa place dans le bandeau de l'offre,
//    où une lueur s'allume puis s'éteint ;
//  - le titre de l'offre quitte sa ligne et vole jusqu'au grand titre de la page ;
//  - l'accueil recule légèrement en s'effaçant, la page de l'offre se construit autour (texte, puis bouton).
// Le trajet est calculé par le navigateur (View Transitions) ; l'arc et le roulement remplacent son trajet en ligne
// droite. Navigateurs sans View Transitions, ou « réduire les animations » : navigation normale.
const ORBS = {
  creation: '/brand/sphere-rouge.svg',
  'brand-transformation': '/brand/vectors/sphere-rose.svg',
  'la-marque-dans-les-ia': '/brand/sphere-corail-560.webp',
};
const KEY = 'bo-ball-from';
const DUR = 1150;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);   // part en douceur, accélère, se pose
const easeOut = (t) => 1 - (1 - t) ** 3;

let flight = null;                                              // { slug, from: {x, y, d} } pendant une transition aller

// position de la boule posée sur sa ligne d'offre (même calcul que l'animation des boules)
function ballOf(link) {
  const r = (link.querySelector('h3') || link).getBoundingClientRect();
  const d = clamp(r.height * 2.6, 64, 96);
  return { x: r.left - 26 - d / 2, y: r.top + r.height / 2, d };
}

addEventListener('click', (e) => {
  const a = e.target.closest?.('a.op-offer');
  if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (reduce() || !document.startViewTransition) return;
  const slug = a.getAttribute('href').split('/').pop();
  if (!ORBS[slug]) return;
  const b = ballOf(a);
  // copie fixe de la boule, exactement sur la boule animée : c'est elle qui part en voyage
  const ghost = new Image();
  ghost.src = ORBS[slug]; ghost.alt = ''; ghost.setAttribute('aria-hidden', 'true');
  ghost.style.cssText = `position:fixed;left:${b.x - b.d / 2}px;top:${b.y - b.d / 2}px;width:${b.d}px;height:${b.d}px;z-index:60;pointer-events:none;view-transition-name:offer-orb-${slug};`;
  document.body.appendChild(ghost);
  const h3 = a.querySelector('h3');
  if (h3) h3.style.viewTransitionName = `offer-title-${slug}`;  // le titre part aussi
  flight = { slug, from: b };
  sessionStorage.setItem(KEY, JSON.stringify({ slug, home: location.pathname, y: scrollY }));
  // le routeur d'Astro prend ensuite le clic en charge et lance la transition
}, true);

document.addEventListener('astro:before-swap', (e) => {
  if (!flight) return;
  const { slug, from } = flight;
  flight = null;
  const vt = e.viewTransition;
  e.swap = ((swap) => () => { swap(); document.documentElement.classList.add('bo-trans'); })(e.swap);
  vt?.ready.then(() => {
    const orb = document.querySelector('.odh-orb');
    if (!orb) return;
    const r = orb.getBoundingClientRect();
    const to = { x: r.left + r.width / 2, y: r.top + r.height / 2, d: r.width };
    // arc : la boule s'élève puis redescend sur sa place ; elle roule (un demi-tour) et grandit en arrivant
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const c = { x: (from.x + to.x) / 2 - dist * 0.08, y: Math.min(from.y, to.y) - dist * 0.32 };
    const frames = [];
    for (let i = 0; i <= 30; i++) {
      const t = easeInOut(i / 30), u = 1 - t;
      const x = u * u * from.x + 2 * u * t * c.x + t * t * to.x;
      const y = u * u * from.y + 2 * u * t * c.y + t * t * to.y;
      const s = from.d + (to.d - from.d) * easeOut(i / 30);
      const rot = -200 * (1 - t);
      frames.push({ transform: `translate(${x - s / 2}px, ${y - s / 2}px) rotate(${rot}deg)`, width: `${s}px`, height: `${s}px` });
    }
    document.documentElement.animate(frames, { duration: DUR, easing: 'linear', fill: 'both', pseudoElement: `::view-transition-group(offer-orb-${slug})` });
  });
  vt?.finished.finally(() => {
    // le titre est arrivé en volant : il ne doit pas rejouer son apparition quand la classe de transition est retirée
    const t = document.querySelector('.offer-detail-header-simple .odh-title');
    if (t) t.style.animation = 'none';
    document.documentElement.classList.remove('bo-trans');
    const orb = document.querySelector('.odh-orb');
    orb?.classList.add('is-landing');                            // la lueur d'arrivée
    setTimeout(() => orb?.classList.remove('is-landing'), 1400);
  });
});

// RETOUR (bouton précédent) : l'accueil revient sur les offres, là où on l'avait quitté
document.addEventListener('astro:before-preparation', (e) => {
  let from = null;
  try { from = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { from = null; }
  if (!from || e.navigationType !== 'traverse') return;
  if (!e.from.pathname.endsWith(`/offres/${from.slug}`) || e.to.pathname !== from.home) return;
  document.addEventListener('astro:after-swap', () => { scrollTo(0, from.y || 0); sessionStorage.removeItem(KEY); }, { once: true });
});
