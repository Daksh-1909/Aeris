import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToPosition } from '../animations/scroll';
import { sample, type RGB } from '../sky/timeline';
import { cloudPlacements, type CloudDepth } from './clouds';
import { BirdFlock } from './BirdFlock';
import { GroundScene } from './GroundScene';
import { NightSky } from './NightSky';
import './journey.css';

const layerDebug = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debug') === 'layers';

gsap.registerPlugin(ScrollTrigger);

const rgb = (color: RGB) => `rgb(${color.map(Math.round).join(' ')})`;
const boundaries = [.20, .45, .65, .80, .90];
const fadeWidth = .035;
const beats = [
  { title: 'READ THE SKY', copy: 'A journal of light, cloud and weather. Begin where the day begins.' },
  { title: 'A NEW ANGLE OF LIGHT', copy: 'Follow the changing colour from first light to evening.' },
  { title: 'UNDER AN ENDLESS BLUE', copy: 'Clouds and clear air make every day a different study.' },
  { title: 'LIGHT, BEFORE IT LEAVES', copy: 'Make time for the last warm minutes of daylight.' },
  { title: 'THE SUN BECOMES THE MOON', copy: 'Stay a little longer and watch the sky change.' },
  { title: 'WHEN THE SKY BECOMES INFINITE', copy: 'Keep a record of what you find above.' },
] as const;
const cloudDepths: readonly CloudDepth[] = ['far', 'mid', 'near'];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

function beatVisibility(progress: number, index: number) {
  const entering = index === 0 ? 1 : smoothstep(clamp01((progress - boundaries[index - 1] + fadeWidth) / (fadeWidth * 2)));
  const leaving = index === beats.length - 1 ? 0 : smoothstep(clamp01((progress - boundaries[index] + fadeWidth) / (fadeWidth * 2)));
  return { opacity: entering * (1 - leaving), y: (1 - entering) * 14 - leaving * 12 };
}

function beatStyle(progress: number, index: number): CSSProperties {
  const visibility = beatVisibility(progress, index);
  return { opacity: visibility.opacity, transform: `translateY(${visibility.y}px)` };
}

function orbYForViewport(progress: number) {
  const compact = window.innerWidth < 1024;
  const mobile = window.innerWidth < 768;
  const y = mobile ? [75, 52, 70, 52] : compact ? [76, 50, 72, 50] : [78, 30, 70, 40];
  const stops = [{ at: 0, y: y[0] }, { at: .30, y: y[1] }, { at: .70, y: y[2] }, { at: .85, y: (y[2] + y[3]) / 2 }, { at: 1, y: y[3] }];
  const stopIndex = stops.findIndex((_, index) => index < stops.length - 1 && progress <= stops[index + 1]!.at);
  const index = stopIndex < 0 ? stops.length - 2 : stopIndex;
  const from = stops[index]!;
  const to = stops[index + 1]!;
  const amount = smoothstep(clamp01((progress - from.at) / (to.at - from.at)));
  return from.y + (to.y - from.y) * amount;
}

function mixRgb(from: RGB, to: RGB, amount: number): RGB {
  return [0, 1, 2].map((index) => Math.round(from[index] + (to[index] - from[index]) * amount)) as unknown as RGB;
}

function orbAppearance(progress: number) {
  const p = clamp01(progress);
  const dawnNoon = smoothstep(clamp01(p / .30));
  const noonSunset = smoothstep(clamp01((p - .30) / .40));
  const moon = smoothstep(clamp01((p - .78) / .10));
  const sunColor = p < .30
    ? mixRgb([255, 138, 61], [255, 241, 196], dawnNoon)
    : mixRgb([255, 241, 196], [255, 90, 31], noonSunset);
  const tintOpacity = (p < .30 ? .75 - .65 * dawnNoon : .10 + .75 * noonSunset) * (1 - moon);
  const whiteOpacity = .8 * smoothstep(clamp01(p / .30)) * (1 - smoothstep(clamp01((p - .45) / .25)));
  const glowColor = p < .30
    ? mixRgb([255, 170, 110], [255, 244, 214], dawnNoon)
    : mixRgb([255, 244, 214], [255, 96, 40], noonSunset);
  const sunGlowOpacity = (p < .30 ? .55 - .10 * dawnNoon : .45 + .10 * noonSunset) * (1 - moon);
  const dayScale = p < .30 ? 1 + .3 * dawnNoon : 1.3 - .1 * noonSunset;
  return {
    sunColor,
    tintOpacity,
    whiteOpacity,
    glowColor: mixRgb(glowColor, [194, 211, 255], moon),
    glowOpacity: sunGlowOpacity + .22 * moon,
    glowScale: dayScale * (1 - moon) + moon,
  };
}

