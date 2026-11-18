// Animation trait par trait des sphères vectorielles du hero.
// Au repos, chaque sphère est exactement le vecteur Figma (aucun trait modifié).
// - Tourbillon : au survol, les traits proches du curseur s'écartent et tournoient autour de lui,
//   puis reviennent à leur place avec un ressort.
// - Onde : toutes les quelques secondes, une onde part du centre et fait frémir les traits.
// Les sphères corail et rose (affichées d'abord en image) sont remplacées sans transition visible
// par leurs vecteurs d'origine, chargés après l'ouverture (ordinateur uniquement).

// La corail (6 120 traits) reste en image : trop lourde à animer trait par trait.
const VECTORS = { rose: '/brand/vectors/sphere-rose.svg' };
// Image haute définition rendue depuis le même vecteur : affichée par défaut (rendu identique, coût quasi nul).
// Le vecteur ne prend le relais que pendant le survol ou l'onde.
const RASTER = { rose: '/brand/sphere-rose.webp', rouge: '/brand/sphere-rouge-raster.webp' };
const SVGNS = 'http://www.w3.org/2000/svg';
const SKIP_ATTR = ['src', 'srcset', 'sizes', 'width', 'height', 'alt', 'fetchpriority', 'loading', 'decoding'];

async function inlineSvg(img, url) {
  const txt = await fetch(url).then((r) => r.text());
  const svg = document.importNode(new DOMParser().parseFromString(txt, 'image/svg+xml').documentElement, true);
  for (const { name, value } of [...img.attributes]) if (!SKIP_ATTR.includes(name)) svg.setAttribute(name, value);
  svg.setAttribute('aria-hidden', 'true');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.overflow = 'visible';
  img.replaceWith(svg);
  return svg;
}

// Centre de chaque trait calculé depuis les coordonnées du tracé (aucune mesure DOM),
// par petits lots pendant les temps morts du navigateur pour ne jamais bloquer une image.
const NUM = /-?\d*\.?\d+(?:e-?\d+)?/g;
function pathCenter(d) {
  const n = d.match(NUM);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i + 1 < n.length; i += 2) {
    const x = +n[i], y = +n[i + 1];
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}

async function prepare(svg, phase, idle) {
  const vb = svg.viewBox.baseVal;
  const paths = [...svg.querySelectorAll('path')];
  const n = paths.length;
  const cx = new Float32Array(n), cy = new Float32Array(n), dc = new Float32Array(n);
  const ox = new Float32Array(n), oy = new Float32Array(n), vx = new Float32Array(n), vy = new Float32Array(n);
  const rot = new Float32Array(n), vr = new Float32Array(n);
  const live = new Uint8Array(n);
  const mx = vb.x + vb.width / 2, my = vb.y + vb.height / 2;
  let i = 0;
  while (i < n) {
    const deadline = await idle();
    do {
      const [x, y] = pathCenter(paths[i].getAttribute('d') || '');
      cx[i] = x; cy[i] = y; dc[i] = Math.hypot(x - mx, y - my);
      i++;
    } while (i < n && (deadline?.timeRemaining ? deadline.timeRemaining() > 3 : i % 150));
  }
  return { svg, vb, paths, n, cx, cy, dc, ox, oy, vx, vy, rot, vr, live, mx, my, phase, waveT: -1 };
}

