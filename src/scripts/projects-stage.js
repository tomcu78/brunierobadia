// « Nos projets » — récit épinglé (ordinateur).
//
// La section se fige à l'écran (position sticky) et le défilement fait avancer un récit, projet par projet, à durée
// égale pour chacun. Tout est fonction de la seule position de défilement : aucun état qui dérive, aucune détection
// « du projet au centre », aucun calque qui change d'ordre. Le récit se rejoue à l'identique en descendant comme en
// remontant.
//
//   Pour chaque projet (dans l'ordre de lecture de la maquette) :
//     1. le cadre glisse vers sa place (et ajuste son cadrage à la taille de l'image), puis s'arrête ;
//     2. l'image se pose à sa place exacte de la maquette : un cercle de la couleur de son offre s'ouvre, la photo suit ;
//        elle se colle par-dessus les précédentes (empilement de la maquette) ;
//     3. le trait d'encre la rejoint, sous les images ;
//     4. son nom s'écrit dans le générique, en bas, toujours au même endroit : il ne recouvre jamais rien ;
//     5. elle passe en couleur, les autres en noir et blanc.
//   Fin : le cadre recule et révèle la maquette complète, toutes images en couleur ; le trait fait le tour de la
//   sphère de la marque, qui se dessine trait par trait.
//
// Rien sur mobile ni avec « réduire les animations » : le collage reste tel quel.

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const span = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);       // déplacement du cadre
const out = (t) => 1 - (1 - t) ** 4;                                              // entrées
const mix = (a, b, t) => a + (b - a) * t;

// rythme, en hauteurs d'écran de défilement
const INTRO = 0.15;   // la scène se fige, le premier projet est déjà là
const SEG = 0.8;      // durée de chaque projet
const OUTRO = 1.3;    // recul sur la maquette complète, puis un temps d'arrêt

