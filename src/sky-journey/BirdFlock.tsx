import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

type Bird = { x: number; y: number; scale: number; far?: boolean };
const flock: Bird[] = [
  { x: 0, y: 0, scale: 1 }, { x: -1.2, y: .5, scale: .9 }, { x: -1.2, y: -.5, scale: .9 },
  { x: -2.4, y: 1, scale: .8 }, { x: -2.4, y: -1, scale: .8 }, { x: -3.6, y: 1.5, scale: .7 }, { x: -3.6, y: -1.5, scale: .7 },
  { x: 1.4, y: 1.2, scale: .5, far: true }, { x: 2.2, y: 1.5, scale: .45, far: true }, { x: 3, y: 1.8, scale: .4, far: true },
];
const frames = ['bird-up', 'bird-mid', 'bird-down', 'bird-mid'];
const frameOffsets = [0, 2, 1, 3, 2, 0, 3, 1, 2, 0];
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

export function BirdFlock({ progress }: { progress: number }) {
  const active = progress < .26;
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);


  const fadeIn = smoothstep(clamp01(progress / .04));
  const fadeOut = 1 - smoothstep(clamp01((progress - .20) / .06));
  const opacity = reducedMotion ? Number(progress <= .20) : fadeIn * fadeOut;
  const travel = reducedMotion ? .12 : clamp01(progress / .26);
  const x = -10 + 120 * travel;
  const y = 36 - 22 * travel + (reducedMotion ? 0 : Math.sin(travel * Math.PI * 2) * 1.4);
  const leadSize = 'clamp(28px, 3vw, 52px)';
  const leadPixels = Math.max(28, Math.min(52, window.innerWidth * .03));

  return <div className="journey__plane journey__plane--birds journey__birds" data-layer="birds" aria-hidden="true" style={{ opacity: active ? opacity : 0, '--bird': '#2a2438' } as CSSProperties}>
    {flock.map((bird, index) => {
      const birdTravel = bird.far ? travel * .7 : travel;
      const left = reducedMotion ? 20 : x + 120 * (bird.far ? birdTravel - travel : 0);
      const top = reducedMotion ? 36 : y;
      const frame = reducedMotion ? 'bird-mid' : frames[frameOffsets[index]! % frames.length];
      const size = `calc(${leadSize} * ${bird.scale})`;
      const style = { left: `calc(${left}% + ${bird.x * leadPixels}px)`, top: `calc(${top}% + ${bird.y * leadPixels}px)`, width: size } as CSSProperties;
      return <svg key={index} className="journey__bird" viewBox="0 0 44 24" style={style} focusable="false">
        <use href={`/3d/scene/birds.svg#${frame}`} />
      </svg>;
    })}
  </div>;
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}
