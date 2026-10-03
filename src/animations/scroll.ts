import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
let activeLenis: Lenis | null = null;
const scrollFrameListeners = new Set<(scroll: number, deltaSeconds: number) => void>();
let previousTick = 0;

function notifyScrollFrame(scroll: number, deltaSeconds: number) {
  scrollFrameListeners.forEach((listener) => listener(scroll, deltaSeconds));
}

export function subscribeScrollFrames(listener: (scroll: number, deltaSeconds: number) => void) {
  scrollFrameListeners.add(listener);
  const onNativeScroll = () => {
    if (activeLenis) return;
    listener(window.scrollY, 1);
  };
  if (!activeLenis) window.addEventListener('scroll', onNativeScroll, { passive: true });
  return () => {
    scrollFrameListeners.delete(listener);
    window.removeEventListener('scroll', onNativeScroll);
  };
}

export function scrollToPosition(position: number) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let reduceEffects = false;
  try { reduceEffects = localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
  if (reduceMotion || reduceEffects) {
    if (activeLenis) activeLenis.scrollTo(position, { immediate: true });
    else window.scrollTo({ top: position, behavior: 'auto' });
  } else if (activeLenis) activeLenis.scrollTo(position, { duration: 1.1 });
  else window.scrollTo({ top: position, behavior: 'smooth' });
}

export function setScrollEffectsReduced(reduced: boolean) {
  if (reduced) activeLenis?.stop();
  else if (activeLenis) activeLenis.start();
}

export function resumeScrollExperience() {
  if (activeLenis) activeLenis.start();
  else startScrollExperience();
}

export interface RevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  start?: string;
}

/** Animate an element into view. Reduced motion users and unsupported targets remain visible. */
export function revealOnScroll(target: gsap.TweenTarget, options: RevealOptions = {}) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return undefined;

  return gsap.fromTo(target,
    { autoAlpha: 0, y: options.y ?? 24 },
    {
      autoAlpha: 1,
      y: 0,
      duration: options.duration ?? 0.9,
      delay: options.delay ?? 0,
      ease: 'power2.out',
      scrollTrigger: { trigger: target as gsap.DOMTarget, start: options.start ?? 'top 86%', once: true },
    },
  );
}

/** Start Lenis and keep its scroll position in sync with GSAP ScrollTrigger. */
export function startScrollExperience() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceEffects = false;
  try { reduceEffects = localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
  if (reduceMotion.matches || reduceEffects) return () => undefined;

  const lenis = new Lenis({
    duration: 0.72,
    smoothWheel: true,
    anchors: { offset: -80 },
  });
  activeLenis = lenis;
  const tick = (time: number) => {
    const now = time * 1000;
    const deltaSeconds = previousTick ? Math.min((now - previousTick) / 1000, .1) : 1 / 60;
    previousTick = now;
    lenis.raf(now);
    notifyScrollFrame(lenis.scroll, deltaSeconds);
  };
  const update = () => ScrollTrigger.update();

  lenis.on('scroll', update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off('scroll', update);
    gsap.ticker.remove(tick);
    lenis.destroy();
    previousTick = 0;
    if (activeLenis === lenis) activeLenis = null;
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };
}

export function startScrollReveals(root: HTMLElement) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return () => undefined;

  const context = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      revealOnScroll(element, { delay: Number(element.dataset.revealDelay ?? 0) });
    });
  }, root);
  return () => context.revert();
}
