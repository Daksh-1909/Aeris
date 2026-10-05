import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { scrollToPosition } from '../../animations/scroll';
import { journeyContent } from '../../content/journey';
import { photographs, imageUrl } from '../../data/gallery';
import { handleSkyImageFallback } from '../../components/imageFallback';
import { EditorialReveal } from '../../components/EditorialReveal';
import { loadCloudRig, type CloudRig, type CloudRigPath } from './cloudRig';
import './cloudJourney.css';

type JourneyLoad = { status: 'loading' } | { status: 'ready'; rig: CloudRig } | { status: 'error'; message: string };
type ActiveState = { j: number; f: number; point: { x: number; y: number }; activeCheckpoint: number | null; displayCheckpoint: number; segment: number; segmentProgress: number; animationTime: number };
type PathMetrics = { element: SVGPathElement; length: number };
type ShapeGeometry = { circles: number[][]; base: number[]; face: Record<string, number> };
type FaceExpression = { eyeScaleY: number; eyeRK: number; mouthCurve: number; mouthWidthK: number; stroke: number; lookX: number };
type TrailPoint = { time: number; fraction: number };
type JourneyContentKey = keyof Pick<typeof journeyContent, 'sky' | 'nature' | 'numbers' | 'contact'>;

const HOLD = .035;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;
const skyTopColors = ['#03060f', '#071a3a', '#08272b', '#1a1040', '#2a1740', '#2a1740'];
const skyBottomColors = ['#0a1030', '#16306a', '#0f4a45', '#3b2370', '#7a3d6a', '#7a3d6a'];
const cloudTopColors = ['#dfe6f5', '#f2f6ff', '#eafff6', '#f6eeff', '#fff0f0', '#fff0f0'];
const cloudBottomColors = ['#9fb0d6', '#b8c8ec', '#a9d8c8', '#c7b3ee', '#e2b4c4', '#e2b4c4'];

function mixHex(from: string, to: string, amount: number) {
  const channel = (color: string, offset: number) => Number.parseInt(color.slice(offset, offset + 2), 16);
  return `#${[1, 3, 5].map((offset) => Math.round(lerp(channel(from, offset), channel(to, offset), amount)).toString(16).padStart(2, '0')).join('')}`;
}

function colorAtJourneyProgress(j: number, checkpointFractions: number[], colors: string[]) {
  const checkpointProgresses = checkpointFractions.map((_, index) => getPreviewScroll(checkpointFractions, index));
  const stops = [0, ...checkpointProgresses, 1];
  const segment = Math.max(0, stops.slice(1).findIndex((end) => j <= end));
  const amount = clamp01((j - stops[segment]!) / (stops[segment + 1]! - stops[segment]!));
  return mixHex(colors[segment]!, colors[segment + 1]!, amount);
}

function tintWeights(j: number, checkpointFractions: number[]) {
  const stops = [0, ...checkpointFractions.map((_, index) => getPreviewScroll(checkpointFractions, index))];
  const progress = clamp01(j);
  const foundSegment = stops.slice(1).findIndex((end) => progress <= end);
  const segment = foundSegment < 0 ? stops.length - 1 : foundSegment;
  const from = stops[segment]!;
  const to = stops[segment + 1];
  const amount = to === undefined ? 1 : clamp01((progress - from) / (to - from));
  return Array.from({ length: 5 }, (_, index) => index === segment ? 1 - amount : index === segment + 1 ? amount : 0);
}

