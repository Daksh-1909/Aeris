import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './skyTimeline.css';

gsap.registerPlugin(ScrollTrigger);

type RGB = readonly [number, number, number];
type SkyFrame = {
  phase: string;
  at: number; sunX: number; sunY: number; sunOpacity: number; sunScale: number;
  moonX: number; moonY: number; moonOpacity: number; stars: number; clouds: number; horizon: number;
  top: RGB; middle: RGB; bottom: RGB; warmth: RGB;
};

const frames: SkyFrame[] = [
  { at: 0, phase: 'Pre-Dawn', sunX: 14, sunY: 86, sunOpacity: .28, sunScale: .72, moonX: 78, moonY: 72, moonOpacity: 0, stars: .5, clouds: .13, horizon: .16, top: [7,17,31], middle: [19,36,59], bottom: [58,67,84], warmth: [177,112,99] },
  { at: .08, phase: 'Sunrise', sunX: 18, sunY: 80, sunOpacity: .92, sunScale: .83, moonX: 78, moonY: 72, moonOpacity: 0, stars: .12, clouds: .3, horizon: .66, top: [24,42,69], middle: [113,94,112], bottom: [241,183,126], warmth: [242,160,119] },
  { at: .2, phase: 'Morning', sunX: 30, sunY: 55, sunOpacity: .95, sunScale: .96, moonX: 78, moonY: 72, moonOpacity: 0, stars: 0, clouds: .48, horizon: .34, top: [56,104,143], middle: [143,190,210], bottom: [220,232,228], warmth: [230,173,133] },
  { at: .38, phase: 'Day', sunX: 50, sunY: 22, sunOpacity: .9, sunScale: .9, moonX: 78, moonY: 72, moonOpacity: 0, stars: 0, clouds: .42, horizon: .18, top: [80,145,184], middle: [150,200,218], bottom: [221,237,236], warmth: [220,199,168] },
  { at: .55, phase: 'Afternoon', sunX: 68, sunY: 30, sunOpacity: .91, sunScale: .98, moonX: 78, moonY: 72, moonOpacity: 0, stars: 0, clouds: .4, horizon: .2, top: [78,122,153], middle: [159,184,192], bottom: [233,218,194], warmth: [225,170,116] },
  { at: .68, phase: 'Golden Hour', sunX: 82, sunY: 58, sunOpacity: .96, sunScale: 1.12, moonX: 78, moonY: 72, moonOpacity: 0, stars: 0, clouds: .46, horizon: .72, top: [77,101,127], middle: [195,132,103], bottom: [246,190,126], warmth: [247,157,94] },
  { at: .78, phase: 'Sunset', sunX: 90, sunY: 82, sunOpacity: .83, sunScale: 1.24, moonX: 77, moonY: 68, moonOpacity: 0, stars: .02, clouds: .32, horizon: .98, top: [76,55,84], middle: [183,95,93], bottom: [236,140,98], warmth: [241,118,96] },
  { at: .87, phase: 'Twilight', sunX: 92, sunY: 104, sunOpacity: 0, sunScale: 1.3, moonX: 72, moonY: 70, moonOpacity: .32, stars: .35, clouds: .17, horizon: .38, top: [36,31,68], middle: [54,57,111], bottom: [28,39,68], warmth: [156,114,157] },
  { at: 1, phase: 'Night', sunX: 92, sunY: 108, sunOpacity: 0, sunScale: 1.3, moonX: 78, moonY: 28, moonOpacity: .9, stars: .95, clouds: .08, horizon: .1, top: [3,7,18], middle: [7,19,41], bottom: [13,24,50], warmth: [96,119,170] },
];

const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
const mixColor = (a: RGB, b: RGB, amount: number): RGB => [mix(a[0], b[0], amount), mix(a[1], b[1], amount), mix(a[2], b[2], amount)];
const chapterAt = (progress: number) => progress < .2 ? 'dawn' : progress < .55 ? 'day' : progress < .78 ? 'golden' : progress < .87 ? 'dusk' : 'night';

function valuesAt(progress: number): SkyFrame {
  let left = frames[0];
  let right = frames[frames.length - 1];
  for (let index = 1; index < frames.length; index += 1) {
    if (progress <= frames[index].at) { left = frames[index - 1]; right = frames[index]; break; }
  }
  const amount = Math.max(0, Math.min(1, (progress - left.at) / (right.at - left.at)));
  return {
    phase: amount < .5 ? left.phase : right.phase,
    at: progress,
    sunX: mix(left.sunX, right.sunX, amount), sunY: mix(left.sunY, right.sunY, amount), sunOpacity: mix(left.sunOpacity, right.sunOpacity, amount), sunScale: mix(left.sunScale, right.sunScale, amount),
    moonX: mix(left.moonX, right.moonX, amount), moonY: mix(left.moonY, right.moonY, amount), moonOpacity: mix(left.moonOpacity, right.moonOpacity, amount),
    stars: mix(left.stars, right.stars, amount), clouds: mix(left.clouds, right.clouds, amount), horizon: mix(left.horizon, right.horizon, amount),
    top: mixColor(left.top, right.top, amount),
    middle: mixColor(left.middle, right.middle, amount),
    bottom: mixColor(left.bottom, right.bottom, amount),
    warmth: mixColor(left.warmth, right.warmth, amount),
  };
}

