// « Nos projets » (accueil) : trois animations par-dessus le collage, son parallaxe et sa profondeur.
//  1. LE TRAIT : un seul trait d'encre, du rouge de la sphère, se dessine au rythme du défilement. Son épaisseur
//     varie comme une plume (plein dans les courbes amples, délié dans les virages). Il relie les projets dans
//     l'ordre de lecture, passe derrière une carte puis devant la suivante,
//     et finit par faire le tour de la sphère rouge de la marque, qui se dessine alors trait par trait (le vrai
//     dessin de la marque, comme dans le hero). Rendu sur canvas, tracé recalculé à chaque image.
//  2. LE PROJET AU CENTRE : la carte la plus proche du milieu de l'écran passe au premier plan, les autres
//     s'estompent, et sa légende (offre, client, projet, numéro) monte sous elle.
//  3. L'OUVERTURE : au clic, la photo de la carte s'agrandit jusqu'à devenir la couverture de la page projet
//     (View Transitions du routeur d'Astro). Navigateurs sans View Transitions : navigation normale.
// Rien sur mobile (collage empilé) ni avec « réduire les animations ».

const INK = '#a10000';
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// courbe lisse passant par les points, échantillonnée finement (Catmull-Rom)
const spline = (pts, sub = 18) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let k = 0; k < sub; k++) {
      const t = k / sub, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

export function initProjectsFx(collage) {
  if (!collage || reduce() || matchMedia('(max-width: 900px)').matches) return () => {};
  const slots = [...collage.querySelectorAll('[data-slot]')]
    .map((slot) => ({ slot, card: slot.querySelector('.op-card') }))
    .filter((s) => s.card)
    .sort((a, b) => a.slot.offsetTop - b.slot.offsetTop);  // ordre de lecture, de haut en bas
  if (!slots.length) return () => {};

  // --- canvas : une bande qui couvre l'écran (plus une marge), placée dans le collage et recentrée au besoin.
  // Elle défile avec la page : le dessin reste calé sur le défilement natif.
  const DPR = Math.min(devicePixelRatio || 1, 2);
  const mk = (z) => {
    const c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = `position:absolute;left:0;width:100%;pointer-events:none;z-index:${z}`;
    collage.appendChild(c);
    return c;
  };
  const back = mk(0), front = mk(20);                     // derrière toutes les cartes / devant une carte sur deux
  const bx = back.getContext('2d'), fx = front.getContext('2d');
  let bandTop = -1e9, bandH = 0, cw = 0;
  const MARGIN = 320;
  const frontIdx = new Set();                             // le trait passe toujours SOUS les images (jamais par-dessus)

  // --- la sphère de la marque (le vrai dessin : 900 traits), qui se dessine quand le trait en fait le tour
  const globe = document.createElement('div');
  globe.setAttribute('aria-hidden', 'true');
  globe.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:1;opacity:0';
  collage.appendChild(globe);
  let gPaths = [], gReady = false, gLast = -1;
  fetch('/brand/sphere-rouge.svg').then((r) => r.text()).then((txt) => {
    const svg = document.importNode(new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement, true);
    svg.removeAttribute('width'); svg.removeAttribute('height');
    svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible';
    globe.appendChild(svg);
    const vb = svg.viewBox.baseVal, cx = vb.x + vb.width / 2, cy = vb.y + vb.height / 2;
    gPaths = [...svg.querySelectorAll('path')].map((p) => {
      const L = p.getTotalLength(), b = p.getBBox();
      // ordre de dessin : en tournant autour du centre, depuis l'endroit où le trait arrive (à gauche)
      const ang = ((Math.atan2(b.y + b.height / 2 - cy, b.x + b.width / 2 - cx) + Math.PI) / (Math.PI * 2) + 0.5) % 1;
      p.style.strokeDasharray = `${L} ${L}`; p.style.strokeDashoffset = String(L);
      return { p, L, at: ang * 0.7 + Math.random() * 0.12 };
    });
    gReady = true;
  }).catch(() => {});

  let focus = null, pCur = 0, last = 0, raf = 0, visible = false;
  // FLUIDITÉ : rien n'est relu ni réécrit inutilement à chaque image (chaque lecture après une écriture force le
  // navigateur à tout recalculer). Hauteur des légendes mesurée une fois par largeur ; styles écrits seulement s'ils
  // changent ; tracé redessiné seulement si la page, la souris ou le trait ont bougé.
  const capW = [], capH = [], capT = [];
  let lastKey = '', dirtyUntil = 0, gW = '', gO = '', gx0 = 0, gy0 = 0, R0 = 0;
  const onMove = () => { dirtyUntil = performance.now() + 1600; };   // la profondeur suit la souris : les cartes bougent
  addEventListener('pointermove', onMove, { passive: true });

  // place de la légende, choisie au moment où le projet passe au centre : à côté de la photo si rien n'y est
  // (les cartes voisines bougent avec le parallaxe, la place libre change), sinon dessous
  // obstacles d'une légende : les autres cartes, et le titre « Nos projets » (il est posé sur le haut du collage)
  const title = collage.parentElement?.querySelector('.op-projects-title');
  const obstacles = (rects) => {
    if (!title) return rects;
    const cr = collage.getBoundingClientRect(), t = title.querySelector('a') || title, r = t.getBoundingClientRect();
    return [...rects, { l: r.left - cr.left - 20, t: r.top - cr.top - 10, w: r.width + 40, h: r.height + 20 }];
  };
  // les légendes vivent dans un calque au-dessus de toutes les cartes : la carte au centre ne change jamais de
  // place dans la pile (plus de saut d'une image par-dessus l'autre), seule sa légende passe devant
  const capLayer = document.createElement('div');
  capLayer.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:30';
  collage.appendChild(capLayer);
  const caps = slots.map(({ slot }) => {
    const cap = slot.querySelector('.op-cap');
    if (cap) capLayer.appendChild(cap);
    return cap;
  });
  // place de chaque légende : décidée à la construction de la page (classe cap-… de la carte), jamais changée
  const capPick = slots.map(({ slot }) => [...slot.classList].find((c) => c.startsWith('cap-')));
  const CAPS = ['cap-right', 'cap-left', 'cap-right-top', 'cap-left-top', 'cap-right-mid', 'cap-left-mid', 'cap-below', 'cap-below-r', 'cap-above'];
  const placeCaption = (i, rects, W, U) => {
    const r = rects[i], cap = caps[i];
    if (!cap) return;
    const sw = 300 * U, h = Math.max(cap.offsetHeight, 90 * U), g = 28 * U, bw = Math.max(r.w, 360 * U);
    const box = {
      'cap-right': [r.l + r.w + g, r.t + r.h - h, sw, h],
      'cap-left': [r.l - g - sw, r.t + r.h - h, sw, h],
      'cap-right-top': [r.l + r.w + g, r.t, sw, h],
      'cap-left-top': [r.l - g - sw, r.t, sw, h],
      'cap-below': [r.l, r.t + r.h + 26 * U, bw, h + 30 * U],
      'cap-below-r': [r.l + r.w - bw, r.t + r.h + 26 * U, bw, h + 30 * U],
    };
    // place FIXE : du côté libre de l'image (à droite si l'image est à gauche de la page, sinon à gauche),
    // alignée sur son bas ; elle ne change jamais de côté
    const pick = capPick[i] || (r.l + r.w / 2 < W / 2 ? 'cap-right' : 'cap-left');
    capPick[i] = pick;
    CAPS.forEach((c) => cap.classList.toggle(c, c === pick));
    capW[i] = null;
    positionCaption(i, rects, U);
  };
  // position de la légende, recalculée à chaque image : elle suit sa carte (parallaxe compris)
  const positionCaption = (i, rects, U) => {
    const r = rects[i], cap = caps[i], pick = capPick[i];
    if (!cap || !pick) return;
    const g = 28 * U, side = !pick.startsWith('cap-below');
    const w = side ? 300 * U : Math.max(r.w, 300 * U);          // dessous : pas plus large que l'image (le nom passe à la ligne)
    const wStr = `${w.toFixed(1)}px`;
    if (capW[i] !== wStr) {                                       // largeur nouvelle (premier passage, redimensionnement)
      const st0 = cap.style;
      st0.width = wStr; st0.right = st0.bottom = 'auto'; st0.left = st0.top = '0px';
      capH[i] = cap.offsetHeight; capW[i] = wStr;
    }
    const h = capH[i];
    let x, y;
    if (pick === 'cap-right') { x = r.l + r.w + g; y = r.t + r.h - h; }
    else if (pick === 'cap-left') { x = r.l - g - w; y = r.t + r.h - h; }
    else if (pick === 'cap-right-top') { x = r.l + r.w + g; y = r.t; }
    else if (pick === 'cap-left-top') { x = r.l - g - w; y = r.t; }
    else if (pick === 'cap-right-mid') { x = r.l + r.w + g; y = r.t + r.h / 2 - h / 2; }
    else if (pick === 'cap-left-mid') { x = r.l - g - w; y = r.t + r.h / 2 - h / 2; }
    else if (pick === 'cap-below-r') { x = r.l + r.w - w; y = r.t + r.h + 26 * U; }
    else if (pick === 'cap-above') { x = r.l; y = r.t - h - 26 * U; }
    else { x = r.l; y = r.t + r.h + 26 * U; }
    const t = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    if (capT[i] !== t) { capT[i] = t; cap.style.transform = t; }
  };

  const frame = (time) => {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = clamp((time - (last || time)) / 1000, 1 / 240, 1 / 20);
    last = time;
    const cr = collage.getBoundingClientRect();
    const vh = innerHeight, W = cr.width, U = W / 1440;
    const key = `${cr.top.toFixed(1)}|${W}|${vh}`;
    const pT = clamp((vh * 0.62 - cr.top) / Math.max(1, cr.height + vh * 0.1), 0, 1);
    if (key === lastKey && time > dirtyUntil && !(pT > pCur + 1e-4)) {
      if (R0) globe.style.transform = `translate(${(gx0 - R0).toFixed(1)}px, ${(gy0 - R0).toFixed(1)}px) rotate(${(time / 1000 * 3).toFixed(2)}deg)`;
      return;
    }
    lastKey = key;

    // bande de dessin : recentrée si l'écran approche de ses bords
    const viewTop = -cr.top;
    if (W !== cw || viewTop < bandTop + 40 || viewTop + vh > bandTop + bandH - 40) {
      bandTop = Math.round(viewTop - MARGIN); bandH = Math.round(vh + MARGIN * 2);
      if (W !== cw || back.height !== Math.round(bandH * DPR)) {
        cw = W;
        for (const c of [back, front]) { c.width = Math.round(W * DPR); c.height = Math.round(bandH * DPR); c.style.height = `${bandH}px`; }
      }
      back.style.top = front.style.top = `${bandTop}px`;
    }
    const oy = -bandTop;

    const rects = slots.map(({ card }) => {
      const r = card.getBoundingClientRect();
      return { l: r.left - cr.left, t: r.top - cr.top, w: r.width, h: r.height };
    });

    // --- tracé : pour chaque carte, l'entrée sur un bord (hors de la carte), puis la traversée en diagonale
    const ctrl = [[W * 0.5, -80]];
    rects.forEach((r, i) => {
      const ltr = i % 2 === 0;
      ctrl.push([clamp(ltr ? r.l - 34 * U : r.l + r.w + 34 * U, 60 * U, W - 60 * U), r.t + r.h * 0.18]);
      ctrl.push([r.l + r.w * (ltr ? 0.42 : 0.58), r.t + r.h * 0.5]);
      ctrl.push([clamp(ltr ? r.l + r.w + 40 * U : r.l - 40 * U, 60 * U, W - 60 * U), r.t + r.h * 0.84]);
    });
    // fin : le trait rejoint la sphère et en fait le tour
    const lastR = rects[rects.length - 1];
    const R = 118 * U;
    const gx = clamp(lastR.l + lastR.w + 290 * U, R * 1.3, W - R * 1.2), gy = lastR.t + lastR.h * 0.42;
    const RO = R * 1.08;
    ctrl.push([gx - RO * 1.9, gy + RO * 1.05]);
    for (let q = 0; q <= 16; q++) {
      const a = Math.PI * 0.75 + (q / 16) * Math.PI * 2;
      ctrl.push([gx + Math.cos(a) * RO, gy + Math.sin(a) * RO]);
    }

    const dense = spline(ctrl);
    const cum = [0];
    for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
    const L = cum[cum.length - 1];

    // --- avancée, lissée (le trait rattrape le défilement avec une légère inertie)
    const pTarget = clamp((vh * 0.62 - cr.top) / Math.max(1, cr.height + vh * 0.1), 0, 1);
    // une fois tracé, le trait reste tracé (et la sphère dessinée) : en remontant, rien ne s'efface
    if (pTarget > pCur) pCur += (pTarget - pCur) * (1 - Math.exp(-dt * 5));
    const drawn = L * pCur;

    // --- échantillons réguliers jusqu'à la pointe, épaisseur de plume
    const DS = 3;
    const n = Math.max(2, Math.floor(drawn / DS));
    const X = new Float32Array(n), Y = new Float32Array(n), A = new Float32Array(n), Wd = new Float32Array(n);
    let k = 1;
    for (let i = 0; i < n; i++) {
      const s = i * DS;
      while (k < cum.length - 1 && cum[k] < s) k++;
      const f = (s - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]);
      X[i] = dense[k - 1][0] + (dense[k][0] - dense[k - 1][0]) * f;
      Y[i] = dense[k - 1][1] + (dense[k][1] - dense[k - 1][1]) * f;
      A[i] = Math.atan2(dense[k][1] - dense[k - 1][1], dense[k][0] - dense[k - 1][0]);
    }
    const WMAX = 3.1 * Math.max(0.8, U), WMIN = 0.55;
    for (let i = 0; i < n; i++) {
      // courbure locale (sur ±4 échantillons) : virage serré = délié, courbe ample = plein
      const i0 = Math.max(0, i - 4), i1 = Math.min(n - 1, i + 4);
      let da = Math.abs(A[i1] - A[i0]); if (da > Math.PI) da = Math.PI * 2 - da;
      const kap = da / Math.max(1, (i1 - i0) * DS);
      // la plume est un peu plus large dans les descentes (angle de la plume à 35°)
      const nib = 0.75 + 0.25 * Math.abs(Math.sin(A[i] - 0.6));
      const s = i * DS;
      Wd[i] = (WMIN + (WMAX - WMIN) * Math.exp(-kap * 70) * nib) * smoothstep(0, 180, s) * (0.25 + 0.75 * smoothstep(0, 160, drawn - s));
    }
    // lissage de l'épaisseur
    for (let pass = 0; pass < 2; pass++) for (let i = 1; i < n - 1; i++) Wd[i] = (Wd[i - 1] + Wd[i] * 2 + Wd[i + 1]) / 4;

    // --- dessin : un seul trait plein, contour gauche puis contour droit (encre)
    const ctx = bx;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, bandH);
    const vis0 = viewTop - 80, vis1 = viewTop + vh + 80;
    let i0 = 0;
    while (i0 < n && Y[i0] < vis0 && Y[Math.min(n - 1, i0 + 40)] < vis0) i0++;
    let i1 = n - 1;
    while (i1 > i0 && Y[i1] > vis1 && Y[Math.max(0, i1 - 40)] > vis1) i1--;
    // le trait, d'épaisseur donnée (+ extra) : contour gauche puis contour droit
    const ribbon = (extra) => {
      ctx.beginPath();
      for (let i = i0; i <= i1; i++) {
        const nx = -Math.sin(A[i]), ny = Math.cos(A[i]), h = Wd[i] / 2 + extra;
        if (i === i0) ctx.moveTo(X[i] + nx * h, Y[i] + ny * h + oy); else ctx.lineTo(X[i] + nx * h, Y[i] + ny * h + oy);
      }
      for (let i = i1; i >= i0; i--) {
        const nx = -Math.sin(A[i]), ny = Math.cos(A[i]), h = Wd[i] / 2 + extra;
        ctx.lineTo(X[i] - nx * h, Y[i] - ny * h + oy);
      }
      ctx.closePath();
      ctx.fill('nonzero');
      if (i1 === n - 1 && pCur < 0.999) { ctx.beginPath(); ctx.arc(X[n - 1], Y[n - 1] + oy, Wd[n - 1] / 2 + extra, 0, Math.PI * 2); ctx.fill(); }
    };
    if (i1 > i0) { ctx.fillStyle = INK; ribbon(0); }

    // --- la sphère : se dessine pendant que le trait en fait le tour
    const sphereStart = (L - Math.PI * 2 * RO * 1.05) / L;
    const gp = smoothstep(sphereStart, 1, pCur);
    const gWs = `${(R * 2).toFixed(1)}px`, gOs = gp > 0 ? '1' : '0';
    if (gWs !== gW) { gW = gWs; globe.style.width = globe.style.height = gWs; }
    globe.style.transform = `translate(${(gx - R).toFixed(1)}px, ${(gy - R).toFixed(1)}px) rotate(${(time / 1000 * 3).toFixed(2)}deg)`;
    if (gOs !== gO) { gO = gOs; globe.style.opacity = gOs; }
    gx0 = gx; gy0 = gy; R0 = R;
    if (gReady && Math.abs(gp - gLast) > 0.002) {
      gLast = gp;
      for (const g of gPaths) {
        const kk = clamp((gp - g.at) / 0.3, 0, 1);
        g.p.style.strokeDashoffset = (g.L * (1 - kk * kk * (3 - 2 * kk))).toFixed(1);
      }
    }

    // --- devant : la même image, visible seulement sur les cartes que le trait traverse par-dessus
    if (frontIdx.size) {
      fx.setTransform(1, 0, 0, 1, 0, 0);
      fx.clearRect(0, 0, front.width, front.height);
      fx.save();
      fx.beginPath();
      rects.forEach((r, i) => { if (frontIdx.has(i)) fx.rect(r.l * DPR, (r.t + oy) * DPR, r.w * DPR, r.h * DPR); });
      fx.clip();
      fx.drawImage(back, 0, 0);
      fx.restore();
    }

    // --- carte au centre : la plus proche du milieu, avec un peu d'hystérésis pour ne pas clignoter
    const mid = vh / 2;
    let best = null, bestD = vh * 0.6;          // zone large : un projet passe le relais au suivant, sans trou
    rects.forEach((r, i) => {
      const dd = Math.abs(cr.top + r.t + r.h / 2 - mid);
      if (dd < bestD) { bestD = dd; best = i; }
    });
    if (best !== null && focus !== null && best !== focus) {
      const r = rects[focus];
      const cur = Math.abs(cr.top + r.t + r.h / 2 - mid);
      if (cur - bestD < 90 && cur < vh * 0.6) best = focus;   // relais net : le nom ne change que quand le projet suivant est clairement au centre
    }
    // la légende suit sa carte ; celle qui s'efface reste accrochée à la sienne pendant son fondu
    caps.forEach((cap, i) => { if (cap && (i === focus || cap.classList.contains('is-on') || capPick[i])) positionCaption(i, rects, U); });
    if (best !== focus) {
      if (focus !== null) slots[focus].slot.classList.remove('is-focus');   // le nom, lui, reste affiché une fois apparu
      focus = best;
      if (focus !== null) { placeCaption(focus, rects, W, U); slots[focus].slot.classList.add('is-focus'); caps[focus]?.classList.add('is-on'); }
      collage.classList.toggle('has-focus', focus !== null);
    }
  };

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); }
  }, { rootMargin: '30% 0px' });
  io.observe(collage);

  return () => {
    io.disconnect();
    removeEventListener('pointermove', onMove);
    cancelAnimationFrame(raf);
    back.remove(); front.remove(); globe.remove();
    caps.forEach((cap, i) => { if (cap) { cap.classList.remove('is-on'); cap.removeAttribute('style'); slots[i].slot.appendChild(cap); } });
    capLayer.remove();
    slots.forEach(({ slot }) => slot.classList.remove('is-focus'));
    collage.classList.remove('has-focus');
  };
}

// --- 3. L'ouverture : la photo de la carte devient la couverture de la page projet ---
let opening = false;
addEventListener('click', (e) => {
  const a = e.target.closest?.('.op-collage a.op-card');
  if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (reduce() || !document.startViewTransition) return;
  const media = a.querySelector('.op-card-media');
  if (!media) return;
  media.style.viewTransitionName = 'bo-cover';
  a.closest('[data-slot]')?.classList.add('is-opening');
  opening = true;
  // le routeur d'Astro prend ensuite le clic en charge et lance la transition
}, true);

document.addEventListener('astro:before-swap', (e) => {
  if (!opening) return;
  opening = false;
  const cover = e.newDocument.querySelector('.cs-cover');
  if (cover) cover.style.viewTransitionName = 'bo-cover';
  e.viewTransition?.finished.finally(() => {
    const c = document.querySelector('.cs-cover');
    if (c) c.style.viewTransitionName = '';
  });
});
