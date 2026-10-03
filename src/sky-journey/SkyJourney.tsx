import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToPosition } from '../animations/scroll';
import { sample, type RGB } from '../sky/timeline';
import { cloudPlacements, type CloudDepth } from './clouds';
import { BirdFlock } from './BirdFlock';
import { GroundScene } from './GroundScene';
import { NightSky } from './NightSky';
import './journey.css';

gsap.registerPlugin(ScrollTrigger);

const rgb = (color: RGB) => `rgb(${color.map(Math.round).join(' ')})`;
const boundaries = [.20, .45, .65, .80, .90];
const fadeWidth = .035;
const beats = [
  { title: 'READ THE SKY', position: 'top-left', side: 'left', copy: 'A journal of light, cloud and weather. Begin where the day begins.' },
  { title: 'A NEW ANGLE OF LIGHT', position: 'top-left', side: 'right', copy: 'Follow the changing colour from first light to evening.' },
  { title: 'UNDER AN ENDLESS BLUE', position: 'center', side: 'left', copy: 'Clouds and clear air make every day a different study.' },
  { title: 'LIGHT, BEFORE IT LEAVES', position: 'right', side: 'right', copy: 'Make time for the last warm minutes of daylight.' },
  { title: 'THE SUN BECOMES THE MOON', position: 'center', side: 'right', copy: 'Stay a little longer and watch the sky change.' },
  { title: 'WHEN THE SKY BECOMES INFINITE', position: 'top-left', side: 'left', copy: 'Keep a record of what you find above.' },
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

export function SkyJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const sky = sample(progress);
  const moonTransition = clamp01((progress - .78) / .10);
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
      stage.dataset.moment = frame.moment;
      setProgress(frame.progress);
    };

    const driver = { value: 0 };
    renderProgress(0);
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
    <div className="journey__stage" ref={stageRef}>
      <div className="journey__sky" aria-hidden="true" />
      <div className="journey__horizon" aria-hidden="true" />
      {cloudDepths.map((depth) => <div key={depth} className={`journey__cloud-layer journey__cloud-layer--${depth}`} aria-hidden="true">
        {cloudPlacements.filter((cloud) => cloud.depth === depth).map((cloud) => <figure key={cloud.id} className={`journey__cloud${cloud.mobileHidden ? ' journey__cloud--mobile-hidden' : ''}`} style={{
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
      <NightSky progress={progress} opacity={nightOpacity} auroraOpacity={auroraOpacity} />
      <BirdFlock progress={progress} />
      {beats.map((beat, index) => {
        const visibility = beatVisibility(progress, index);
        const hidden = visibility.opacity < .02;
        return <article key={beat.title} className={`journey__scene journey__scene--${beat.position}${index === 2 ? ' journey__scene--behind' : ''}`} style={beatStyle(progress, index)} aria-hidden={hidden} inert={hidden}>
          <p className="journey__eyebrow">AERIS <span>·</span> {String(index + 1).padStart(2, '0')} / 06</p>
          <h1 data-title={beat.title}>{beat.title}</h1>
        </article>;
      })}
      <div className="journey__orb" aria-hidden="true" style={{ '--orb-x': `${sky.sun.x}%`, '--orb-y': `${sky.sun.y}%`, transform: `translate(-50%, -50%) scale(${sky.sun.size})` } as CSSProperties}>
        <div className="journey__sun" style={{ opacity: sky.sun.opacity * (1 - moonTransition), '--orb-color': rgb(sky.sun.color) } as CSSProperties} />
        <div className="journey__moon" style={{ opacity: moonTransition }} />
      </div>
      <GroundScene progress={progress} />
      <div className="journey__overlap-front" aria-hidden="true" style={{ ...beatStyle(progress, 2), '--orb-x': `${sky.sun.x}%`, '--orb-y': `${sky.sun.y}%` } as CSSProperties}>
        <h1>{beats[2].title}</h1>
      </div>
      {beats.map((beat, index) => {
        const visibility = beatVisibility(progress, index);
        const hidden = visibility.opacity < .02;
        return <aside key={beat.title} className={`journey__copy journey__copy--${beat.side} journey__copy--beat-${index + 1}`} style={beatStyle(progress, index)} aria-hidden={hidden} inert={hidden}>
          <p>{beat.copy}</p>
          <a href="#collection" className="journey__button">Explore the gallery <span aria-hidden="true">↗</span></a>
        </aside>;
      })}
      <output className="journey__moment" aria-label="Current sky moment" aria-live="off">{sky.moment}</output>
      {import.meta.env.DEV && <div className="journey__debug">
        <label htmlFor="journey-progress">Scrub sky</label>
        <input id="journey-progress" type="range" min="0" max="1000" step="1" value={Math.round(progress * 1000)} onChange={(event) => scrubTo(Number(event.currentTarget.value) / 1000)} />
        <output htmlFor="journey-progress">{sky.moment} · {progress.toFixed(2)}</output>
      </div>}
    </div>
  </section>;
}
