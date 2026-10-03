import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToPosition } from '../animations/scroll';
import { sample, type RGB } from '../sky/timeline';
import './journey.css';

gsap.registerPlugin(ScrollTrigger);

const rgb = (color: RGB) => `rgb(${color.map(Math.round).join(' ')})`;

export function SkyJourney() {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const sky = sample(progress);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    const renderProgress = (value: number) => {
      const frame = sample(value);
      stage.style.setProperty('--sky-top', rgb(frame.top));
      stage.style.setProperty('--sky-middle', rgb(frame.middle));
      stage.style.setProperty('--sky-horizon', rgb(frame.horizon));
      stage.style.setProperty('--journey-text', rgb(frame.text));
      stage.style.setProperty('--journey-progress', frame.progress.toFixed(4));
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
      <div className="journey__ground" aria-hidden="true" />
      <div className="journey__content">
        <article className="journey__scene" aria-live="off">
          <p className="journey__eyebrow">AERIS <span>·</span> FOLLOW THE LIGHT</p>
          <h1>READ THE SKY</h1>
        </article>
      </div>
      <aside className="journey__copy">
        <p>A journal of light, cloud and weather. Begin where the day begins.</p>
        <a href="#collection" className="journey__button">Explore the gallery <span aria-hidden="true">↗</span></a>
      </aside>
      <output className="journey__moment" aria-label="Current sky moment" aria-live="off">{sky.moment}</output>
      {import.meta.env.DEV && <div className="journey__debug">
        <label htmlFor="journey-progress">Scrub sky</label>
        <input id="journey-progress" type="range" min="0" max="1000" step="1" value={Math.round(progress * 1000)} onChange={(event) => scrubTo(Number(event.currentTarget.value) / 1000)} />
        <output htmlFor="journey-progress">{sky.moment} · {progress.toFixed(2)}</output>
      </div>}
    </div>
  </section>;
}
