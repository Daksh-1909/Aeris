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
    let lastProgress = 0;
    let lastFrameTime = performance.now();
    let swayTimer = 0;
    let swayTween: gsap.core.Tween | undefined;

    const renderProgress = (value: number) => {
      const frame = sample(value);
      const now = performance.now();
      const elapsed = Math.max(1, now - lastFrameTime);
      const speed = Math.abs(frame.progress - lastProgress) / elapsed * 1000;
      if (frame.progress !== lastProgress) {
        window.clearTimeout(swayTimer);
        swayTimer = window.setTimeout(() => {
          swayTween?.kill();
          swayTween = gsap.to(stage, { '--canopy-sway': '1.2deg', duration: 1.5, ease: 'power2.out' });
        }, 1500);
        if (speed > .12) {
          const sway = 1.2 + 1.2 * clamp01(speed / 1.2);
          swayTween?.kill();
          swayTween = gsap.to(stage, { '--canopy-sway': `${sway.toFixed(2)}deg`, duration: .12, ease: 'power1.out' });
        }
      }
      lastProgress = frame.progress;
      lastFrameTime = now;
      stage.style.setProperty('--sky-top', rgb(frame.top));
      stage.style.setProperty('--sky-middle', rgb(frame.middle));
      stage.style.setProperty('--sky-horizon', rgb(frame.horizon));
      stage.style.setProperty('--journey-text', rgb(frame.text));
      stage.style.setProperty('--journey-progress', frame.progress.toFixed(4));
      const sunrise = 1 - smoothstep(clamp01(frame.progress / .30));
      const sunset = smoothstep(clamp01((frame.progress - .48) / .20)) * (1 - smoothstep(clamp01((frame.progress - .73) / .12)));
      const nightFade = 1 - smoothstep(clamp01((frame.progress - .78) / .17));
      stage.style.setProperty('--cloud-opacity', (nightFade * (.38 + .62 * frame.cloudBrightness)).toFixed(3));
      stage.style.setProperty('--cloud-sepia', (.38 * sunrise + .42 * sunset).toFixed(3));
      stage.style.setProperty('--cloud-hue', `${(330 * sunrise + 16 * sunset).toFixed(1)}deg`);
      stage.style.setProperty('--cloud-saturation', (1 + .35 * (sunrise + sunset)).toFixed(3));
      stage.style.setProperty('--cloud-brightness', (1 + .10 * frame.cloudBrightness).toFixed(3));
      stage.style.setProperty('--orb-y', `${orbYForViewport(frame.progress).toFixed(2)}%`);
      stage.style.setProperty('--beat-scrim', (.38 - .26 * smoothstep(clamp01((frame.progress - .70) / .20))).toFixed(3));
      stage.dataset.moment = frame.moment;
      setProgress(frame.progress);
    };

    const driver = { value: 0 };
    renderProgress(0);
    const updateOrbAnchor = () => stage.style.setProperty('--orb-y', `${orbYForViewport(lastProgress).toFixed(2)}%`);
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
      window.clearTimeout(swayTimer);
      window.removeEventListener('resize', updateOrbAnchor);
      swayTween?.kill();
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
        <div className="journey__sky" />
        <div className="journey__horizon" data-layer="horizon" />
      </div>
      <NightSky progress={progress} opacity={nightOpacity} auroraOpacity={auroraOpacity} />
      {cloudDepths.map((depth) => <div key={depth} data-layer={`clouds-${depth}`} className={`journey__plane journey__plane--clouds-${depth} journey__cloud-layer--${depth}`} aria-hidden="true">
        {cloudPlacements.filter((cloud) => cloud.depth === depth).map((cloud) => <figure key={cloud.id} data-layer={`cloud-${depth}-${cloud.id}`} className={`journey__cloud${cloud.mobileHidden ? ' journey__cloud--mobile-hidden' : ''}`} style={{
          left: `${cloud.left}%`,
          top: `${cloud.top}%`,
          width: `clamp(${cloud.minPx}px, ${cloud.sizeVw}vw, ${cloud.maxPx}px)`,
          opacity: cloud.opacity,
          transform: `translate3d(${(progress - .5) * cloud.parallaxX}vw, ${(progress - .5) * cloud.parallaxY}vh, 0)`,
        }}>
          <img src={cloud.src} alt="" draggable={false} style={{
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
    const frame = sample(next);
    setProgress(next);
    stage?.style.setProperty('--sky-top', rgb(frame.top));
    stage?.style.setProperty('--sky-middle', rgb(frame.middle));
    stage?.style.setProperty('--sky-horizon', rgb(frame.horizon));
    stage?.style.setProperty('--journey-text', rgb(frame.text));
    stage?.style.setProperty('--cloud-opacity', (smoothstep(clamp01((.78 - next) / .17)) * (.38 + .62 * frame.cloudBrightness)).toFixed(3));
    stage?.style.setProperty('--orb-y', `${orbYForViewport(next).toFixed(2)}%`);
    stage?.style.setProperty('--beat-scrim', (.38 - .26 * smoothstep(clamp01((next - .70) / .20))).toFixed(3));
  };
  return <div className="journey__plane journey__plane--grain journey__layer-debug" aria-label="Layer debug overlay" data-layer="grain" data-progress={progress.toFixed(2)}>
    {items.map(({ name, rect, z, contexts, layer }, index) => <div key={`${name}-${index}`} className="journey__layer-debug-box" style={{ left: rect.left - (bounds?.left ?? 0), top: rect.top - (bounds?.top ?? 0), width: rect.width, height: rect.height, '--debug-color': `hsl(${index * 47 % 360} 100% 65%)` } as CSSProperties}>
      <span>{name} · {layer || 'no data-layer'} · z:{z}<br />{contexts.join(' ← ') || 'no local stacking context'}</span>
    </div>)}
    <div className="journey__layer-debug-horizon"><span>horizon line · {stage ? getComputedStyle(stage).getPropertyValue('--horizon-y').trim() : 'loading'}</span></div>
    <label className="journey__layer-debug-control">debug progress {progress.toFixed(2)}<input aria-label="Layer debug progress" type="range" min="0" max="100" value={Math.round(progress * 100)} onChange={(event) => setDebugProgress(Number(event.currentTarget.value) / 100)} /></label>
  </div>;
}
