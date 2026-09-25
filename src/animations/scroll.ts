import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

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
  if (reduceMotion.matches) return () => undefined;

  const lenis = new Lenis({
    duration: 1.05,
    smoothWheel: true,
    anchors: { offset: -80 },
  });
  const tick = (time: number) => lenis.raf(time * 1000);
  const update = () => ScrollTrigger.update();

  lenis.on('scroll', update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    lenis.off('scroll', update);
    gsap.ticker.remove(tick);
    lenis.destroy();
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