export function initProjectsStage(section) {
  const pin = section?.querySelector('[data-pin]');
  if (!pin || matchMedia('(max-width: 900px), (prefers-reduced-motion: reduce)').matches) return () => {};
  const stage = pin.querySelector('[data-stage]');
  const cam = pin.querySelector('[data-cam]');
  const collage = pin.querySelector('[data-collage]');
  const slots = [...collage.querySelectorAll('[data-slot]')];
  const n = slots.length;
  // données de la maquette (unités de 1440), lues sur la carte ; ordre de lecture
  const items = slots.map((slot) => {
    const cs = slot.style;
    const g = (k) => parseFloat(cs.getPropertyValue(k)) || 0;
    return { slot, card: slot.querySelector('.op-card'), orb: slot.querySelector('.op-card-orb'), media: slot.querySelector('.op-card-media'),
      x: g('--x'), y: g('--y'), w: g('--w'), h: g('--h'), k: Math.round(g('--k')) };
  }).sort((a, b) => a.k - b.k);
  const credits = [...pin.querySelectorAll('[data-credit]')];
  const ticks = [...pin.querySelectorAll('.op-credits-bar i')];
  const inkPaths = [...pin.querySelectorAll('[data-ink] path')];
  const ink = inkPaths.map((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = String(L); return { p, L }; });
  const globe = pin.querySelector('[data-globe]');

  section.classList.add('is-stage');
  slots.forEach((s) => s.classList.add('is-revealed'));                 // l'ancienne apparition au défilement est coupée
  pin.style.setProperty('--len', String(INTRO + n * SEG + OUTRO));
  // la page vient de changer de hauteur : les déclencheurs des sections suivantes doivent se recaler
  requestAnimationFrame(() => window.ScrollTrigger?.refresh?.());
  import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh()).catch(() => {});

  // la sphère de la marque (le vrai dessin : 900 traits), dessinée pendant le tour final du trait
  let gPaths = [], gLast = -1;
  if (globe) fetch('/brand/sphere-rouge.svg').then((r) => r.text()).then((txt) => {
    const svg = document.importNode(new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement, true);
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    globe.appendChild(svg);
    const vb = svg.viewBox.baseVal, cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
    gPaths = [...svg.querySelectorAll('path')].map((p) => {
      const L = p.getTotalLength(), b = p.getBBox();
      const ang = ((Math.atan2(b.y + b.height / 2 - cy, b.x + b.width / 2 - cx) + Math.PI) / (Math.PI * 2) + 0.5) % 1;
      p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = String(L);
      return { p, L, at: ang * 0.6 + Math.random() * 0.15 };
    });
    gLast = -1;
  }).catch(() => {});

  // un trait pas encore commencé est masqué (sinon son bout arrondi laisse un point)
  const drawInk = (seg, d) => {
    const off = (seg.L * (1 - d)).toFixed(1), vis = d > 0.001;
    if (seg._o !== off) { seg._o = off; seg.p.style.strokeDashoffset = off; }
    if (seg._v !== vis) { seg._v = vis; seg.p.style.visibility = vis ? '' : 'hidden'; }
  };
  let raf = 0, visible = false, active = -2;
  const frame = () => {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const vh = innerHeight;
    const pr = pin.getBoundingClientRect();
    const t = -pr.top / vh;                                       // écrans défilés depuis que la scène est figée
    const W = collage.clientWidth, U = W / 1440;
    const header = 72, barH = 118;                                 // menu fixe en haut, générique en bas
    const areaTop = header, areaH = vh - header - barH, areaCy = areaTop + areaH / 2;

    // --- où en est le récit
    const start = (k) => (k === 0 ? -0.55 : INTRO + k * SEG);     // le premier projet arrive pendant que la scène approche
    const endSeg = INTRO + n * SEG;
    let k = n - 1;
    for (let i = 0; i < n; i++) if (t < start(i + 1 < n ? i + 1 : n) || i === n - 1) { k = i; break; }
    const u = k === 0 ? span(t, -0.55, INTRO + SEG) : span(t, start(k), start(k) + SEG);
    const outro = span(t, endSeg, endSeg + OUTRO * 0.6);         // recul sur la maquette complète

    // --- cadre : vers la carte courante (déplacement pendant la première partie du segment, puis arrêt)
    const frameOf = (it) => {
      const s = clamp((areaH * 0.84) / (it.h * U), 0.55, 1);
      const cx = (it.x + it.w / 2) * U, cy = (it.y + it.h / 2) * U;
      const tx = (W - W * s) / 2 + (W / 2 - cx) * s * 0.18;       // composition gardée, légère attirance vers la carte
      return { s, tx, ty: areaCy - cy * s };
    };
    const cur = frameOf(items[k]);
    const prev = k > 0 ? frameOf(items[k - 1]) : cur;
    const m = k === 0 ? 1 : inOut(span(u, 0, 0.42));
    let s = mix(prev.s, cur.s, m), tx = mix(prev.tx, cur.tx, m), ty = mix(prev.ty, cur.ty, m);
    if (outro > 0) {
      const H = 1700.5 * U, sf = Math.min(1, (areaH * 0.94) / H);
      const f = inOut(outro);
      s = mix(s, sf, f); tx = mix(tx, (W - W * sf) / 2, f); ty = mix(ty, areaCy - (H * sf) / 2, f);
    }
    cam.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(4)})`;

    // --- apparition des cartes : un cercle de la couleur de l'offre s'ouvre, la photo suit dans le même cercle
    items.forEach((it, i) => {
      let r1, r2;
      if (i < k) { r1 = r2 = 1; }
      else if (i > k) { r1 = r2 = 0; }
      else { r1 = out(span(u, 0.04, 0.4)); r2 = out(span(u, 0.14, 0.55)); }
      const ox = it.slot.style.getPropertyValue('--ox') || '0%', oy = it.slot.style.getPropertyValue('--oy') || '100%';
      const c1 = r1 >= 1 ? 'none' : `circle(${(r1 * 150).toFixed(2)}% at ${ox} ${oy})`;
      const c2 = r2 >= 1 ? 'none' : `circle(${(r2 * 150).toFixed(2)}% at ${ox} ${oy})`;
      if (it._c1 !== c1) { it._c1 = c1; it.orb.style.clipPath = c1; it.orb.style.display = r1 >= 1 && r2 >= 1 ? 'none' : ''; }
      if (it._c2 !== c2) { it._c2 = c2; it.media.style.clipPath = c2; }
      const hidden = r1 <= 0;
      if (it._h !== hidden) { it._h = hidden; it.card.style.visibility = hidden ? 'hidden' : ''; }
    });

    // --- encre : le segment vers la carte courante se trace pendant le déplacement du cadre
    ink.forEach((seg, j) => {
      if (j < n - 1) {
        const target = j + 1;                                      // segment j mène à la carte j+1
        const d = target < k ? 1 : target > k ? 0 : inOut(span(u, 0.02, 0.45));
        drawInk(seg, d);
      } else {
        drawInk(seg, inOut(span(t, endSeg + OUTRO * 0.25, endSeg + OUTRO * 0.85)));
      }
    });
    // la sphère se dessine pendant que le trait en fait le tour
    const gp = span(t, endSeg + OUTRO * 0.45, endSeg + OUTRO * 0.95);
    if (globe) {
      globe.style.opacity = gp > 0 ? '1' : '0';
      if (gPaths.length && Math.abs(gp - gLast) > 0.003) {
        gLast = gp;
        for (const g of gPaths) { const kk = clamp((gp - g.at) / 0.25, 0, 1); g.p.style.strokeDashoffset = (g.L * (1 - kk * kk * (3 - 2 * kk))).toFixed(1); }
      }
    }

    // --- générique et couleur : un seul projet à l'honneur, puis la maquette entière en couleur
    const on = outro > 0.35 ? n : (u >= 0.3 || k > 0 ? k : -1);
    if (on !== active) {
      credits.forEach((c, i) => c.classList.toggle('is-on', i === on));
      ticks.forEach((tk, i) => tk.classList.toggle('is-on', i <= Math.min(on, n - 1) && on >= 0));
      items.forEach((it, i) => it.slot.classList.toggle('is-focus', i === on));
      collage.classList.toggle('has-focus', on >= 0 && on < n);
      active = on;
    }
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }, { rootMargin: '20% 0px' });
  io.observe(pin);
  frame();

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    section.classList.remove('is-stage');
    cam.style.transform = '';
    items.forEach((it) => { it.orb.style.clipPath = ''; it.media.style.clipPath = ''; it.card.style.visibility = ''; it.slot.classList.remove('is-focus'); });
    globe?.replaceChildren();
  };
}