export function mountSphereFx({ root, hero, onSwap }) {
  const desktop = matchMedia('(min-width: 821px) and (pointer: fine)').matches;
  if (!desktop || !root || !hero) return () => {};

  const items = [];
  let raf = 0, stopped = false, visible = true, waveOn = true, lastScroll = 0;
  const stopWaiters = [];
  const onScroll = () => { lastScroll = performance.now(); };
  addEventListener('scroll', onScroll, { passive: true });
  const setRaster = (it, on) => { it.raster = on; it.group.style.display = on ? 'none' : ''; it.image.style.display = on ? '' : 'none'; };
  const cursor = { x: -1e5, y: -1e5, on: false };
  const onMove = (e) => { cursor.x = e.clientX; cursor.y = e.clientY; cursor.on = true; };
  const onLeave = () => { cursor.on = false; };
  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
  // l'onde ne tourne que si le hero est visible au moins à moitié ; les traits en mouvement finissent de revenir
  const vio = new IntersectionObserver(([e]) => { visible = e.isIntersecting; waveOn = e.intersectionRatio > 0.5; }, { threshold: [0, 0.5, 1] });
  vio.observe(hero);

  // Remplace les images par les vecteurs (après l'intro), puis prépare les traits pendant les temps morts
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(r, { timeout: 1500 }) : setTimeout(r, 16)));
  const setup = async () => {
    // d'abord les sphères déjà vectorielles (rouge), puis celles à convertir (rose)
    const els = [...root.querySelectorAll('.op-sphere')].sort((a, b) => (b.tagName.toLowerCase() === 'svg') - (a.tagName.toLowerCase() === 'svg'));
    let phase = 0;
    for (const el of els) {
      if (stopped) return;
      let svg = el.tagName.toLowerCase() === 'svg' ? el : null;
      if (el.classList.contains('op-sphere--corail')) continue;
      const key = el.classList.contains('op-sphere--rose') ? 'rose' : null;
      if (!svg && key) {
        // le vecteur (lourd à insérer) n'arrive que s'il va servir : souris dans le hero,
        // ou 3 s d'immobilité avec le hero visible — jamais pendant un défilement
        await new Promise((resolve) => {
          let timer = 0;
          const go = () => { clearInterval(timer); hero.removeEventListener('pointerenter', go); resolve(); };
          hero.addEventListener('pointerenter', go, { once: true });
          timer = setInterval(() => { if (visible && waveOn && performance.now() - lastScroll > 3000) go(); }, 500);
          stopWaiters.push(go);
        });
        if (stopped) return;
        try { await idle(); svg = await inlineSvg(el, VECTORS[key]); onSwap?.(el, svg); } catch { continue; }
      }
      if (!svg) continue;
      await idle();
      if (stopped) return;
      const it = await prepare(svg, phase, idle);
      if (stopped) return;
      const rkey = svg.classList.contains('op-sphere--rose') ? 'rose' : svg.classList.contains('op-sphere--rouge') ? 'rouge' : null;
      it.group = svg.querySelector('g');
      it.raster = false; it.ready = false; it.anyLive = false;
      if (rkey) {
        const vb = svg.viewBox.baseVal;
        const im = document.createElementNS(SVGNS, 'image');
        for (const [k, v] of [['x', vb.x], ['y', vb.y], ['width', vb.width], ['height', vb.height]]) im.setAttribute(k, String(v));
        im.style.display = 'none';
        const pre = new Image();
        pre.src = RASTER[rkey];
        pre.decode().then(() => { im.setAttribute('href', RASTER[rkey]); svg.appendChild(im); it.image = im; it.ready = true; }).catch(() => {});
      }
      items.push(it);
      phase += 1.9;
    }
  };
  const startTimer = setTimeout(setup, 2600);

  const t0 = performance.now();
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!visible || !items.length) return;
    const t = (now - t0) / 1000;
    for (const it of items) {
      const { svg, vb, paths, n, cx, cy, dc, ox, oy, vx, vy, rot, vr, live } = it;
      // curseur → coordonnées du vecteur (tient compte de la rotation, de l'échelle et du déplacement CSS)
      let lx = -1e9, ly = -1e9;
      const W = vb.width;
      const pose = svg._pose; // fourni par la boucle principale : aucune lecture de mise en page ici
      if (cursor.on && pose) {
        const scale = (pose.w / W) * pose.ms;
        const ang = pose.ang * Math.PI / 180;
        const dx = (cursor.x - pose.cx) / scale;
        const dy = (cursor.y - pose.cy) / scale;
        const ca = Math.cos(-ang), sa = Math.sin(-ang);
        lx = it.mx + dx * ca - dy * sa;
        ly = it.my + dx * sa + dy * ca;
      }
      // le curseur est-il assez près de cette sphère pour que ses traits réagissent ?
      const near = cursor.on && pose && Math.hypot(cursor.x - pose.cx, cursor.y - pose.cy) < pose.w * 0.5 * pose.ms * 1.6;
      const R = W * 0.24, R2 = R * R, push = W * 0.075;
      // onde périodique depuis le centre
      const period = 6.5;
      const local = (t + it.phase) % period;
      const scrolling = now - lastScroll < 300;
      const waveR = waveOn && !scrolling && local < 2.2 ? (local / 2.2) * W * 0.62 : -1;
      // rien à animer : on affiche l'image (rendu identique) et on ne calcule rien
      if (!near && waveR < 0 && !it.anyLive) {
        if (it.ready && !it.raster && t > 4.2) setRaster(it, true);
        continue;
      }
      if (it.raster) setRaster(it, false);
      let liveCount = 0;
      const band = W * 0.07, amp = W * 0.02;

      for (let i = 0; i < n; i++) {
        let tx = 0, ty = 0, tr = 0;
        const ex = cx[i] - lx, ey = cy[i] - ly;
        const d2 = ex * ex + ey * ey;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R) * (1 - d / R);
          const ux = ex / d, uy = ey / d;
          // composante radiale + tangentielle = tourbillon autour du curseur
          tx = (ux * 0.75 - uy * 0.95) * f * push;
          ty = (uy * 0.75 + ux * 0.95) * f * push;
          tr = f * 38;
        }
        if (waveR > 0) {
          const w = dc[i] - waveR;
          if (w > -band && w < band) {
            const k = Math.cos((w / band) * Math.PI * 0.5);
            const dcx = cx[i] - it.mx, dcy = cy[i] - it.my, dl = dc[i] || 1;
            tx += (dcx / dl) * k * amp;
            ty += (dcy / dl) * k * amp;
          }
        }
        if (!tx && !ty && !live[i]) continue;
        // ressort
        vx[i] = (vx[i] + (tx - ox[i]) * 0.11) * 0.8;
        vy[i] = (vy[i] + (ty - oy[i]) * 0.11) * 0.8;
        vr[i] = (vr[i] + (tr - rot[i]) * 0.09) * 0.8;
        ox[i] += vx[i]; oy[i] += vy[i]; rot[i] += vr[i];
        const still = !tx && !ty && Math.abs(ox[i]) < 0.2 && Math.abs(oy[i]) < 0.2 && Math.abs(vx[i]) < 0.1 && Math.abs(vy[i]) < 0.1 && Math.abs(rot[i]) < 0.4;
        if (still) {
          ox[i] = oy[i] = vx[i] = vy[i] = rot[i] = vr[i] = 0;
          live[i] = 0;
          paths[i].removeAttribute('transform');
        } else {
          live[i] = 1;
          liveCount++;
          // attribut SVG (pas de style CSS) : aucun recalcul de styles ni de boîte englobante
          paths[i].setAttribute('transform', `translate(${ox[i].toFixed(2)} ${oy[i].toFixed(2)}) rotate(${rot[i].toFixed(1)} ${cx[i]} ${cy[i]})`);
        }
      }
      it.anyLive = liveCount > 0;
    }
  };
  raf = requestAnimationFrame(frame);

  return () => {
    stopped = true;
    stopWaiters.forEach((f) => f());
    clearTimeout(startTimer);
    cancelAnimationFrame(raf);
    vio.disconnect();
    hero.removeEventListener('pointermove', onMove);
    hero.removeEventListener('pointerleave', onLeave);
    removeEventListener('scroll', onScroll);
  };
}