/** Scroll mode deliberately layers over the independent, user controlled Sky Clock. */
export function SkyTimeline({ scrollRootRef }: { scrollRootRef: RefObject<HTMLElement | null> }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const moonRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const sun = sunRef.current;
    const moon = moonRef.current;
    const scrollRoot = scrollRootRef.current;
    if (!scene || !sun || !moon || !scrollRoot) return;

    scene.dataset.paused = String(document.visibilityState === 'hidden');
    scene.dataset.effectsReduced = document.documentElement.dataset.reduceEffects ?? 'false';

    const render = (progress: number) => {
      const sky = valuesAt(progress);
      const style = scene.style;
      const top = `rgb(${sky.top.map(Math.round).join(' ')})`;
      const middle = `rgb(${sky.middle.map(Math.round).join(' ')})`;
      const bottom = `rgb(${sky.bottom.map(Math.round).join(' ')})`;
      const rootStyle = document.documentElement.style;
      rootStyle.backgroundImage = `linear-gradient(180deg, ${top} 0%, ${middle} 54%, ${bottom} 100%)`;
      style.setProperty('--sky-top', top);
      style.setProperty('--sky-middle', middle);
      style.setProperty('--sky-bottom', bottom);
      style.setProperty('--sky-warmth', `rgb(${sky.warmth.map(Math.round).join(' ')})`);
      style.setProperty('--sky-horizon', sky.horizon.toFixed(3));
      style.setProperty('--sky-cloud-opacity', sky.clouds.toFixed(3));
      style.setProperty('--sky-star-opacity', sky.stars.toFixed(3));
      sun.style.setProperty('--sun-x', `${sky.sunX}vw`); sun.style.setProperty('--sun-y', `${sky.sunY}vh`); sun.style.setProperty('--sun-scale', sky.sunScale.toFixed(3)); sun.style.opacity = sky.sunOpacity.toFixed(3);
      moon.style.setProperty('--moon-x', `${sky.moonX}vw`); moon.style.setProperty('--moon-y', `${sky.moonY}vh`); moon.style.opacity = sky.moonOpacity.toFixed(3);
      const phase = sky.phase.toLowerCase().replaceAll(' ', '-');
      if (document.body.dataset.skyPhase !== phase) document.body.dataset.skyPhase = phase;
      const chapter = chapterAt(progress);
      if (document.body.dataset.chapter !== chapter) {
        document.body.dataset.chapter = chapter;
        document.querySelectorAll<HTMLElement>('[data-chapter-link]').forEach((link) => {
          if (link.dataset.chapterLink === chapter) link.setAttribute('aria-current', 'step');
          else link.removeAttribute('aria-current');
        });
      }
      if (progressRef.current && import.meta.env.DEV && new URLSearchParams(location.search).has('skyDebug')) {
        progressRef.current.textContent = `Sky ${progress.toFixed(2)} · ${sky.phase} · sun ${Math.round(sky.sunOpacity * 100)}% · stars ${Math.round(sky.stars * 100)}% · moon ${Math.round(sky.moonOpacity * 100)}%`;
      }
    };

    const state = { progress: 0 };
    render(0);
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: scrollRoot,
        start: 'top top',
        end: 'bottom bottom',
        // Lenis supplies the eased feel; a direct scrub keeps every state reversible and deterministic.
        scrub: true,
        onRefresh: (self) => render(self.progress),
      },
    });
    timeline.to(state, { progress: 1, duration: 1, ease: 'none', onUpdate: () => render(state.progress) });

    const onVisibilityChange = () => { scene.dataset.paused = String(document.visibilityState === 'hidden'); };
    const onEffectsChange = (event: Event) => { scene.dataset.effectsReduced = String((event as CustomEvent<boolean>).detail); };
    let refreshFrame = 0;
    const sizeObserver = new ResizeObserver(() => {
      window.cancelAnimationFrame(refreshFrame);
      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    sizeObserver.observe(scrollRoot);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('aeris:reduce-effects-change', onEffectsChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('aeris:reduce-effects-change', onEffectsChange);
      sizeObserver.disconnect();
      window.cancelAnimationFrame(refreshFrame);
      timeline.scrollTrigger?.kill();
      timeline.kill();
      document.documentElement.style.removeProperty('background-image');
      delete document.body.dataset.chapter;
      delete document.body.dataset.skyPhase;
    };
  }, [scrollRootRef]);

  return <div ref={sceneRef} className="sky-timeline" aria-hidden="true">
    <div className="sky-timeline__cloud sky-timeline__cloud--far" />
    <div className="sky-timeline__cloud sky-timeline__cloud--near" />
    <div className="sky-timeline__horizon" />
    <div ref={sunRef} className="sky-timeline__sun" />
    <div className="sky-timeline__stars" />
    <div ref={moonRef} className="sky-timeline__moon" />
    {import.meta.env.DEV && new URLSearchParams(location.search).has('skyDebug') && <span ref={progressRef} className="sky-timeline__debug" />}
  </div>;
}
