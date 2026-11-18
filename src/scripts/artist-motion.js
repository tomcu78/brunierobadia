// Mouvement de la page d'accueil (ordinateur uniquement).
// La mise en page est celle de la maquette. Les trois boules du hero sont les trois offres de l'agence
// (rouge = Création & Direction artistique, rose = Brand transformation, corail = AI Endorsement) :
//
//   HERO      la maquette exacte : les boules flottent à leur place (physique de HomeOnePager).
//   PROJETS   en quittant le hero, chaque boule rejoint en arc les projets de son offre et roule le long du bord
//             de leur carte pendant qu'elle défile (la carte glisse devant elle) ; d'un projet à l'autre, elle saute
//             avec élan ; au survol d'un projet, sa boule sort un peu de derrière la carte. Elle part avec son dernier.
//   OFFRES    à l'entrée de la section, les boules plongent une à une sur leur offre (dans le temps), qui s'écrit à leur arrivée.
//   STUDIOS   elles se rassemblent en trio, exactement dans la disposition du logo.
//   FIN       le logo n'affiche que son texte : son trio, ce sont les trois boules. Elles voyagent d'un bloc jusqu'à lui,
//             prennent en route l'apparence de ses boules jaunes, s'y posent exactement et y restent.
//
// Mouvement : la place de chaque boule est fonction du défilement (toujours la même pour une position donnée) ;
// elle la rejoint avec un amorti court, en arc, et roule quand elle se déplace (rotation = distance / rayon).
// Défilement à vitesse naturelle : pavé tactile natif, molette à crans adoucie.
// Rendu : copies DANS la page (elles défilent avec le contenu). Sur le bordeaux, la fusion « écran » de la maquette
// précalculée (nette, comme le hero) ; sur le blanc, une version nette dessinée pour le blanc, un halo et une ombre douces.
// Découpe au pixel près à la frontière des deux fonds. Aucun mode de fusion CSS.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
// découpe en lignes masquées, avec de la marge sous chaque cache : sans elle, le masque coupe les jambages (g, q, p, y)
const splitLines = (el) => {
  const st = SplitText.create(el, { type: 'lines', mask: 'lines' });
  (st.masks || []).forEach((m) => { m.style.paddingBottom = '0.2em'; m.style.marginBottom = '-0.2em'; });
  return st;
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
// point d'un arc de A vers B (t de 0 à 1) : la trajectoire se bombe sur le côté (bend = fraction de la distance)
const arc = (ax, ay, bx, by, t, bend) => {
  const dx = bx - ax, dy = by - ay, k = Math.sin(Math.PI * t) * bend;
  return [ax + dx * t - dy * k, ay + dy * t + dx * k];
};
// élan : recule à peine avant de partir, dépasse à peine avant de se poser (amplitude ~3 %)
const backInOut = (t) => {
  const c = 0.9 * 1.525;
  return t < 0.5 ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2 : ((2 * t - 2) ** 2 * ((c + 1) * (2 * t - 2) + c) + 2) / 2;
};
const outBack = (t, k = 0.9) => 1 + (k + 1) * (t - 1) ** 3 + k * (t - 1) ** 2; // se pose en dépassant à peine
const bez = (a, c, b, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b; // Bézier quadratique

const OUT = 0.3; // la boule dépasse du coin de sa carte : son centre est 30 % du rayon à l'extérieur

// Amorti critique (« smooth damp ») : rejoint la cible en accélérant puis en freinant, sans jamais la dépasser.
// Renvoie [position, vitesse]. Indépendant de la cadence d'affichage.
const damp = (cur, target, vel, time, dt) => {
  const w = 2 / time, x = w * dt, e = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const ch = cur - target, tmp = (vel + w * ch) * dt;
  return [target + (ch + tmp) * e, (vel - w * tmp) * e];
};

// Défilement : vitesse naturelle. Le pavé tactile reste natif (inertie du système, aucune latence) ; seule la molette
// à crans est adoucie (elle glisse au lieu d'avancer par paliers). Clavier, barre de défilement et ancres : natifs.
// La page est déplacée dans la même boucle que les boules, juste avant elles : parfaitement synchronisées.
function smoothWheel(ease = 0.16) {
  const html = document.documentElement;
  if (html.classList.contains('lenis')) return () => {};          // le défilement lissé du site (Lenis) s'en charge déjà
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  let target = scrollY, current = scrollY, active = false;
  const maxY = () => html.scrollHeight - innerHeight;
  const onWheel = (e) => {
    if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    if (e.target.closest?.('[data-native-scroll], textarea, select')) return;
    const notch = e.deltaMode !== 0 || (Math.abs(e.deltaY) >= 40 && Number.isInteger(e.deltaY));
    if (!notch) { active = false; return; }                             // pavé tactile : défilement natif
    e.preventDefault();
    let d = e.deltaY;
    if (e.deltaMode === 1) d *= 40; else if (e.deltaMode === 2) d *= innerHeight;
    if (!active) target = current = scrollY;
    target = Math.min(maxY(), Math.max(0, target + d));
    active = true;
  };
  const onNative = () => { if (!active) target = current = scrollY; };
  const tick = (_t, dtMs) => {
    if (!active) return;
    current += (target - current) * (1 - Math.pow(1 - ease, dtMs / 16.67));
    if (Math.abs(target - current) < 0.4) { current = target; active = false; }
    window.scrollTo(0, current);
  };
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('scroll', onNative, { passive: true });
  gsap.ticker.add(tick);
  return () => {
    removeEventListener('wheel', onWheel);
    removeEventListener('scroll', onNative);
    gsap.ticker.remove(tick);
    html.style.scrollBehavior = prev;
  };
}

export function initArtistMotion(root) {
  if (!root) return () => {};
  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const hero = root.querySelector('.op-hero');
    const heroIn = root.querySelector('[data-hero]');
    const collage = root.querySelector('[data-collage]');
    const clients = root.querySelector('.op-clients');
    const offers = root.querySelector('.op-offers');
    const studios = root.querySelector('.op-studios');
    const sig = root.querySelector('[data-sig]');
    const footer = document.querySelector('.site-foot');
    const splits = [];
    const cleanups = [];
    cleanups.push(smoothWheel());                                      // avant les boules : la page bouge d'abord, elles suivent

    // ------------------------------------------------------------------
    // SECTIONS (créées dans l'ordre de la page : l'épinglage des offres décale tout ce qui suit)
    // ------------------------------------------------------------------
    // titres : lignes qui montent dans leur cache (découpe par ligne, le crénage de la Styrene est intact)
    const riseLines = (el, trigger, start, end, stagger = 0.12) => {
      if (!el) return;
      const st = splitLines(el);
      splits.push(st);
      // jouée à l'arrivée (dans le temps), rembobinée si l'on remonte au-dessus : jamais figée à moitié au défilement
      gsap.from(st.lines, { yPercent: 105, duration: 0.9, ease: 'power3.out', stagger, scrollTrigger: { trigger, start, toggleActions: 'play none none reverse' } });
    };

    if (clients) {
      riseLines(clients.querySelector('.op-h2'), clients, 'top 95%', 'top 55%');
      // les marques accélèrent doucement quand on fait défiler la page (toujours dans leur sens) et reviennent à leur
      // vitesse normale dès qu'on s'arrête
      const anims = [...clients.querySelectorAll('.op-track')].map((tr) => tr.getAnimations()[0]).filter(Boolean);
      let lastY = scrollY, vel = 0, rate = 1;
      const tickRate = (_t, dtMs) => {
        const dt = Math.max(1, dtMs) / 1000;
        vel += (Math.abs(scrollY - lastY) / dt - vel) * (1 - Math.exp(-dt * 6));
        lastY = scrollY;
        const next = rate + (1 + Math.min(vel / 1800, 1) * 1.2 - rate) * (1 - Math.exp(-dt * 3));
        if (Math.abs(next - rate) > 0.003) { rate = next; anims.forEach((a) => { a.playbackRate = rate; }); }
      };
      gsap.ticker.add(tickRate);
      cleanups.push(() => { gsap.ticker.remove(tickRate); anims.forEach((a) => { a.playbackRate = 1; }); });
    }

    // OFFRES : plus d'épinglage (il sautait en défilement rapide, surtout au pavé tactile). Dès que la section entre à
    // l'écran, les boules plongent une à une sur leur offre, dans le TEMPS et non au défilement : la chorégraphie est
    // la même que l'on défile lentement ou vite. L'offre s'écrit à l'arrivée de sa boule. Retour en haut : tout se rembobine.
    const rows = offers ? [...offers.querySelectorAll('.op-offer')] : [];
    const diveT = rows.map(() => 0);                                  // progression de la plongée de chaque offre (0 → 1)
    if (offers) {
      riseLines(offers.querySelector('.op-h2'), offers, 'top 90%', 'top 50%');
      if (rows.length) {
        const show = gsap.timeline({ paused: true });
        rows.forEach((o, k) => {
          const at = k * 0.3, d = { v: 0 };
          show.to(d, { v: 1, duration: 0.95, ease: 'none', onUpdate: () => { diveT[k] = d.v; } }, at);
          const tl = gsap.timeline();
          const h3 = o.querySelector('h3'), p = o.querySelector('p'), go = o.querySelector('.op-offer-go');
          if (h3) {
            const st = splitLines(h3);
            splits.push(st);
            tl.from(st.lines, { yPercent: 105, duration: 0.7, ease: 'power3.out', stagger: 0.06 }, 0);
          }
          if (p) tl.from(p, { y: 16, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.12);
          if (go) tl.from(go, { x: -20, opacity: 0, duration: 0.6, ease: 'power2.out' }, 0.2);
          show.add(tl, at + 0.55);                                      // l'offre s'écrit quand sa boule se pose
        });
        ScrollTrigger.create({
          trigger: offers, start: 'top 62%', end: 'bottom top',
          onEnter: () => show.timeScale(1).play(),
          onEnterBack: () => show.timeScale(1).play(),
          onLeaveBack: () => show.timeScale(1.15).reverse(),
          onRefresh: (self) => { if (self.progress > 0 && show.progress() === 0) show.progress(1); },
        });
      }
    }

    // STUDIOS : dès que la section arrive, les trois boules quittent les offres et forment le trio, l'une après l'autre,
    // dans le temps (comme les offres) ; retour au-dessus : elles regagnent leurs offres
    const trioT = [0, 0, 0];
    if (studios) {
      riseLines(studios.querySelector('.op-studios-title'), studios, 'top 80%', 'top 45%');
      riseLines(studios.querySelector('.op-studios-text'), studios.querySelector('.op-studios-text'), 'top 88%', 'top 60%', 0.1);
      const trio = gsap.timeline({ paused: true });
      trioT.forEach((_, i) => {
        const d = { v: 0 };
        trio.to(d, { v: 1, duration: 1.1, ease: 'none', onUpdate: () => { trioT[i] = d.v; } }, i * 0.14);
      });
      ScrollTrigger.create({
        trigger: studios, start: 'top 72%', end: 'bottom top',
        onEnter: () => trio.timeScale(1).play(),
        onEnterBack: () => trio.timeScale(1).play(),
        onLeaveBack: () => trio.timeScale(1.6).reverse(),
        onRefresh: (self) => { if (self.progress > 0 && trio.progress() === 0) trio.progress(1); },
      });
    }

    // LOGO : à l'arrivée du pied de page, le trio rejoint le logo en bas à gauche et le forme, dans le temps ;
    // si l'on remonte, il se défait et les boules regagnent le trio des Studios
    const logoT = { v: 0 };
    if (footer) {
      const logo = gsap.to(logoT, { v: 1, duration: 1.8, ease: 'sine.inOut', paused: true });
      ScrollTrigger.create({
        trigger: footer, start: 'top 82%', end: 'bottom bottom',
        onEnter: () => logo.timeScale(1).play(),
        onEnterBack: () => logo.timeScale(1).play(),
        onLeaveBack: () => logo.timeScale(1.6).reverse(),
        onRefresh: (self) => { if (self.progress > 0 && logo.progress() === 0) logo.progress(1); },
      });
    }

    // ------------------------------------------------------------------
    // LES BOULES
    // ------------------------------------------------------------------
    const NAMES = ['corail', 'rose', 'rouge'];
    const original = (n) => root.querySelector(`.op-sphere--${n}`);
    if (hero && heroIn && NAMES.every(original)) {
      const SPIN = [4, -5.2, 3.3];                                   // rotation lente au repos (degrés / s), comme dans le hero
      const WEIGHT = [1, 1.1, 1.2];                                  // inertie propre à chaque boule (léger décalage entre elles)
      const DEPTH = [0.14, 0.2, 0.1];                                // parallaxe : profondeur derrière les cartes
      const BEND = [0.16, -0.14, 0.18];                              // courbure des trajectoires (côté et amplitude)
      const HUE = ['253,74,73', '254,0,115', '180,0,1'];
      const ROW = [2, 1, 0];                                         // offre de chaque boule : corail → AI Endorsement, rose → Performance, rouge → Création
      // place de chaque boule dans le logo jaune (fractions de la signature : x, y, rayon) : corail en bas à droite,
      // rose en bas à gauche, rouge en haut à gauche — même ordre que la colonne des offres (rouge en haut)
      const LOGO = [[0.752, 0.737, 0.24], [0.244, 0.738, 0.236], [0.246, 0.242, 0.238]];
      const slots = collage ? [...collage.querySelectorAll('[data-slot]')] : [];

      // les copies vivent DANS la page (pas en position fixe) : le navigateur les fait défiler avec le contenu.
      const stage = document.createElement('div');
      stage.className = 'am-stage';
      stage.setAttribute('aria-hidden', 'true');
      root.appendChild(stage);
      const mkCopy = (src, cls, fxCls, fxBg) => {
        const el = document.createElement('div');
        el.className = `am-ball ${cls}`;
        el.setAttribute('aria-hidden', 'true');
        let fx = null;
        if (fxCls) {                                                  // ombre douce sous la boule (sur le blanc)
          fx = document.createElement('span');
          fx.className = `am-fx ${fxCls}`;
          fx.style.background = fxBg;
          el.appendChild(fx);
        }
        const img = new Image();
        img.src = src; img.alt = ''; img.decoding = 'async';
        el.appendChild(img);
        stage.appendChild(el);
        return { el, img, fx, vis: false, clip: null, tf: '', rf: '', op: '', fo: '', base: 0 };
      };
      // bordeaux : fusion « écran » précalculée dans l'image ; blanc : version nette dessinée pour le blanc
      const balls = NAMES.map((n, i) => ({
        i, rot: i * 40, px: null, st: null, hov: 0, lx: null, gCard: null, gS: 0, yPrev: 0,
        dark: mkCopy(`/brand/sphere-${n}-nuit.webp`, 'am-ball--dark'),       // net, comme les boules du hero (pas de halo)
        light: mkCopy(`/brand/sphere-${n}-jour.webp`, 'am-ball--light', 'am-shadow', `radial-gradient(closest-side, rgba(${HUE[i]},.3), rgba(${HUE[i]},0))`),
      }));
      // fin : chaque boule prend l'apparence de sa boule jaune du logo (même dessin, même place) avant de s'y emboîter
      balls.forEach((b) => { b.gold = mkCopy(`/brand/sphere-jaune-b${b.i}.webp`, 'am-ball--gold'); });
      // sur le blanc : halo lumineux très doux autour de la boule, comme une lumière derrière la carte
      balls.forEach((b) => {
        const aura = document.createElement('span');
        aura.className = 'am-fx am-aura';
        aura.style.background = `radial-gradient(closest-side, rgba(${HUE[b.i]},.2), rgba(${HUE[b.i]},.07) 55%, rgba(${HUE[b.i]},0))`;
        b.light.el.insertBefore(aura, b.light.el.firstChild);
      });

      let g = null;
      const measure = () => {
        const sy = scrollY, H = innerHeight, W = innerWidth;
        const doc = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + sy, bottom: r.bottom + sy, left: r.left }; };
        const bw = original('corail').offsetWidth || 236;
        // projets : pour chaque boule, les cartes de son offre (elle se lève derrière la plus proche du milieu de l'écran)
        const chains = NAMES.map(() => []);
        if (collage) slots.forEach((el) => { const k = Number(el.dataset.ball); if (k >= 0 && k < NAMES.length) chains[k].push({ el }); });
        const st = stage.getBoundingClientRect();
        g = { bw, chains, heroBot: doc(heroIn).bottom, stage: { left: st.left, top: st.top + sy } };
        balls.forEach((b) => {
          b.dark.base = bw; b.light.base = Math.round(bw * 0.746);
          [b.dark, b.light].forEach((c) => { c.el.style.width = c.el.style.height = `${c.base}px`; c.clip = null; c.tf = ''; });
        });
      };
      measure();

      const paint = (c, show, clip, tf, rf, op, fo) => {
        if (show !== c.vis) { c.vis = show; c.el.style.visibility = show ? 'visible' : 'hidden'; }
        if (!show) return;
        if (clip !== c.clip) { c.clip = clip; c.el.style.clipPath = clip || 'none'; }
        // n'écrit que ce qui change : une boule posée sur sa carte ne bouge pas dans la page, rien à recalculer
        if (tf !== c.tf) { c.tf = tf; c.el.style.transform = tf; }
        if (op !== c.op) { c.op = op; c.el.style.opacity = op; }
        if (rf !== c.rf) { c.rf = rf; c.img.style.transform = rf; }
        if (c.fx && fo !== c.fo) { c.fo = fo; c.fx.style.opacity = fo; }
      };

      // carte survolée : la boule de son offre réagit
      let hovered = null;
      const onOver = (e) => { hovered = e.target.closest?.('[data-slot]') || null; };
      const onOut = () => { hovered = null; };
      collage?.addEventListener('pointerover', onOver);
      collage?.addEventListener('pointerleave', onOut);
      const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
      const onMouse = (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; };
      addEventListener('pointermove', onMouse, { passive: true });

      let shown = null, stageTop = false, sigHover = false, sigRot = 0;
      // RETOUR AU HERO : quand on remonte et que le bas du hero apparaît, les trois boules entrent par le bas gauche
      // de l'écran, une à une (rouge, rose, corail), montent en un grand arc en roulant sur elles-mêmes et en grandissant,
      // et se posent exactement à leur place. Joué dans le temps (pas à la molette) ; si l'on redescend, elles repartent.
      const ret = NAMES.map(() => ({ v: 1, on: false }));
      const RET_DELAY = [0.62, 0.31, 0];                             // corail, rose, rouge
      const RET_DUR = 2.3;
      let away = false;
      // le logo garde son texte (et ses petits points) ; son trio, ce sont les trois boules : l'image du trio est
      // masquée, les boules reviennent prendre sa place à la fin de la page et y restent
      const sigTrio = sig?.querySelector('.op-sig-trio');
      if (sigTrio) sigTrio.style.visibility = 'hidden';
      const onSigIn = () => { sigHover = true; }, onSigOut = () => { sigHover = false; };
      sig?.addEventListener('pointerenter', onSigIn);
      sig?.addEventListener('pointerleave', onSigOut);
      const render = (time, dtMs) => {
        const dt = Math.min(0.05, dtMs / 1000);
        const y = scrollY, H = innerHeight, W = innerWidth, bw = g.bw;

        // --- étapes, toutes fonction de la position de défilement ---
        const hp = 1 - smooth(g.heroBot * 0.05, g.heroBot * 1.6, y);                                    // hero
        if (hp <= 0 && !away) { away = true; ret.forEach((r) => { gsap.killTweensOf(r); r.v = 0; r.on = false; }); }
        else if (away && y < g.heroBot - H * 0.3) {                  // le bas du hero est bien à l'écran
          away = false;
          ret.forEach((r, i) => {
            r.v = 0; r.on = true;
            gsap.to(r, { v: 1, duration: RET_DUR, delay: RET_DELAY[i], ease: 'power3.out', onComplete: () => { r.on = false; } });
          });
        }
        // une boule qui revient vise sa place normale (celle que donne le défilement) ; les autres suivent la page
        const hpE = ret.map((r) => (r.on ? hp : Math.min(hp, r.v)));
        const dive = ROW.map((k) => diveT[k] ?? 0);                                                      // plongée sur l'offre (dans le temps)
        // trio des Studios puis logo : déclenchés à l'arrivée de leur section, joués dans le temps (voir plus haut)
        const wSi = trioT.slice();
        const wS = Math.max(...wSi), wSall = Math.min(...wSi);
        const wF = logoT.v, wFi = [wF, wF, wF], wFall = wF;            // formation du logo (dans le temps, à l'arrivée du pied de page)

        const poses = hp > 0 ? NAMES.map((n) => {
          const el = original(n), p = el._pose;
          if (p) return { x: p.cx, y: p.docY - y, s: p.ms, rot: p.ang };
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2, s: 1, rot: 0 };
        }) : null;

        const toShow = Math.min(...hpE) < 0.999 || ret.some((r) => r.on);
        if (toShow !== shown) {
          shown = toShow;
          NAMES.forEach((n) => { original(n).style.visibility = toShow ? 'hidden' : ''; });
        }
        if (!toShow) {
          balls.forEach((b) => { b.rot = poses[b.i].rot; b.st = null; b.px = null; paint(b.dark, false); paint(b.light, false); paint(b.gold, false); });
          return;
        }

        // --- lectures (ce qui bouge indépendamment du défilement : cartes en parallaxe, section épinglée, signature) ---
        const rects = new Map();
        const rectOf = (el) => { let r = rects.get(el); if (!r) { r = el.getBoundingClientRect(); rects.set(el, r); } return r; };
        const busy = wFall < 1;
        const rowRects = busy && wSall < 1 && dive.some((d) => d > 0) ? rows.map((r) => (r.querySelector('h3') || r).getBoundingClientRect()) : null;
        const stRect = busy && wS > 0 && studios ? studios.getBoundingClientRect() : null;
        const sgRect = wF > 0 && sig ? sig.getBoundingClientRect() : null;
        // à l'approche du logo : au-dessus du pied de page mais SOUS le logo, donc sous son texte (comme son trio d'origine)
        const zTop = wF > 0.72;
        if (zTop !== stageTop) { stageTop = zTop; stage.style.zIndex = zTop ? '50' : ''; }
        const pulse = 1 + 0.08 * Math.sin(Math.PI * smooth(0.84, 1, wF)); // petite pulsation en se posant
        sigRot += ((sigHover ? 25 : 0) - sigRot) * (1 - Math.exp(-dt * 4)); // survol du logo : le trio tourne, comme avant
        const darkScr = [hero, offers, footer].filter(Boolean).map((el) => { const r = rectOf(el); return [r.top, r.bottom]; });
        const mk = 1 - Math.exp(-dt * 3);                              // souris lissée
        mouse.x += (mouse.tx - mouse.x) * mk; mouse.y += (mouse.ty - mouse.y) * mk;

        balls.forEach((b) => {
          const i = b.i, k = ROW[i], ws = wSi[i], wf = wFi[i];
          let x = W * 0.5, yy = -bw, s = 0.5, o = 1;

          // PROJETS : aucune boule sur les projets. En quittant le hero, elles montent hors de l'écran par le haut ;
          // elles reviennent en plongeant sur les offres
          let glide = null;
          const he = hpE[i];
          if (he < 1 && dive[i] < 1 && ws < 1 && wf < 1) {
            if (poses) b.lx = poses[i].x;
            x = b.lx ?? W * 0.5;
            yy = -bw * 1.2;
            if (hp <= 0 && dive[i] === 0) o = 0;                         // hors de l'écran : éteinte
          }
          b.hov = 0;
          // OFFRES : plongée en courbe depuis le haut de l'écran, puis la boule glisse jusqu'à sa puce et s'y pose
          const rr = dive[i] > 0 && ws < 1 && wf < 1 ? rowRects?.[k] : null;
          if (rr) {
            const d = clamp(rr.height * 2.6, 64, 96);
            const bx = rr.left - 26 - d / 2, by = rr.top + rr.height / 2, t = outBack(dive[i]);
            x = bez(bx + 260, bx + 320, bx, t);
            yy = bez(-d * 1.2, by - 70, by, t);
            s = (d / bw) * (1 + (1 - clamp(t, 0, 1)) * 0.35);          // arrive un peu plus grande, comme venue de l'avant
          }
          // STUDIOS : trio dans la disposition exacte du logo, au centre du vide à droite du texte
          if (stRect && ws > 0) {                                        // (aussi point de départ de l'atterrissage final)
            const D = bw * 0.5, L = LOGO[i], d = DEPTH[i] * 0.6;
            const cx = W * 0.5, cy = stRect.top + stRect.height * 0.34;
            const tx = cx + ((L[0] - 0.5) / (2 * L[2])) * D - mouse.x * 120 * d;
            let ty = cy + ((L[1] - 0.5) / (2 * L[2])) * D;
            ty = ty - (ty - H * 0.5) * d - mouse.y * 80 * d;
            const tw = outBack(smooth(0, 1, ws), 0.6);                  // part en douceur, se pose en dépassant à peine
            [x, yy] = arc(x, yy, tx, ty, tw, 0.12);                       // au plus court, en arc, derrière le texte
            s = mix(s, D / bw, clamp(tw, 0, 1));
          }
          // FIN : le trio garde sa formation (celle du logo) et glisse en rétrécissant jusqu'à se superposer au logo ;
          // chaque boule couvre alors sa boule jaune, à sa taille exacte, puis s'efface en la révélant
          if (sgRect && wf > 0) {
            const L = LOGO[i];
            const tx = sgRect.left + L[0] * sgRect.width, ty = sgRect.top + L[1] * sgRect.height;
            [x, yy] = arc(x, yy, tx, ty, wf, -0.15);                      // même courbe pour les trois : la formation reste intacte
            s = mix(s, (2 * L[2] * sgRect.width) / 0.96 / bw, wf);       // la boule dessinée occupe 96 % de son image
            o = 1 - smooth(0.45, 0.82, wf);                              // s'efface pendant qu'elle devient jaune
          }
          // HERO : exactement la boule de la maquette ; elle s'en détache en arc en défilant
          const p = poses?.[i];
          if (p) {
            if (he >= 1) { x = p.x; yy = p.y; } else [x, yy] = arc(x, yy, p.x, p.y, he, BEND[i] * 1.6);
            s = mix(s, p.s, he);
          }

          // MOUVEMENT : amorti court, chaque boule avec son poids, dans le repère de sa cible : la page pour les cartes et
          // le trio, l'écran pour la section des offres épinglée et pour la signature (fixées à l'écran). Sans cela, la
          // boule traînerait derrière une cible fixe à l'écran pendant le défilement (au-dessus de sa ligne d'offre).
          const nx = x, ny = yy, ns = s;                                // place visée, avant l'amorti
          const ty = yy + y;
          let st = b.st;
          if (!st || Math.abs(ty - st.y) > H * 2.5) st = b.st = { x, y: ty, s, vx: 0, vy: 0, vs: 0 }; // saut (ancre, chargement)
          else if (wf > 0) st.y += wf * (y - b.yPrev);                  // emportée avec l'écran quand sa cible y est fixée
          b.yPrev = y;
          // rattrapage : loin de sa cible (défilement rapide), la boule accélère au lieu d'arriver après la section
          const m = WEIGHT[i] / Math.min(4, 1 + Math.hypot(x - st.x, ty - st.y) / (H * 0.5));
          [st.x, st.vx] = damp(st.x, x, st.vx, 0.2 * m, dt);
          [st.y, st.vy] = damp(st.y, ty, st.vy, 0.12 * m, dt);
          [st.s, st.vs] = damp(st.s, s, st.vs, 0.16 * m, dt);
          const exact = smooth(0.9, 1, he);                             // tout en haut seulement : la boule de la maquette, au pixel
          x = mix(st.x, x, exact); yy = mix(st.y, ty, exact) - y; s = mix(st.s, s, exact);
          // RETOUR : entrée par le bas gauche, grand arc montant, la boule grandit en approchant ; pas d'amorti (aucun ressort)
          const rb = ret[i];
          let rollIn = 0;
          if (rb.on) {
            const t = rb.v;
            const sx = -bw * 0.6 - i * bw * 0.35, sy = H + bw * 0.6 + i * bw * 0.2;
            [x, yy] = arc(sx, sy, nx, ny, t, -0.2);
            s = ns * mix(0.55, 1, t);
            rollIn = (1 - t) * 240;                                      // elle roule en arrivant, et s'arrête pile à son angle
            o = smooth(0, 0.08, t);
            b.st = { x, y: yy + y, s, vx: 0, vy: 0, vs: 0 };
            b.px = null;
          }

          // ROTATION : la boule roule quand elle se déplace (angle = distance / rayon) et tourne lentement au repos
          const R = (bw * s) / 2;
          if (glide && b.gCard === glide.card) {                        // contre le bord : sens selon le côté de la carte
            const ds = glide.s - b.gS;
            if (Math.abs(ds) < 400) b.rot += ((-glide.side * ds) / Math.max(24, R)) * 57.3;
          } else if (b.px !== null && Math.abs(x - b.px) < 300) b.rot += ((x - b.px) / Math.max(24, R)) * 57.3;
          b.gCard = glide ? glide.card : null; b.gS = glide ? glide.s : 0;
          b.px = x;
          b.rot += SPIN[i] * dt * 0.3;
          let rot = b.rot;
          if (p) { rot = mix(b.rot, p.rot, he); if (he > 0.98) b.rot = p.rot; }
          rot -= rollIn;

          // DÉCOUPE : version bordeaux / version blanc, frontière au pixel près (halo et ombre compris)
          const E = R * 2, lo = yy - E, hi = yy + E;
          const segs = [];
          for (const [a, bb] of darkScr) { const u = Math.max(a, lo), v = Math.min(bb, hi); if (v > u) segs.push([u, v]); }
          const covered = segs.reduce((sum, [u, v]) => sum + v - u, 0);
          let showD = segs.length > 0, showL = covered < hi - lo - 0.5;
          if (o < 0.003) showD = showL = false;
          const split = showD && showL;
          const rf = `rotate(${rot.toFixed(2)}deg)`, op = o.toFixed(3);
          for (const c of [b.dark, b.light]) {
            const show = c === b.dark ? showD : showL;
            // netteté : redessinée à la bonne taille si la boule devient bien plus petite ou plus grande (rare)
            const want = bw * s;
            if (show && (want / c.base < 0.8 || want / c.base > 1.25)) {
              c.base = Math.max(24, Math.round(want / 4) * 4);
              c.el.style.width = c.el.style.height = `${c.base}px`;
              c.clip = null; c.tf = '';
            }
            const kk = want / c.base, h = c.base / 2, X = c.base;
            let clip = '';
            if (split) {
              const L = (v) => ((v - yy) / kk + h).toFixed(1);
              const sub = segs.map(([u, v]) => `M${-X} ${L(u)}H${c.base + X}V${L(v)}H${-X}Z`).join('');
              clip = c === b.dark ? `path('${sub}')` : `path(evenodd, 'M${-X} ${-X}H${c.base + X}V${c.base + X}H${-X}Z${sub}')`;
            }
            const px = Math.round((x - h - g.stage.left) * 2) / 2, py = Math.round((yy + y - h - g.stage.top) * 2) / 2;
            const fo = '1';
            paint(c, show, clip, `translate(${px}px, ${py}px) scale(${kk.toFixed(3)})`, rf, op, fo);
          }
          // JAUNE : la boule prend l'apparence de sa boule du logo en approchant, puis se pose exactement à sa place et
          // y reste : le logo, c'est son texte + les trois boules
          const gc = b.gold, gOp = wf > 0 ? smooth(0.45, 0.82, wf) : 0;
          const showG = gOp > 0.003 && !!sgRect;
          let gx = x, gy = yy, gWant = bw * s, gRot = 0;
          if (showG) {
            const lcx = sgRect.left + sgRect.width / 2, lcy = sgRect.top + sgRect.height / 2;
            gRot = sigRot * smooth(0.9, 1, wf);                          // une fois posé, le trio tourne au survol du logo
            const ca = Math.cos((gRot * Math.PI) / 180), sa = Math.sin((gRot * Math.PI) / 180);
            const ox = (x - lcx) * pulse, oy = (yy - lcy) * pulse;
            gx = lcx + ox * ca - oy * sa; gy = lcy + ox * sa + oy * ca; gWant *= pulse;
            if (!gc.base || gWant / gc.base < 0.8 || gWant / gc.base > 1.25) {
              gc.base = Math.max(24, Math.round(gWant / 4) * 4);
              gc.el.style.width = gc.el.style.height = `${gc.base}px`;
              gc.tf = '';
            }
          }
          const gk = gc.base ? gWant / gc.base : 1, gh = (gc.base || 0) / 2;
          const gpx = Math.round((gx - gh - g.stage.left) * 2) / 2, gpy = Math.round((gy + y - gh - g.stage.top) * 2) / 2;
          paint(gc, showG, '', `translate(${gpx}px, ${gpy}px) scale(${gk.toFixed(3)})`, gRot ? `rotate(${gRot.toFixed(2)}deg)` : '', gOp.toFixed(3));
        });
      };
      gsap.ticker.add(render);
      let rbT = 0;
      const onResize = () => { clearTimeout(rbT); rbT = setTimeout(measure, 150); };
      addEventListener('resize', onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(document.body);
      ScrollTrigger.addEventListener('refresh', measure);
      cleanups.push(() => {
        gsap.ticker.remove(render);
        removeEventListener('resize', onResize);
        removeEventListener('pointermove', onMouse);
        collage?.removeEventListener('pointerover', onOver);
        collage?.removeEventListener('pointerleave', onOut);
        ScrollTrigger.removeEventListener('refresh', measure);
        ro.disconnect();
        stage.remove();
        if (sigTrio) sigTrio.style.visibility = '';
        sig?.removeEventListener('pointerenter', onSigIn);
        sig?.removeEventListener('pointerleave', onSigOut);
        NAMES.forEach((n) => { const el = original(n); if (el) el.style.visibility = ''; });
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    addEventListener('load', refresh, { once: true });

    return () => {
      cleanups.forEach((fn) => fn());
      splits.forEach((s) => s.revert());
      removeEventListener('load', refresh);
    };
  });

  return () => mm.revert();
}
