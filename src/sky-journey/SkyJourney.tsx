import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { scrollToPosition, subscribeScrollFrames } from '../animations/scroll';
import { sample, type RGB } from '../sky/timeline';
import { journeyScenes, journeyStops } from './scenes';
import './journey.css';

const JourneyCanvas = lazy(() => import('./webgl/JourneyCanvas'));

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const cssRgb = (color: RGB) => `rgb(${color.map(Math.round).join(' ')})`;
const progressFromQuery = () => {
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('p')) return null;
  const value = Number(params.get('p'));
  return Number.isFinite(value) ? clamp01(value) : null;
};

function sceneOpacity(progress: number, scene: typeof journeyScenes[number]) {
  const incoming = smoothstep(clamp01((progress - scene.inStart) / (scene.inEnd - scene.inStart)));
  const outgoing = scene.outEnd > scene.outStart
    ? smoothstep(clamp01((progress - scene.outStart) / (scene.outEnd - scene.outStart)))
    : 0;
  return incoming * (1 - outgoing);
}

export function SkyJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const [loadWebGL, setLoadWebGL] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const canUseWebGL = () => {
      let reduceEffects = false;
      try { reduceEffects = localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
      return !reduceMotion.matches && !reduceEffects;
    };
    let timer = 0;
    const scheduleLoad = () => {
      window.clearTimeout(timer);
      if (canUseWebGL()) timer = window.setTimeout(() => setLoadWebGL(true), 120);
      else setLoadWebGL(false);
    };
    scheduleLoad();
    const onReduceEffects = (event: Event) => {
      if ((event as CustomEvent<boolean>).detail) setLoadWebGL(false);
      else scheduleLoad();
    };
    window.addEventListener('aeris:reduce-effects-change', onReduceEffects);
    reduceMotion.addEventListener('change', scheduleLoad);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('aeris:reduce-effects-change', onReduceEffects);
      reduceMotion.removeEventListener('change', scheduleLoad);
    };
  }, []);

  useEffect(() => {
    const stage = trackRef.current?.querySelector<HTMLElement>('.journey__stage');
    if (!stage) return;
    stage.dataset.renderMode = loadWebGL ? 'webgl' : 'static';
    if (loadWebGL) delete stage.dataset.webglFallback;
    else {
      stage.dataset.webglFallback = 'static';
      delete stage.dataset.webglReady;
    }
  }, [loadWebGL]);

  useEffect(() => {
    const track = trackRef.current;
    const stage = track?.querySelector<HTMLElement>('.journey__stage');
    if (!track || !stage) return;

    const sceneElements = journeyScenes.map((scene) => ({
      scene,
      element: stage.querySelector<HTMLElement>(`[data-scene="${scene.id}"]`),
    }));
    const stopButtons = [...stage.querySelectorAll<HTMLButtonElement>('[data-stop-progress]')];
    const debug = stage.querySelector<HTMLElement>('.journey__debug');
    const hud = stage.querySelector<HTMLOutputElement>('.journey__hud');
    const previousCursorA = document.body.style.getPropertyValue('--cursor-a');
    const previousCursorB = document.body.style.getPropertyValue('--cursor-b');
    const previousChapterGlow = document.body.style.getPropertyValue('--chapter-glow');
    const frozenProgress = progressFromQuery();
    let smoothProgress = frozenProgress ?? 0;

    const render = (scroll: number, deltaSeconds: number, initial = false) => {
      const rect = track.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const scrollableDistance = Math.max(1, track.offsetHeight - window.innerHeight);
      const rawProgress = frozenProgress ?? clamp01((scroll - trackTop) / scrollableDistance);
      if (initial || frozenProgress !== null) smoothProgress = rawProgress;
      else smoothProgress += (rawProgress - smoothProgress) * (1 - Math.exp(-6 * deltaSeconds));

      const sky = sample(smoothProgress);
      stage.style.setProperty('--sky-top', cssRgb(sky.top));
      stage.style.setProperty('--sky-middle', cssRgb(sky.middle));
      stage.style.setProperty('--sky-horizon', cssRgb(sky.horizon));
      stage.style.setProperty('--journey-text', cssRgb(sky.text));
      stage.style.setProperty('--journey-accent', cssRgb(sky.horizon));
      stage.style.setProperty('--journey-progress', smoothProgress.toFixed(4));
      const cursorPalette = smoothProgress < .22 ? { a: '#F2B8A0', b: '#C9B6E8', glow: '242, 184, 160' }
        : smoothProgress < .52 ? { a: '#9FD6EC', b: '#7FD1C4', glow: '159, 214, 236' }
          : smoothProgress < .78 ? { a: '#F2B880', b: '#E8A0A0', glow: '242, 184, 128' }
            : smoothProgress < .93 ? { a: '#C9A0E8', b: '#E8A0A0', glow: '201, 160, 232' }
              : { a: '#7FD1C4', b: '#9FD6EC', glow: '127, 209, 196' };
      document.body.style.setProperty('--cursor-a', cursorPalette.a);
      document.body.style.setProperty('--cursor-b', cursorPalette.b);
      document.body.style.setProperty('--chapter-glow', cursorPalette.glow);

      sceneElements.forEach(({ scene, element }) => {
        if (!element) return;
        const opacity = sceneOpacity(smoothProgress, scene);
        const incoming = smoothstep(clamp01((smoothProgress - scene.inStart) / (scene.inEnd - scene.inStart)));
        const outgoing = scene.outEnd > scene.outStart
          ? smoothstep(clamp01((smoothProgress - scene.outStart) / (scene.outEnd - scene.outStart)))
          : 0;
        const translateY = outgoing > 0 ? -24 * outgoing : 24 * (1 - incoming);
        element.style.opacity = opacity.toFixed(3);
        element.style.transform = `translateY(${translateY.toFixed(2)}px)`;
        element.inert = opacity < .02;
        element.setAttribute('aria-hidden', String(opacity < .02));
      });

      const activeStop = smoothProgress < .25 ? 'sunrise' : smoothProgress < .52 ? 'noon' : smoothProgress < .80 ? 'sunset' : 'night';
      const activeMoment = journeyStops.find((stop) => stop.id === activeStop) ?? journeyStops[0];
      if (hud) hud.textContent = `${activeMoment.time} · ${activeMoment.label}`;
      stopButtons.forEach((button) => {
        if (button.dataset.stopId === activeStop) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });

      if (debug) debug.textContent = `Journey progress ${smoothProgress.toFixed(2)} · ${sky.moment}`;
    };

    render(window.scrollY, 1 / 60, true);
    const unsubscribe = frozenProgress === null
      ? subscribeScrollFrames((scroll, deltaSeconds) => render(scroll, deltaSeconds))
      : () => undefined;

    const jumpTo = (progress: number) => {
      const rect = track.getBoundingClientRect();
      const trackTop = rect.top + window.scrollY;
      const distance = Math.max(0, track.offsetHeight - window.innerHeight);
      scrollToPosition(trackTop + distance * progress);
    };
    const onStopClick = (event: Event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-stop-progress]');
      if (button?.dataset.stopProgress) jumpTo(Number(button.dataset.stopProgress));
    };
    stage.addEventListener('click', onStopClick);

    return () => {
      unsubscribe();
      stage.removeEventListener('click', onStopClick);
      if (previousCursorA) document.body.style.setProperty('--cursor-a', previousCursorA);
      else document.body.style.removeProperty('--cursor-a');
      if (previousCursorB) document.body.style.setProperty('--cursor-b', previousCursorB);
      else document.body.style.removeProperty('--cursor-b');
      if (previousChapterGlow) document.body.style.setProperty('--chapter-glow', previousChapterGlow);
      else document.body.style.removeProperty('--chapter-glow');
    };
  }, []);

  const showDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).has('p');

  return <section className="journey" id="top" ref={trackRef} aria-label="A journey through the sky">
    <div className="journey__stage">
      {loadWebGL && <Suspense fallback={null}><JourneyCanvas /></Suspense>}
      <div className="journey__content">
        {journeyScenes.map((scene) => <article key={scene.id} className="journey__scene" data-scene={scene.id} data-side={scene.side} aria-hidden="true" inert>
          <p className="journey__eyebrow"><span>{scene.label}</span><time dateTime={scene.time}>{scene.time}</time></p>
          <h1>{scene.titleBefore} <em>{scene.titleAccent}</em></h1>
          {scene.body && <p className="journey__description">{scene.body}</p>}
          <div className="journey__actions">
            {scene.actions.map((action) => <a key={action.label} className={action.secondary ? 'journey__button journey__button--secondary' : 'journey__button'} href={action.href}>
              {action.label}{action.secondary ? <ArrowUpRight size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
            </a>)}
          </div>
        </article>)}
      </div>

      <nav className="journey__rail" aria-label="Choose a time of day">
        {journeyStops.map((stop) => <button key={stop.id} type="button" data-stop-id={stop.id} data-stop-progress={stop.progress} aria-label={`Go to ${stop.label}, ${stop.time}`}>
          <span aria-hidden="true" className="journey__rail-dot" />
          <span className="journey__rail-label">{stop.label}<time dateTime={stop.time}>{stop.time}</time></span>
        </button>)}
      </nav>
      {showDebug && <output className="journey__debug" aria-live="off" />}
      <output className="journey__hud" aria-label="Current sky journey time" aria-live="off" />
    </div>
  </section>;
}
