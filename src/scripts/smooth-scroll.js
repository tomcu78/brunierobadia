// Défilement lissé (Lenis) sur tout le site : la molette ne fait plus avancer la page par crans, elle glisse.
// Toutes les animations liées au défilement (CSS, GSAP ScrollTrigger, canvas) lisent la même position, image par
// image : rien ne se décale ni ne saute. Piloté par l'horloge de GSAP pour rester synchrone avec ses animations.
// Rien avec « réduire les animations » ni sur écran tactile (le défilement natif y est déjà fluide).
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;
const wanted = () => !matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches;
const raf = (time) => lenis?.raf(time * 1000);

function start() {
  if (lenis || !wanted()) return;
  lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.7, smoothWheel: true, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
}

start();
// navigation (routeur d'Astro) : la nouvelle page a une autre hauteur, le routeur gère la position de départ
document.addEventListener('astro:before-swap', () => lenis?.stop());
document.addEventListener('astro:after-swap', () => {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
  lenis.start();
});
document.addEventListener('astro:page-load', () => { start(); lenis?.resize(); });
