import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { getSkyProgress, subscribeSkyProgress } from './skyProgress';
import type { SkyScene } from './SkyScene';

function effectsAllowed() {
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    && document.documentElement.dataset.reduceEffects !== 'true';
}

/** Mounts the WebGL scene after first paint; the CSS poster stays active on failure or reduced effects. */
export function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(effectsAllowed);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh = () => setEnabled(effectsAllowed());
    motionPreference.addEventListener('change', refresh);
    window.addEventListener('aeris:reduce-effects-change', refresh);
    return () => {
      motionPreference.removeEventListener('change', refresh);
      window.removeEventListener('aeris:reduce-effects-change', refresh);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const timeline = canvas.closest<HTMLElement>('.sky-timeline');
    if (!timeline || !enabled) {
      if (timeline) timeline.dataset.webglReady = 'false';
      return;
    }

    let mounted = true;
    let scene: SkyScene | undefined;
    let unsubscribeProgress: () => void = () => {};
    let ticker: ((time: number, deltaMs: number) => void) | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let currentProgress = getSkyProgress();
    let introElapsed = 0;
    let introProgress = 0;
    let introSkipped = currentProgress > .015;
    let isVisible = document.visibilityState === 'visible';
    const supportsMouseParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const resize = () => scene?.resize(window.innerWidth, window.innerHeight);
    const onPointerMove = (event: PointerEvent) => {
      scene?.setMouseParallax((event.clientX / window.innerWidth - .5) * 1.2, (.5 - event.clientY / window.innerHeight) * 1.2);
    };
    const resetParallax = () => scene?.setMouseParallax(0, 0);
    const onVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
      if (isVisible && scene) scene.render();
    };

    const start = async () => {
      try {
        const { createSkyScene } = await import('./SkyScene');
        if (!mounted) return;
        scene = createSkyScene(canvas);
        scene.update(currentProgress, introSkipped ? 1 : introProgress);
        unsubscribeProgress = subscribeSkyProgress((progress) => {
          currentProgress = progress;
          scene?.update(progress, introSkipped ? 1 : introProgress);
        });
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        if (supportsMouseParallax) {
          window.addEventListener('pointermove', onPointerMove, { passive: true });
          window.addEventListener('blur', resetParallax);
          document.documentElement.addEventListener('pointerleave', resetParallax);
        }
        ticker = (_time: number, deltaMs: number) => {
          if (!isVisible || !scene) return;
          const dt = Math.min(deltaMs / 1000, .05);
          if (!introSkipped) {
            if (currentProgress > .015) {
              introSkipped = true;
              introProgress = 1;
            } else {
              introElapsed = Math.min(2.5, introElapsed + dt);
              const t = introElapsed / 2.5;
              introProgress = t * t * (3 - 2 * t);
              if (introElapsed >= 2.5) introSkipped = true;
            }
          }
          scene.update(currentProgress, introSkipped ? 1 : introProgress, dt);
          scene.render();
        };
        gsap.ticker.add(ticker);
        scene.render();
        timeline.dataset.webglReady = 'true';
      } catch {
        timeline.dataset.webglReady = 'false';
      }
    };

    timeline.dataset.webglReady = 'false';
    void start();
    return () => {
      mounted = false;
      if (ticker) gsap.ticker.remove(ticker);
      unsubscribeProgress();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (supportsMouseParallax) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('blur', resetParallax);
        document.documentElement.removeEventListener('pointerleave', resetParallax);
      }
      scene?.dispose();
      timeline.dataset.webglReady = 'false';
    };
  }, [enabled]);

  return <div className="sky-canvas" aria-hidden="true"><canvas ref={canvasRef} className="sky-canvas__surface" /></div>;
}