function easeInOutCubic(value: number) {
  const t = clamp01(value);
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function shapeAt(rig: CloudRig, fromIndex: number, toIndex: number, progress: number): ShapeGeometry {
  const names = ['cumulus', 'stratus', 'tower', 'comet'] as const;
  const from = rig.shapes[names[fromIndex]!];
  const to = rig.shapes[names[toIndex]!];
  const amount = easeInOutCubic((progress - .25) / .6);
  const mix = (a: number[], b: number[]) => a.map((value, index) => lerp(value, b[index]!, amount));
  const face: Record<string, number> = {};
  for (const key of Object.keys(from.face)) face[key] = lerp(from.face[key]!, to.face[key]!, amount);
  return { circles: from.circles.map((circle, index) => mix(circle, to.circles[index]!)), base: mix(from.base, to.base), face };
}

function expressionAt(rig: CloudRig, fromIndex: number, toIndex: number, progress: number, activity: 'calm' | 'happy' | 'laugh' | 'sleep' | 'awake'): FaceExpression {
  const to = rig.expressions[rig.checkpoints[toIndex]!.expression];
  const amount = easeInOutCubic((progress - .88) / .12);
  const active = rig.expressions[activity];
  const value = (a: number | undefined, b: number | undefined, fallback: number) => lerp(a ?? fallback, b ?? fallback, amount);
  const fromLook = fromIndex % 2 === 0 ? 2 : -2;
  const toLook = toIndex % 2 === 0 ? 2 : -2;
  return {
    eyeScaleY: value(active.eyeScaleY, to.eyeScaleY, 1),
    eyeRK: value(active.eyeRK, to.eyeRK, 1),
    mouthCurve: value(active.mouthCurve, to.mouthCurve, 14),
    mouthWidthK: value(active.mouthWidthK, to.mouthWidthK, 1),
    stroke: value(active.stroke, to.stroke, 4.5),
    lookX: lerp(fromLook, toLook, amount),
  };
}

function remap(j: number, cps: number[]): number {
  const stops = [0, ...cps, 1];
  let units = clamp01(j) * (1 + HOLD * cps.length);
  for (let index = 1; index < stops.length; index += 1) {
    const travel = stops[index]! - stops[index - 1]!;
    if (units <= travel) return stops[index - 1]! + units;
    units -= travel;
    if (index <= cps.length) {
      if (units <= HOLD) return stops[index]!;
      units -= HOLD;
    }
  }
  return 1;
}

function getActiveCheckpoint(f: number, cps: number[], previous: number | null) {
  if (previous !== null && Math.abs(f - cps[previous]!) <= .022) return previous;
  const next = cps.findIndex((fraction) => Math.abs(fraction - f) <= .012);
  return next < 0 ? null : next;
}

function getSegment(f: number, cps: number[]) {
  const stops = [0, ...cps, 1];
  const segment = Math.max(0, stops.slice(1).findIndex((end) => f <= end));
  const from = stops[segment]!;
  const to = stops[segment + 1]!;
  return { segment, segmentProgress: clamp01((f - from) / (to - from)) };
}

function getPreviewScroll(cps: number[], index: number) {
  const parkedPathFraction = cps[index]! + (index + .5) * HOLD;
  return clamp01(parkedPathFraction / (1 + HOLD * cps.length));
}

function ReducedMotionJourney({ rig }: { rig: CloudRig }) {
  return <section className="cloud-journey cloud-journey--reduced" id="cloud-journey" aria-label="Cloud journey checkpoints">
    {rig.checkpoints.map((checkpoint, index) => {
      const contentKey = checkpoint.content as JourneyContentKey;
      const group = journeyContent[contentKey];
      const photos = group.featuredPhotos.flatMap((item) => {
        const photo = photographs.find((entry) => entry.id === item.id);
        return photo ? [photo] : [];
      }).slice(0, 3);
      const facts = contentKey === 'numbers' ? group.legacySections[0]?.numbers ?? [] : [];
      const copy = group.legacySections[0]?.text.filter((text) => text !== group.intro) ?? [];
      const originalLinks = group.legacySections.flatMap((section) => section.links).filter((link) => link.href.startsWith('/') || link.href.startsWith('mailto:'));
      const extraLinks = journeyContent.extraLinks.filter((link) => contentKey === 'sky' ? link.source === 'Cloud studies'
        : contentKey === 'numbers' ? link.source === 'Gallery'
          : contentKey === 'contact' && ['Golden hour section', 'Closing experience', 'Daily Sky section'].includes(link.source));
      const links = [...originalLinks, ...extraLinks].filter((link, linkIndex, all) => all.findIndex((candidate) => candidate.href === link.href) === linkIndex);
      return <article className="cloud-journey__static-block" key={checkpoint.id}>
        <img className="cloud-journey__static-cloud" src={`/3d/cloud-character/cloud_${checkpoint.shape}.svg`} alt="" aria-hidden="true" />
        <div className="cloud-journey__static-card">
          <p className="cloud-journey__eyebrow">AERIS · {String(index + 1).padStart(2, '0')} / 04</p>
          <h2>{group.heading}</h2>
          <p>{group.intro}</p>
          {copy.map((text) => <p className="cloud-journey__copy" key={text}>{text}</p>)}
          {photos.length > 0 && <div className="cloud-journey__photos">{photos.map((photo) => <EditorialReveal key={photo.id}><a className="cloud-journey__photo" href={`/photo/${photo.id}`} style={{ '--photo-tone': photo.tone } as CSSProperties}>
            <img src={imageUrl(photo.image, 480)} alt={photo.description ?? photo.title} width="1600" height="1200" loading="lazy" onError={handleSkyImageFallback} />
            <span>{photo.title}</span><small>{photo.location} · {photo.year}</small><small>{photo.metadata} · {photo.cloudType}</small><small>{photo.credit}</small>
          </a></EditorialReveal>)}</div>}
          {facts.length > 0 && <dl className="cloud-journey__facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
          {links.length > 0 && <ul className="cloud-journey__links">{links.map((link) => <li key={link.href}><a href={link.href.startsWith('#') ? '#cloud-journey' : link.href}>{link.label}<span aria-hidden="true"> ↗</span></a></li>)}</ul>}
        </div>
      </article>;
    })}
  </section>;
}

export function CloudJourney() {
  const [load, setLoad] = useState<JourneyLoad>({ status: 'loading' });
  const [state, setState] = useState<ActiveState>({ j: 0, f: 0, point: { x: 0, y: 0 }, activeCheckpoint: null, displayCheckpoint: 0, segment: 0, segmentProgress: 0, animationTime: 0 });
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cloudRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const mistRefs = useRef<Array<SVGCircleElement | null>>([]);
  const historyRef = useRef<TrailPoint[]>([]);
  const metricsRef = useRef<PathMetrics | null>(null);
  const activeCheckpointRef = useRef<number | null>(null);
  const displayCheckpointRef = useRef(0);
  const inViewRef = useRef(false);

  useEffect(() => {
    if (state.activeCheckpoint !== state.displayCheckpoint && cardRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement).blur();
    }
  }, [state.activeCheckpoint, state.displayCheckpoint]);

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

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const rig = load.status === 'ready' ? load.rig : undefined;
  const path: CloudRigPath | undefined = rig?.paths[mobile ? 'mobile' : 'desktop'];

  useLayoutEffect(() => {
    const element = pathRef.current;
    if (!path || !element) return;
    metricsRef.current = { element, length: element.getTotalLength() };
    return () => { metricsRef.current = null; };
  }, [path, reducedMotion]);

  useEffect(() => {
    if (!path || reducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;
    let frame: number | null = null;
    const tick = () => {
      frame = null;
      if (!inViewRef.current) return;
      const metrics = metricsRef.current;
      const cloud = cloudRef.current;
      const stage = stageRef.current;
      if (metrics && cloud && stage) {
        const bounds = section.getBoundingClientRect();
        const travelDistance = Math.max(1, bounds.height - window.innerHeight);
        const j = clamp01(-bounds.top / travelDistance);
        const f = remap(j, path.checkpointFractions);
        const activeCheckpoint = getActiveCheckpoint(f, path.checkpointFractions, activeCheckpointRef.current);
        activeCheckpointRef.current = activeCheckpoint;
        if (activeCheckpoint !== null) displayCheckpointRef.current = activeCheckpoint;
        const displayCheckpoint = displayCheckpointRef.current;
        const { segment, segmentProgress } = getSegment(f, path.checkpointFractions);
        const point = metrics.element.getPointAtLength(metrics.length * f);
        cloud.style.setProperty('--cloud-x', `${point.x / path.viewBox[0] * stage.clientWidth}px`);
        cloud.style.setProperty('--cloud-y', `${point.y / path.viewBox[1] * stage.clientHeight}px`);
        const now = performance.now();
        historyRef.current.push({ time: now, fraction: f });
        historyRef.current = historyRef.current.filter((entry) => now - entry.time <= 1000);
        if (!mobile) {
          mistRefs.current.forEach((circle, index) => {
            if (!circle) return;
            const targetTime = now - (80 + index * (820 / 11));
            const sample = [...historyRef.current].reverse().find((entry) => entry.time <= targetTime);
            if (!sample) { circle.setAttribute('opacity', '0'); return; }
            const trailPoint = metrics.element.getPointAtLength(metrics.length * sample.fraction);
            circle.setAttribute('cx', String(trailPoint.x));
            circle.setAttribute('cy', String(trailPoint.y));
            circle.setAttribute('opacity', String((1 - index / 12) * .22));
          });
        }
        const animationTime = segment === 2 || segment === 3 ? performance.now() / 1000 : 0;
        setState((previous) => Math.abs(previous.j - j) < .0005 && Math.abs(previous.f - f) < .0005 && Math.abs(previous.point.x - point.x) < .2 && Math.abs(previous.point.y - point.y) < .2 && previous.activeCheckpoint === activeCheckpoint && previous.displayCheckpoint === displayCheckpoint && previous.segment === segment && Math.abs(previous.segmentProgress - segmentProgress) < .002 && (segment !== 2 && segment !== 3 || Math.abs(previous.animationTime - animationTime) < .01)
          ? previous
          : { j, f, point: { x: point.x, y: point.y }, activeCheckpoint, displayCheckpoint, segment, segmentProgress, animationTime });
      }
      if (inViewRef.current) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inViewRef.current = Boolean(entry?.isIntersecting);
      if (inViewRef.current && frame === null) frame = requestAnimationFrame(tick);
      else if (!inViewRef.current && frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
      inViewRef.current = false;
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [mobile, path, reducedMotion]);

  if (load.status === 'loading') return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="status">Preparing the cloud journey…</p></section>;
  if (load.status === 'error') return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="alert">Cloud journey could not load: {load.message}</p></section>;
  if (!path || !rig) return <section className="cloud-journey cloud-journey--status" id="cloud-journey" aria-label="Cloud journey"><p role="status">Preparing the cloud path…</p></section>;
  if (reducedMotion) return <ReducedMotionJourney rig={rig} />;

  const cpFractions = path.checkpointFractions;
  const fromIndex = Math.max(0, Math.min(3, state.segment - 1));
  const toIndex = Math.max(0, Math.min(3, state.segment));
  const geometry = shapeAt(rig, fromIndex, toIndex, state.segmentProgress);
  const face = geometry.face;
  const activityName = (['calm', 'happy', 'laugh', 'sleep', 'awake'] as const)[state.segment]!;
  const expression = expressionAt(rig, fromIndex, toIndex, state.segmentProgress, activityName);
  const blinkAt = state.segment === 0 ? [.25, .6] : state.segment === 3 ? [.9] : state.segment === 4 ? [.3] : [];
  let blinkStrength = 0;
  for (const start of blinkAt) {
    const phase = (state.segmentProgress - start) / .035;
    if (phase >= 0 && phase <= 1) blinkStrength = Math.max(blinkStrength, Math.sin(Math.PI * phase));
  }
  const eyeScaleY = lerp(expression.eyeScaleY, .08, blinkStrength);
  const eyeRadius = face.eyeR * expression.eyeRK;
  const mouthHalfWidth = face.mouthW * expression.mouthWidthK;
  const bounceY = state.segment === 1 ? Math.sin(state.segmentProgress * Math.PI * 6) * 10 : 0;
  const laughRotation = state.segment === 2 ? Math.sin(state.animationTime * 18) * 1.5 : 0;
  const activityScale = state.segment === 2 ? 1.01 + .01 * Math.sin(state.animationTime * 18)
    : state.segment === 3 ? 1 + .015 + .015 * Math.sin(state.animationTime * 2 * Math.PI / 3)
      : 1;
  const blushOpacity = state.segment === 1 ? clamp01(state.segmentProgress / .2) * (1 - clamp01((state.segmentProgress - .88) / .12)) : 0;
  const tearPositions = [face.cx - face.eyeDx, face.cx + face.eyeDx].map((x, index) => {
    const phase = ((state.animationTime + index * .35) % .7) / .7;
    return { x: x - 6, y: face.cy + face.eyeY + eyeRadius + phase * 28, opacity: 1 - phase };
  });
  const zPositions = [0, 1, 2].map((index) => {
    const phase = ((state.animationTime - index * .5) % 2 + 2) % 2;
    return { x: face.cx + 54 + index * 18, y: face.cy - 64 - phase / 1.6 * 22, opacity: phase < 1.6 ? Math.min(phase / .2, (1.6 - phase) / .3, 1) * (1 - clamp01((state.segmentProgress - .88) / .12)) : 0 };
  });
  const activeIndex = state.activeCheckpoint;
  const displayCp = rig.checkpoints[state.displayCheckpoint]!;
  const displayGroup = journeyContent[displayCp.content];
  const activePoint = path.points[state.displayCheckpoint + 1];
  const cardOnRight = state.displayCheckpoint % 2 === 0;
  const cardBelowCloud = activePoint ? activePoint[1] / path.viewBox[1] < .55 : false;
  const skyTop = colorAtJourneyProgress(state.j, cpFractions, skyTopColors);
  const cloudTop = colorAtJourneyProgress(state.j, cpFractions, cloudTopColors);
  const cloudBottom = colorAtJourneyProgress(state.j, cpFractions, cloudBottomColors);
  const tintOpacity = tintWeights(state.j, cpFractions);
  const tintStyle = skyTopColors.slice(0, 5).map((top, index) => ({
    '--journey-tint-top': top,
    '--journey-tint-bottom': skyBottomColors[index],
    opacity: tintOpacity[index],
  }) as CSSProperties);
  const stageStyle = { '--cloud-journey-glow': skyTop } as CSSProperties;
  const cameraX = Math.max(-24, Math.min(24, (.5 - state.point.x / path.viewBox[0]) * 48));
  const cameraStyle = { transform: `translate3d(${cameraX}px, 0, 0)`, '--cloud-journey-star-drift': `${-cameraX / 2}px` } as CSSProperties;
  const photoSource = displayCp.content === 'sky' ? displayGroup.legacySections[1]?.images.slice(0, 3)
    : displayCp.content === 'contact' ? displayGroup.legacySections[0]?.images
      : displayGroup.featuredPhotos.map((photo) => ({ id: photo.id, alt: photo.description, caption: photo.title }));
  const cardPhotos = displayCp.content === 'numbers' ? [] : (photoSource ?? []).flatMap((item) => {
    const photo = photographs.find((entry) => entry.id === item.id || entry.image === item.id);
    return photo ? [{ photo, alt: item.alt }] : [];
  }).slice(0, 3);
  const checkpointExtraSources: Record<string, string[]> = {
    sky: ['Cloud studies'], nature: [], numbers: ['Gallery'], contact: ['Golden hour section', 'Closing experience', 'Daily Sky section'],
  };
  const originalLinks = displayGroup.legacySections.flatMap((section) => section.links).filter((link) => link.href.startsWith('/') || link.href.startsWith('mailto:'));
  const extraLinks = journeyContent.extraLinks.filter((link) => checkpointExtraSources[displayCp.content]?.includes(link.source));
  const cardLinks = [...originalLinks, ...extraLinks].filter((link, index, all) => all.findIndex((candidate) => candidate.href === link.href) === index);
  const facts = displayCp.content === 'numbers' ? displayGroup.legacySections[0]?.numbers ?? [] : [];
  const checkpointCopy = displayGroup.legacySections[0]?.text.filter((text) => text !== displayGroup.intro) ?? [];
  const isCardActive = activeIndex === state.displayCheckpoint;
  const scrollToJourneyProgress = (j: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const bounds = section.getBoundingClientRect();
    const distance = Math.max(1, bounds.height - window.innerHeight);
    scrollToPosition(window.scrollY + bounds.top + distance * clamp01(j), true);
  };

  return <section ref={sectionRef} className={`cloud-journey${mobile ? ' cloud-journey--mobile' : ''}`} id="cloud-journey" aria-label="A cloud journey through the sky">
    <div ref={stageRef} className="cloud-journey__stage" style={stageStyle}>
      <div className="cloud-journey__tints" aria-hidden="true">{tintStyle.map((style, index) => <div className="cloud-journey__tint" style={style} key={index} />)}</div>
      <div className="cloud-journey__camera" style={cameraStyle}>
      <div className="cloud-journey__stars" aria-hidden="true" />
      <div className="cloud-journey__glow" aria-hidden="true" />
      <svg className="cloud-journey__path-art" viewBox={`0 0 ${path.viewBox[0]} ${path.viewBox[1]}`} preserveAspectRatio="none" aria-hidden="true">
        <path ref={pathRef} className="cloud-journey__path" d={path.d} />
      </svg>
      <svg className="cloud-journey__mist" viewBox={`0 0 ${path.viewBox[0]} ${path.viewBox[1]}`} preserveAspectRatio="none" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => <circle key={index} ref={(node) => { mistRefs.current[index] = node; }} r={11 + index * .7} />)}
      </svg>
      <svg ref={cloudRef} className="cloud-journey__cloud" viewBox="0 0 400 260" aria-hidden="true" style={{ left: 0, top: 0, '--cloud-bounce': `${bounceY}px`, '--cloud-rotation': `${laughRotation}deg`, '--cloud-scale': activityScale } as CSSProperties}>
        <defs>
          <linearGradient id="cloud-journey-body" gradientUnits="userSpaceOnUse" x1="0" y1="20" x2="0" y2="215">
            <stop offset="0" stopColor={cloudTop} /><stop offset="1" stopColor={cloudBottom} />
          </linearGradient>
          <clipPath id="cloud-journey-clip">
            {geometry.circles.map(([cx, cy, r], index) => <circle key={index} cx={cx} cy={cy} r={r} />)}
            <rect x={geometry.base[0]} y={geometry.base[1]} width={geometry.base[2]} height={geometry.base[3]} rx={geometry.base[4]} />
          </clipPath>
        </defs>
        <ellipse cx="200" cy="236" rx="120" ry="8" fill="#000" opacity=".12" />
        <g fill="url(#cloud-journey-body)">
          {geometry.circles.map(([cx, cy, r], index) => <circle key={index} cx={cx} cy={cy} r={r} />)}
          <rect x={geometry.base[0]} y={geometry.base[1]} width={geometry.base[2]} height={geometry.base[3]} rx={geometry.base[4]} />
        </g>
        <ellipse clipPath="url(#cloud-journey-clip)" cx="200" cy="232" rx="220" ry="46" fill="#9fb0d6" opacity=".28" />
        <g fill="#2b3350" transform={`translate(${expression.lookX} 0)`}>
          <ellipse cx={face.cx - face.eyeDx} cy={face.cy + face.eyeY} rx={eyeRadius} ry={eyeRadius * eyeScaleY} />
          <ellipse cx={face.cx + face.eyeDx} cy={face.cy + face.eyeY} rx={eyeRadius} ry={eyeRadius * eyeScaleY} />
        </g>
        <path d={`M ${face.cx - mouthHalfWidth} ${face.cy + face.mouthY} Q ${face.cx} ${face.cy + face.mouthY + expression.mouthCurve} ${face.cx + mouthHalfWidth} ${face.cy + face.mouthY}`} fill="none" stroke="#2b3350" strokeWidth={expression.stroke} strokeLinecap="round" />
        {state.segment === 1 && <g aria-hidden="true" style={{ '--blush': '#ff9db1' } as CSSProperties}>
          <use href="/3d/cloud-character/cloud_face_parts.svg#blush" x={face.cx - face.eyeDx - 18} y={face.cy + face.eyeY + 10} width="24" height="12" opacity={blushOpacity} />
          <use href="/3d/cloud-character/cloud_face_parts.svg#blush" x={face.cx + face.eyeDx - 6} y={face.cy + face.eyeY + 10} width="24" height="12" opacity={blushOpacity} />
        </g>}
        {state.segment === 2 && <g aria-hidden="true" style={{ '--tear': '#6fc3ff' } as CSSProperties}>
          {tearPositions.map((tear, index) => <use key={index} href="/3d/cloud-character/cloud_face_parts.svg#tear" x={tear.x} y={tear.y} width="12" height="18" opacity={tear.opacity} />)}
        </g>}
        {state.segment === 3 && <g aria-hidden="true" style={{ '--zzz': '#ffffff' } as CSSProperties}>
          {zPositions.map((z, index) => <use key={index} href="/3d/cloud-character/cloud_face_parts.svg#z" x={z.x} y={z.y} width={12 + index * 4} height={14 + index * 4} opacity={z.opacity} />)}
        </g>}
      </svg>
      {state.segment === 3 && <span className="cloud-journey__shooting-star" aria-hidden="true" />}
      <article ref={cardRef} aria-hidden={!isCardActive} className={`cloud-journey__card${isCardActive ? ' is-visible' : ''}${cardOnRight ? ' cloud-journey__card--right' : ' cloud-journey__card--left'}${mobile && cardBelowCloud ? ' cloud-journey__card--below' : ''}`}>
        <p className="cloud-journey__eyebrow">AERIS · {String(state.displayCheckpoint + 1).padStart(2, '0')} / 04</p>
        <h2>{displayGroup.heading}</h2>
        <p>{displayGroup.intro}</p>
        {checkpointCopy.map((copy) => <p className="cloud-journey__copy" key={copy}>{copy}</p>)}
        {cardPhotos.length > 0 && <div className="cloud-journey__photos">
          {cardPhotos.map(({ photo, alt }) => <EditorialReveal key={photo.id}><a className="cloud-journey__photo" href={`/photo/${photo.id}`} style={{ '--photo-tone': photo.tone } as CSSProperties} tabIndex={isCardActive ? 0 : -1}>
            <img src={imageUrl(photo.image, 480)} alt={alt ?? photo.description ?? photo.title} width="1600" height="1200" loading="lazy" onError={handleSkyImageFallback} />
            <span>{photo.title}</span><small>{photo.location} · {photo.year}</small><small>{photo.metadata} · {photo.cloudType}</small><small>{photo.credit}</small>
          </a></EditorialReveal>)}
        </div>}
        {facts.length > 0 && <dl className="cloud-journey__facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
        {cardLinks.length > 0 && <ul className="cloud-journey__links">{cardLinks.map((link) => <li key={link.href}><a tabIndex={isCardActive ? 0 : -1} href={link.href.startsWith('#') ? '#cloud-journey' : link.href}>{link.label}<span aria-hidden="true"> ↗</span></a></li>)}</ul>}
      </article>
      <nav className="cloud-journey__dots" aria-label="Cloud journey checkpoints">
        {rig.checkpoints.map((checkpoint, index) => <button key={checkpoint.id} type="button" className={index === activeIndex ? 'is-active' : ''} aria-label={`Show ${journeyContent[checkpoint.content].heading}`} aria-current={index === activeIndex ? 'step' : undefined} onClick={() => scrollToJourneyProgress(getPreviewScroll(cpFractions, index))} />)}
      </nav>
      </div>
    </div>
  </section>;
}
