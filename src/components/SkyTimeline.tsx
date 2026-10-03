import { useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sunDirection } from '../sky/sunMoonPath';
import { listenForSkyModeChange } from '../sky/skyMode';
import { setSkyProgress } from '../sky/skyProgress';
import { sample } from '../sky/timeline';
import { SkyCanvas } from '../sky/SkyCanvas';
import './skyTimeline.css';

gsap.registerPlugin(ScrollTrigger);

const rgb = (color: readonly number[]) => `rgb(${color.map(Math.round).join(' ')})`;
const cssTuple = (color: readonly number[]) => color.map(Math.round).join(', ');
const progressFromQuery = () => {
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(location.search);
  if (!params.has('sky')) return null;
  const value = Number(params.get('sky'));
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : null;
};

/** CSS poster and phase-aware DOM presentation, with an optional WebGL sky dome. */
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

    const root = document.documentElement;
    const body = document.body;
    const rootStyle = root.style;
    const bodyStyle = body.style;
    const frozenProgress = progressFromQuery();
    const debug = import.meta.env.DEV && (frozenProgress !== null || new URLSearchParams(location.search).has('skyDebug'));
    const mode = { value: 'scroll' as 'scroll' | 'clock' };
    const state = { progress: frozenProgress ?? 0 };
    let fpsStart = performance.now();
    let fpsFrames = 0;
    let fps = 60;

    scene.dataset.paused = String(document.visibilityState === 'hidden');
    scene.dataset.effectsReduced = root.dataset.reduceEffects ?? 'false';

    const render = (progress: number) => {
      const sky = sample(progress);
      setSkyProgress(sky.progress);
      const top = rgb(sky.top);
      const middle = rgb(sky.middle);
      const horizon = rgb(sky.horizon);
      rootStyle.backgroundImage = `linear-gradient(180deg, ${top} 0%, ${middle} 54%, ${horizon} 100%)`;
      rootStyle.setProperty('--sky-top', top);
      rootStyle.setProperty('--sky-middle', middle);
      rootStyle.setProperty('--sky-bottom', horizon);
      rootStyle.setProperty('--sky-warmth', rgb(sky.sunColor));
      rootStyle.setProperty('--sky-accent', rgb(sky.sunColor));
      rootStyle.setProperty('--sky-horizon', sky.glow.toFixed(3));
      rootStyle.setProperty('--sky-cloud-opacity', sky.clouds.toFixed(3));
      rootStyle.setProperty('--sky-star-opacity', sky.stars.toFixed(3));
      rootStyle.setProperty('--sky-exposure', sky.exposure.toFixed(3));
      scene.style.setProperty('--sky-poster-top', top);
      scene.style.setProperty('--sky-poster-mid', middle);
      scene.style.setProperty('--sky-poster-horizon', horizon);
      scene.style.setProperty('--sky-cloud-tint', rgb(sky.cloudTint));
      scene.dataset.poster = sky.phase.toLowerCase().replaceAll(' ', '-');
      sun.style.setProperty('--sun-x', `${sky.sunX}vw`);
      sun.style.setProperty('--sun-y', `${sky.sunY}vh`);
      sun.style.setProperty('--sun-scale', sky.sunScale.toFixed(3));
      sun.style.setProperty('--sun-color', rgb(sky.sunColor));
      sun.style.opacity = sky.sunOpacity.toFixed(3);
      moon.style.setProperty('--moon-x', `${sky.moonX}vw`);
      moon.style.setProperty('--moon-y', `${sky.moonY}vh`);
      moon.style.opacity = sky.moonOpacity.toFixed(3);

      const glow = cssTuple(sky.sunColor);
      const accent = rgb(sky.sunColor);
      const foreground = rgb(sky.fg);
      const secondary = rgb(sky.cloudTint);
      bodyStyle.setProperty('--chapter-glow', glow);
      bodyStyle.setProperty('--chapter-accent', accent);
      bodyStyle.setProperty('--cursor-a', foreground);
      bodyStyle.setProperty('--cursor-b', secondary);
      body.dataset.skyPhase = sky.phase.toLowerCase().replaceAll(' ', '-');
      root.dataset.skyState = sky.chapter;
      if (body.dataset.chapter !== sky.chapter) {
        body.dataset.chapter = sky.chapter;
        body.querySelectorAll<HTMLElement>('[data-chapter-link]').forEach((link) => {
          if (link.dataset.chapterLink === sky.chapter) link.setAttribute('aria-current', 'step');
          else link.removeAttribute('aria-current');
        });
      }

      if (debug && progressRef.current) {
        fpsFrames += 1;
        const now = performance.now();
        if (now - fpsStart >= 1000) {
          fps = Math.round(fpsFrames * 1000 / (now - fpsStart));
          fpsFrames = 0;
          fpsStart = now;
        }
        const elevation = Math.round(Math.asin(sunDirection(sky.progress).y) * 180 / Math.PI);
        const tier = matchMedia('(max-width: 760px)').matches || devicePixelRatio > 1.5 ? 'low' : 'high';
        progressRef.current.textContent = `Sky Progress ${sky.progress.toFixed(2)} | Phase ${sky.phase} | Sun elev ${elevation}° | Stars ${Math.round(sky.stars * 100)}% | Moon ${Math.round(sky.moonOpacity * 100)}% | Tier ${tier} CSS | FPS ${fps}`;
      }
    };

    render(state.progress);

    let scrollTrigger: ScrollTrigger | undefined;
    let sizeObserver: ResizeObserver | undefined;
    let refreshFrame = 0;
    if (frozenProgress === null) {
      scrollTrigger = ScrollTrigger.create({
        trigger: scrollRoot,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => { if (mode.value === 'scroll') render(self.progress); },
        onRefresh: (self) => { if (mode.value === 'scroll') render(self.progress); },
      });
      sizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(refreshFrame);
        refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      sizeObserver.observe(scrollRoot);
    }

    let clockTween: gsap.core.Tween | undefined;
    const unsubscribeMode = frozenProgress === null ? listenForSkyModeChange((change) => {
      clockTween?.kill();
      if (change.mode === 'scroll') {
        mode.value = 'scroll';
        const scrollProgress = scrollTrigger?.progress ?? 0;
        state.progress = scrollProgress;
        render(scrollProgress);
        ScrollTrigger.update();
        return;
      }
      mode.value = 'clock';
      clockTween = gsap.to(state, {
        progress: Math.max(0, Math.min(1, change.progress)),
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => render(state.progress),
      });
    }) : () => undefined;

    const onVisibilityChange = () => { scene.dataset.paused = String(document.visibilityState === 'hidden'); };
    const onEffectsChange = (event: Event) => { scene.dataset.effectsReduced = String((event as CustomEvent<boolean>).detail); };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('aeris:reduce-effects-change', onEffectsChange);

    return () => {
      unsubscribeMode();
      clockTween?.kill();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('aeris:reduce-effects-change', onEffectsChange);
      sizeObserver?.disconnect();
      window.cancelAnimationFrame(refreshFrame);
      scrollTrigger?.kill();
      rootStyle.removeProperty('background-image');
      ['--sky-top', '--sky-middle', '--sky-bottom', '--sky-warmth', '--sky-accent', '--sky-horizon', '--sky-cloud-opacity', '--sky-star-opacity', '--sky-exposure'].forEach((property) => rootStyle.removeProperty(property));
      ['--chapter-glow', '--chapter-accent', '--cursor-a', '--cursor-b'].forEach((property) => bodyStyle.removeProperty(property));
      delete root.dataset.skyState;
      delete body.dataset.chapter;
      delete body.dataset.skyPhase;
    };
  }, [scrollRootRef]);

  const showDebug = import.meta.env.DEV && (new URLSearchParams(location.search).has('sky') || new URLSearchParams(location.search).has('skyDebug'));
  return <div ref={sceneRef} className="sky-timeline" aria-hidden="true">
    <div className="sky-timeline__poster-scene">
      <div className="sky-timeline__poster" />
      <div className="sky-timeline__cloud sky-timeline__cloud--far" />
      <div className="sky-timeline__cloud sky-timeline__cloud--near" />
      <div className="sky-timeline__horizon" />
      <div ref={sunRef} className="sky-timeline__sun" />
      <div className="sky-timeline__stars" />
      <div ref={moonRef} className="sky-timeline__moon" />
    </div>
    <SkyCanvas />
    {showDebug && <span ref={progressRef} className="sky-timeline__debug" />}
  </div>;
}