export function SkyJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const sky = sample(progress);
  const moonTransition = clamp01((progress - .78) / .10);
  const orb = orbAppearance(progress);
  const sunOpacity = 1 - moonTransition;
  const nightOpacity = smoothstep(clamp01((progress - .78) / .12)) * sky.stars;
  const auroraOpacity = .68 * smoothstep(clamp01((progress - .86) / .14));

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const cloudLayers = [...stage.querySelectorAll<HTMLElement>('.journey__cloud-layer')];
    const clouds = [...stage.querySelectorAll<HTMLElement>('.journey__cloud')].map((element) => ({
      element,
      x: Number(element.dataset.parallaxX ?? getComputedStyle(element).getPropertyValue('--cloud-parallax-x')),
      y: Number(element.dataset.parallaxY ?? getComputedStyle(element).getPropertyValue('--cloud-parallax-y')),
    }));
    const beatNodes = [...stage.querySelectorAll<HTMLElement>('.journey__beat')];
    const orbNode = stage.querySelector<HTMLElement>('.journey__orb');
    const glowNode = stage.querySelector<HTMLElement>('.journey__orb-glow');
    const moonNode = stage.querySelector<HTMLElement>('.journey__moon');
    const sunNode = stage.querySelector<HTMLElement>('.journey__sun');
    const groundImages = [...stage.querySelectorAll<HTMLElement>('.journey__ground-art > img')];
    const kidsNode = stage.querySelector<HTMLElement>('.journey__children');
    const kidsArtNode = stage.querySelector<HTMLElement>('.journey__children-art');
    const picnicNode = stage.querySelector<HTMLElement>('.journey__picnic');
    const birdsNode = stage.querySelector<HTMLElement>('.journey__birds');
    const skyLayers = [...stage.querySelectorAll<HTMLElement>('.journey__sky-layer')];
    const canvasNode = stage.querySelector<HTMLCanvasElement>('.journey__stars');
    const nebulaNode = stage.querySelector<HTMLElement>('.journey__nebula');
    const auroraNode = stage.querySelector<HTMLElement>('.journey__aurora');
    const readoutNode = stage.querySelector<HTMLOutputElement>('.journey__moment');
    let lastProgress = -1;
    let lastNightActive = false;
    let governorElapsed = 0;
    let governorSlowSeconds = 0;
    let governorFrameTotal = 0;
    let governorFrames = 0;
    let qualityTier = 0;
    try {
      const storedTier = sessionStorage.getItem('aeris:quality-tier');
      const savedTier = Number(storedTier);
      qualityTier = storedTier !== null && Number.isInteger(savedTier) && savedTier >= 0 && savedTier <= 3 ? savedTier
        : ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ? 2 : (navigator.hardwareConcurrency || 4) <= 4 ? 1 : 0);
    } catch { qualityTier = (navigator.hardwareConcurrency || 4) <= 4 ? 1 : 0; }
    stage.dataset.qualityTier = String(qualityTier);
    const governorTick = (_time: number, deltaTime: number) => {
      if (stage.dataset.paused === 'true') return;
      governorElapsed += deltaTime;
      governorFrameTotal += deltaTime;
      governorFrames += 1;
      if (governorElapsed < 1000) return;
      const average = governorFrameTotal / Math.max(1, governorFrames);
      governorSlowSeconds = average > 22 ? governorSlowSeconds + 1 : 0;
      governorElapsed = 0; governorFrameTotal = 0; governorFrames = 0;
      if (governorSlowSeconds >= 3 && qualityTier < 3) {
        qualityTier += 1;
        governorSlowSeconds = 0;
        stage.dataset.qualityTier = String(qualityTier);
        if (canvasNode) canvasNode.dataset.qualityTier = String(qualityTier);
        try { sessionStorage.setItem('aeris:quality-tier', String(qualityTier)); } catch { /* Storage can be disabled. */ }
      }
    };
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let heroVisible = false;
    let governorAttached = false;
    const updateSceneActive = () => {
      const active = heroVisible && document.visibilityState === 'visible' && !motionQuery.matches;
      stage.dataset.paused = String(!active);
      if (active && !governorAttached) { gsap.ticker.add(governorTick); governorAttached = true; }
      if (!active && governorAttached) { gsap.ticker.remove(governorTick); governorAttached = false; }
    };
    const visibility = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      updateSceneActive();
    });
    visibility.observe(stage);
    stage.dataset.paused = 'true';
    const updatePaused = () => updateSceneActive();
    document.addEventListener('visibilitychange', updatePaused);
    motionQuery.addEventListener('change', updatePaused);
    const renderProgress = (value: number) => {
      if (lastProgress >= 0 && Math.abs(value - lastProgress) < .0004) return;
      const frame = sample(value);
      lastProgress = frame.progress;
      stage.dataset.progress = frame.progress.toFixed(4);
      const sunrise = 1 - smoothstep(clamp01(frame.progress / .30));
      const sunset = smoothstep(clamp01((frame.progress - .48) / .20)) * (1 - smoothstep(clamp01((frame.progress - .73) / .12)));
      const nightFade = 1 - smoothstep(clamp01((frame.progress - .78) / .17));
      cloudLayers.forEach((layer) => { layer.style.opacity = (nightFade * (.38 + .62 * frame.cloudBrightness)).toFixed(3); });
      clouds.forEach(({ element, x, y }) => {
        if (qualityTier < 3) element.style.transform = `translate3d(${(frame.progress - .5) * x}vw, ${(frame.progress - .5) * y}vh, 0)`;
        element.style.setProperty('--cloud-tint-opacity', (.24 * sunrise + .3 * sunset).toFixed(3));
      });
      beatNodes.forEach((beat, index) => {
        const visibility = beatVisibility(frame.progress, index);
        beat.style.opacity = visibility.opacity.toFixed(3);
        beat.style.transform = `translate3d(0, ${visibility.y.toFixed(2)}px, 0)`;
        const active = visibility.opacity >= .5;
        const activeValue = String(active);
        const hidden = visibility.opacity < .02;
        if (beat.dataset.active !== activeValue) beat.dataset.active = activeValue;
        if (beat.getAttribute('aria-hidden') !== String(hidden)) beat.setAttribute('aria-hidden', String(hidden));
        if (beat.hasAttribute('inert') !== hidden) beat.toggleAttribute('inert', hidden);
      });
      const orbState = orbAppearance(frame.progress);
      const orbY = orbYForViewport(frame.progress);
      if (orbNode) orbNode.style.transform = `translate3d(-50%, ${orbY}vh, 0)`;
      if (glowNode) { glowNode.style.opacity = orbState.glowOpacity.toFixed(3); glowNode.style.transform = `translate3d(-50%, ${orbY}vh, 0) scale(${(orbState.glowScale * 2.8).toFixed(3)})`; }
      if (moonNode) moonNode.style.opacity = smoothstep(clamp01((frame.progress - .78) / .10)).toFixed(3);
      if (sunNode) sunNode.style.opacity = (1 - smoothstep(clamp01((frame.progress - .78) / .10))).toFixed(3);
      groundImages.forEach((image, index) => {
        const values = [1 - smoothstep(clamp01((frame.progress - .54) / .15)), smoothstep(clamp01((frame.progress - .62) / .10)) * (1 - smoothstep(clamp01((frame.progress - .76) / .13))), smoothstep(clamp01((frame.progress - .82) / .08))];
        image.style.opacity = values[index]!.toFixed(3);
      });
      if (kidsNode) kidsNode.style.opacity = (smoothstep(clamp01((frame.progress - .64) / .06)) * (1 - smoothstep(clamp01((frame.progress - .76) / .06)))).toFixed(3);
      if (kidsArtNode) {
        const isActive = frame.progress >= .70 && frame.progress <= .76;
        if (kidsArtNode.classList.contains('journey__children--active') !== isActive) kidsArtNode.classList.toggle('journey__children--active', isActive);
      }
      if (picnicNode) { const opacity = smoothstep(clamp01((frame.progress - .45) / .04)) * (1 - smoothstep(clamp01((frame.progress - .61) / .02))); picnicNode.style.opacity = opacity.toFixed(3); picnicNode.style.transform = `translate3d(0, ${(1 - opacity) * 8}px, 0)`; }
      if (birdsNode) { const fadeIn = smoothstep(clamp01(frame.progress / .04)); const fadeOut = 1 - smoothstep(clamp01((frame.progress - .20) / .06)); const travel = clamp01(frame.progress / .26); birdsNode.style.opacity = (frame.progress < .26 ? fadeIn * fadeOut : 0).toFixed(3); if (qualityTier < 3) birdsNode.style.transform = `translate3d(${120 * travel}vw, ${(-22 * travel + Math.sin(travel * Math.PI * 2) * 1.4)}vh, 0)`; }
      skyLayers.forEach((layer, index) => {
        const stops = [0, .3, .7, .85, 1];
        const left = stops[Math.max(0, index - 1)]!;
        const right = stops[Math.min(stops.length - 1, index + 1)]!;
        const center = stops[index]!;
        const weight = frame.progress <= center
          ? (index === 0 ? 1 : smoothstep(clamp01((frame.progress - left) / (center - left))))
          : (index === stops.length - 1 ? 1 : 1 - smoothstep(clamp01((frame.progress - center) / (right - center))));
        layer.style.opacity = weight.toFixed(3);
      });
      if (canvasNode) {
        canvasNode.dataset.progress = frame.progress.toFixed(4);
        canvasNode.dataset.qualityTier = String(qualityTier);
        canvasNode.style.opacity = String(frame.stars);
        const nightActive = frame.progress > .55 && frame.stars > 0;
        if (nightActive && !lastNightActive) canvasNode.dispatchEvent(new Event('skyprogress'));
        lastNightActive = nightActive;
      }
      if (nebulaNode) nebulaNode.style.opacity = String(.7 * smoothstep(clamp01((frame.progress - .8) / .2)));
      if (auroraNode) auroraNode.style.opacity = String(.68 * smoothstep(clamp01((frame.progress - .86) / .14)));
      if (readoutNode && readoutNode.textContent !== frame.moment) readoutNode.textContent = frame.moment;
      if (layerDebug) setProgress(frame.progress);
    };

    const driver = { value: 0 };
    const onDebugProgress = (event: Event) => {
      const next = (event as CustomEvent<number>).detail;
      driver.value = clamp01(next);
      requestAnimationFrame(() => renderProgress(driver.value));
    };
    stage.addEventListener('aeris:debug-progress', onDebugProgress);
    renderProgress(0);
    const updateOrbAnchor = () => {
      const y = orbYForViewport(Math.max(0, lastProgress));
      if (orbNode) orbNode.style.transform = `translate3d(-50%, ${y}vh, 0)`;
      if (glowNode) glowNode.style.transform = `translate3d(-50%, ${y}vh, 0) scale(${(orbAppearance(Math.max(0, lastProgress)).glowScale * 2.8).toFixed(3)})`;
    };
    window.addEventListener('resize', updateOrbAnchor);
    const tween = gsap.to(driver, {
      value: 1,
      ease: 'none',
      onUpdate: () => renderProgress(driver.value),
      scrollTrigger: {
        trigger: track,
        start: 'top top',
        end: () => `+=${Math.max(1, track.offsetHeight - window.innerHeight)}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener('resize', updateOrbAnchor);
      stage.removeEventListener('aeris:debug-progress', onDebugProgress);
      document.removeEventListener('visibilitychange', updatePaused);
      motionQuery.removeEventListener('change', updatePaused);
      visibility.disconnect();
      if (governorAttached) gsap.ticker.remove(governorTick);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  const scrubTo = (value: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const trackTop = rect.top + window.scrollY;
    const distance = Math.max(1, track.offsetHeight - window.innerHeight);
    scrollToPosition(trackTop + distance * value, true);
    ScrollTrigger.update();
  };

  return <section className="journey" id="journey" ref={trackRef} aria-label="A journey through the sky">
    <div className="journey__stage" ref={stageRef} data-layer="stage">
      <div className="journey__plane journey__plane--sky" data-layer="sky" aria-hidden="true">
        {['sunrise', 'noon', 'sunset', 'dusk', 'midnight'].map((moment) => <div key={moment} className={`journey__sky-layer journey__sky-layer--${moment}`} />)}
        <div className="journey__sky" />
        <div className="journey__horizon" data-layer="horizon" />
      </div>
      <NightSky progress={progress} opacity={nightOpacity} auroraOpacity={auroraOpacity} />
      {cloudDepths.map((depth) => <div key={depth} data-layer={`clouds-${depth}`} className={`journey__plane journey__plane--clouds-${depth} journey__cloud-layer journey__cloud-layer--${depth}`} aria-hidden="true">
        {cloudPlacements.filter((cloud) => cloud.depth === depth).map((cloud) => <figure key={cloud.id} data-layer={`cloud-${depth}-${cloud.id}`} className={`journey__cloud${cloud.mobileHidden ? ' journey__cloud--mobile-hidden' : ''}`} style={{
          left: `${cloud.left}%`,
          top: `${cloud.top}%`,
          width: `clamp(${cloud.minPx}px, ${cloud.sizeVw}vw, ${cloud.maxPx}px)`,
          opacity: cloud.opacity,
          transform: `translate3d(${(progress - .5) * cloud.parallaxX}vw, ${(progress - .5) * cloud.parallaxY}vh, 0)`,
          '--cloud-parallax-x': cloud.parallaxX,
          '--cloud-parallax-y': cloud.parallaxY,
          '--cloud-mask': `url("${cloud.src}")`,
          '--cloud-tint': cloud.depth === 'far' ? '#d7e4ef' : cloud.depth === 'mid' ? '#f0c7a6' : '#f2ad82',
        } as CSSProperties}>
          <img src={cloud.src} alt="" draggable={false} loading="lazy" decoding="async"
            width={600}
            height={cloud.src.includes('far_1') ? 236 : cloud.src.includes('far_2') ? 246 : cloud.src.includes('mid_1') ? 203 : cloud.src.includes('mid_2') ? 210 : cloud.src.includes('near_1') ? 342 : 308}
            style={{
            animationDuration: `${cloud.duration}s`,
            animationDelay: `-${cloud.phase}s`,
            '--cloud-drift-from': `${cloud.driftPx * -.5}px`,
            '--cloud-drift-to': `${cloud.driftPx * .5}px`,
            '--cloud-drift-y': `${cloud.driftY}px`,
          } as CSSProperties} />
        </figure>)}
      </div>)}
      <BirdFlock progress={progress} />
      <div className="journey__plane journey__plane--orb-glow" data-layer="orb-glow" aria-hidden="true">
        <div className="journey__orb-glow" style={{ opacity: orb.glowOpacity, '--orb-glow-rgb': orb.glowColor.join(' '), '--orb-glow-scale': orb.glowScale } as CSSProperties} />
      </div>
      <div className="journey__plane journey__plane--orb" data-layer="orb" aria-hidden="true">
        <div className="journey__orb">
          <div className="journey__moon" style={{ opacity: moonTransition }} />
          <div className="journey__sun" style={{ opacity: sunOpacity }}>
            <img className="journey__sun-disc" src="/3d/sun_color_1k.webp" alt="" decoding="async" style={{ animationPlayState: sunOpacity > .01 ? 'running' : 'paused' }} />
            <div className="journey__sun-tint" style={{ opacity: orb.tintOpacity, '--sun-tint': rgb(orb.sunColor) } as CSSProperties} />
            <div className="journey__sun-white" style={{ opacity: orb.whiteOpacity }} />
          </div>
        </div>
      </div>
      <GroundScene progress={progress} />
      <div className="journey__plane journey__plane--beats" data-layer="beats" aria-label="Journey story">
        {beats.map((beat, index) => {
          const visibility = beatVisibility(progress, index);
          const hidden = visibility.opacity < .02;
          return <article key={beat.title} data-layer={`beat-${index + 1}`} data-active={visibility.opacity >= .5} className="journey__beat" style={beatStyle(progress, index)} aria-hidden={hidden} inert={hidden}>
            <p className="journey__eyebrow">AERIS <span>·</span> {String(index + 1).padStart(2, '0')} / 06</p>
            <h1 data-title={beat.title}>{beat.title}</h1>
            <p>{beat.copy}</p>
            <a href="#collection" className="journey__button">Explore the gallery <span aria-hidden="true">↗</span></a>
          </article>;
        })}
      </div>
      <div className="journey__plane journey__plane--rail" data-layer="rail" aria-hidden="true">
        <output className="journey__moment" data-layer="time-readout" aria-label="Current sky moment" aria-live="off">{sky.moment}</output>
      </div>
      {import.meta.env.DEV && <div className="journey__plane journey__plane--rail journey__debug-plane" data-layer="rail-controls">
        <label htmlFor="journey-progress">Scrub sky</label>
        <input id="journey-progress" type="range" min="0" max="1000" step="1" value={Math.round(progress * 1000)} onChange={(event) => scrubTo(Number(event.currentTarget.value) / 1000)} />
        <output htmlFor="journey-progress">{sky.moment} · {progress.toFixed(2)}</output>
      </div>}
      {layerDebug && <LayerDebug stageRef={stageRef} progress={progress} setProgress={setProgress} />}
    </div>
  </section>;
}

const debugLayers = [
  ['header', '.site-header'], ['beat zone', '.journey__plane--beats'],
  ['orb glow', '.journey__orb-glow'], ['orb disc', '.journey__orb'], ['cloud far', '.journey__cloud-layer--far'], ['cloud mid', '.journey__cloud-layer--mid'],
  ['cloud near', '.journey__cloud-layer--near'], ['ground back', '.journey__plane--ground-back'], ['ground front', '.journey__plane--ground-front'],
  ['tree', '.journey__tree-art'], ['children', '.journey__children'], ['birds', '.journey__birds'], ['time readout', '.journey__moment'],
] as const;

function LayerDebug({ stageRef, progress, setProgress }: { stageRef: RefObject<HTMLDivElement | null>; progress: number; setProgress: (value: number) => void }) {
  const [, refresh] = useState(0);
  useEffect(() => { refresh((value) => value + 1); }, []);
  const stage = stageRef.current;
  const bounds = stage?.getBoundingClientRect();
  const items = stage && bounds ? debugLayers.flatMap(([name, selector]) => [...document.querySelectorAll<HTMLElement>(selector)]
    .filter((element) => element.getClientRects().length && Number(getComputedStyle(element).opacity) > 0.01)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const plane = element.dataset.layer ? element : element.closest<HTMLElement>('[data-layer]') ?? element;
      const z = getComputedStyle(plane).zIndex;
      const contexts: string[] = [];
      let node: HTMLElement | null = element;
      while (node && node !== stage.parentElement) {
        const s = getComputedStyle(node);
        const reasons = [s.transform !== 'none' && 'transform', s.filter !== 'none' && 'filter', Number(s.opacity) < 1 && 'opacity', s.isolation === 'isolate' && 'isolation', s.willChange !== 'auto' && `will-change:${s.willChange}`, s.mixBlendMode !== 'normal' && 'mix-blend-mode', (s.position !== 'static' && s.zIndex !== 'auto') && `z-index:${s.zIndex}`].filter(Boolean);
        if (reasons.length) contexts.push(`${node.className || node.tagName}: ${reasons.join(', ')}`);
        node = node.parentElement;
      }
      return { name, rect, z, contexts, layer: plane.dataset.layer };
    })) : [];
  const setDebugProgress = (value: number) => {
    const next = clamp01(value);
    setProgress(next);
    stage?.dispatchEvent(new CustomEvent('aeris:debug-progress', { detail: next }));
  };
  return <div className="journey__plane journey__plane--grain journey__layer-debug" aria-label="Layer debug overlay" data-layer="grain" data-progress={progress.toFixed(2)}>
    {items.map(({ name, rect, z, contexts, layer }, index) => <div key={`${name}-${index}`} className="journey__layer-debug-box" style={{ left: rect.left - (bounds?.left ?? 0), top: rect.top - (bounds?.top ?? 0), width: rect.width, height: rect.height, '--debug-color': `hsl(${index * 47 % 360} 100% 65%)` } as CSSProperties}>
      <span>{name} · {layer || 'no data-layer'} · z:{z}<br />{contexts.join(' ← ') || 'no local stacking context'}</span>
    </div>)}
    <div className="journey__layer-debug-horizon"><span>horizon line · {stage ? getComputedStyle(stage).getPropertyValue('--horizon-y').trim() : 'loading'}</span></div>
    <label className="journey__layer-debug-control">debug progress {progress.toFixed(2)}<input aria-label="Layer debug progress" type="range" min="0" max="100" value={Math.round(progress * 100)} onChange={(event) => setDebugProgress(Number(event.currentTarget.value) / 100)} /></label>
  </div>;
}
