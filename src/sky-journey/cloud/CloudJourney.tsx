import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { journeyContent } from '../../content/journey';
import { loadCloudRig, type CloudRig, type CloudRigPath } from './cloudRig';
import './cloudJourney.css';

type JourneyLoad = { status: 'loading' } | { status: 'ready'; rig: CloudRig } | { status: 'error'; message: string };
type Point = { x: number; y: number };

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const skyTints = [
  ['#03060f', '#0a1030'], ['#071a3a', '#16306a'], ['#08272b', '#0f4a45'],
  ['#1a1040', '#3b2370'], ['#2a1740', '#7a3d6a'],
] as const;

function colorAt(progress: number, channel: 0 | 1) {
  const scaled = clamp01(progress) * 4;
  const index = Math.min(3, Math.floor(scaled));
  const mix = scaled - index;
  const from = skyTints[index]![channel];
  const to = skyTints[index + 1]![channel];
  const value = (offset: number) => {
    const a = Number.parseInt(from.slice(offset, offset + 2), 16);
    const b = Number.parseInt(to.slice(offset, offset + 2), 16);
    return Math.round(a + (b - a) * mix).toString(16).padStart(2, '0');
  };
  return `#${value(1)}${value(3)}${value(5)}`;
}

export function CloudJourney() {
  const [load, setLoad] = useState<JourneyLoad>({ status: 'loading' });
  const [progress, setProgress] = useState(.203);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [points, setPoints] = useState<Point[]>([]);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let active = true;
    void loadCloudRig()
      .then((rig) => { if (active) setLoad({ status: 'ready', rig }); })
      .catch((error: unknown) => { if (active) setLoad({ status: 'error', message: error instanceof Error ? error.message : String(error) }); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMobile(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const rig = load.status === 'ready' ? load.rig : undefined;
  const path: CloudRigPath | undefined = rig?.paths[mobile ? 'mobile' : 'desktop'];
  useLayoutEffect(() => {
    const element = pathRef.current;
    if (!path || !element) return;
    const length = element.getTotalLength();
    setPoints(path.checkpointFractions.map((fraction) => {
      const point = element.getPointAtLength(length * fraction);
      return { x: point.x, y: point.y };
    }));
  }, [path]);

  const selectedIndex = path?.checkpointFractions.reduce((closest, fraction, index, all) =>
    Math.abs(fraction - progress) < Math.abs(all[closest]! - progress) ? index : closest, 0) ?? 0;
  const cp = rig?.checkpoints[selectedIndex];
  const group = cp ? journeyContent[cp.content] : undefined;
  const point = points[selectedIndex];
  const selectedFraction = path?.checkpointFractions[selectedIndex] ?? 0;
  const stageStyle = {
    '--cloud-journey-sky-top': colorAt(selectedFraction, 0),
    '--cloud-journey-sky-bottom': colorAt(selectedFraction, 1),
  } as CSSProperties;

  if (load.status === 'loading') return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="status">Preparing the cloud journey…</p></section>;
  if (load.status === 'error') return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="alert">Cloud journey could not load: {load.message}</p></section>;
  if (!path || !point || !cp || !group) return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="status">Preparing the cloud path…</p></section>;

  const cloudStyle = {
    left: `${point.x / path.viewBox[0] * 100}%`,
    top: `${point.y / path.viewBox[1] * 100}%`,
  } as CSSProperties;
  const cardOnRight = selectedIndex % 2 === 0;

  return <section className={`cloud-journey${mobile ? ' cloud-journey--mobile' : ''}`} id="cloud-journey" aria-label="A cloud journey through the sky">
    <div className="cloud-journey__stage" style={stageStyle}>
      <div className="cloud-journey__glow" aria-hidden="true" />
      <svg className="cloud-journey__path-art" viewBox={`0 0 ${path.viewBox[0]} ${path.viewBox[1]}`} preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} className="cloud-journey__path" d={path.d} />
      </svg>
      <img className="cloud-journey__cloud" src={`/3d/cloud-character/cloud_${cp.shape}.svg`} alt="" aria-hidden="true" style={cloudStyle} />
      <article className={`cloud-journey__card${cardOnRight ? ' cloud-journey__card--right' : ' cloud-journey__card--left'}`}>
        <p className="cloud-journey__eyebrow">AERIS · {String(selectedIndex + 1).padStart(2, '0')} / 04</p>
        <h2>{group.heading}</h2>
        <p>{group.intro}</p>
      </article>
      <nav className="cloud-journey__dots" aria-label="Cloud journey checkpoints">
        {rig.checkpoints.map((checkpoint, index) => <button key={checkpoint.id} type="button" className={index === selectedIndex ? 'is-active' : ''} aria-label={`Show ${journeyContent[checkpoint.content].heading}`} aria-current={index === selectedIndex ? 'step' : undefined} onClick={() => setProgress(path.checkpointFractions[index])} />)}
      </nav>
      {import.meta.env.DEV && <div className="cloud-journey__debug">
        <label htmlFor="cloud-journey-progress">Preview checkpoint</label>
        <input id="cloud-journey-progress" type="range" min="0" max="1" step="0.001" value={progress} onChange={(event) => setProgress(Number(event.currentTarget.value))} />
        <output htmlFor="cloud-journey-progress">{journeyContent[cp.content].heading} · {selectedFraction.toFixed(3)}</output>
      </div>}
    </div>
  </section>;
}
