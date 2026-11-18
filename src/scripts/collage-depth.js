// Profondeur physique du collage « Nos projets », par-dessus le parallaxe calé sur le défilement (CSS).
// Chaque carte a un plan (--d : 0,35 = loin, 1,25 = près) :
//  - INERTIE : elle flotte derrière le défilement, d'autant plus qu'elle est proche, puis se repose (ressort amorti) ;
//  - VITESSE : quand on défile vite, elle se penche légèrement dans le sens du mouvement et sa photo s'approche
//    (léger zoom), puis tout se calme à l'arrêt ;
//  - SOURIS : elle se décale selon son plan quand la souris bouge, ce qui donne le relief entre les plans.
// Seulement des transformations 2D (pas de calques 3D), écrites sur la carte et sa photo, dont le `transform` est
// libre (le parallaxe et l'apparition utilisent l'emplacement et les propriétés translate / rotate / scale).
// Calcul suspendu quand le collage est hors de l'écran. Rien sur mobile ni avec « réduire les animations ».

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// ressort critique (sans rebond) : rejoint sa cible en douceur, quelle que soit la cadence d'affichage
const damp = (cur, target, vel, time, dt) => {
  const w = 2 / time, x = w * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const ch = cur - target, tmp = (vel + w * ch) * dt;
  return [target + (ch + tmp) * e, (vel - w * tmp) * e];
};

export function initCollageDepth(collage) {
  if (!collage || matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) return () => {};
  const cards = [...collage.querySelectorAll('[data-slot]')].map((slot) => ({
    card: slot.querySelector('.op-card'),
    inner: slot.querySelector('.op-card-inner'),
    d: parseFloat(getComputedStyle(slot).getPropertyValue('--d')) || 0.6,
    y: 0, vy: 0, sk: 0, vsk: 0, z: 0, vz: 0, mx: 0, vmx: 0, my: 0, vmy: 0,
  })).filter((c) => c.card);
  if (!cards.length) return () => {};

  let raf = 0, visible = false, last = 0, lastY = scrollY, vel = 0;
  const mouse = { x: 0, y: 0 };
  const onMove = (e) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; };

  const frame = (t) => {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = clamp((t - (last || t)) / 1000, 1 / 240, 1 / 20);
    last = t;
    const y = scrollY;
    const v = (y - lastY) / dt;                                  // vitesse de défilement (px/s)
    lastY = y;
    vel += (clamp(v, -6000, 6000) - vel) * (1 - Math.exp(-dt * 10));
    const speed = Math.abs(vel);
    for (const c of cards) {
      // la carte reste en arrière du mouvement (vers le haut quand on descend), proportionnellement à sa proximité
      const lag = 0;                                            // (retard au défilement retiré : les cartes se décalaient et cassaient la composition)
      const lean = 0;                                           // (inclinaison retirée : elle tordait les photos)
      const zoom = 0;
      [c.y, c.vy] = damp(c.y, lag, c.vy, 0.42 + c.d * 0.25, dt);
      [c.sk, c.vsk] = damp(c.sk, lean, c.vsk, 0.35, dt);
      [c.z, c.vz] = damp(c.z, zoom, c.vz, 0.45, dt);
      [c.mx, c.vmx] = damp(c.mx, -mouse.x * 34 * c.d, c.vmx, 0.6, dt);
      [c.my, c.vmy] = damp(c.my, -mouse.y * 22 * c.d, c.vmy, 0.6, dt);
      c.card.style.transform = `translate3d(${c.mx.toFixed(2)}px, ${(c.y + c.my).toFixed(2)}px, 0) skewY(${c.sk.toFixed(3)}deg)`;
      if (c.inner) c.inner.style.transform = `scale(${(1 + c.z).toFixed(4)})`;
    }
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = 0; lastY = scrollY; raf = requestAnimationFrame(frame); }
  }, { rootMargin: '20% 0px' });
  io.observe(collage);
  addEventListener('pointermove', onMove, { passive: true });

  return () => {
    io.disconnect();
    removeEventListener('pointermove', onMove);
    cancelAnimationFrame(raf);
    cards.forEach((c) => { c.card.style.transform = ''; if (c.inner) c.inner.style.transform = ''; });
  };
}
