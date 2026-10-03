import type { CSSProperties } from 'react';
import type { RGB } from '../sky/timeline';
import groundSvg from './scene-assets/ground.svg?raw';
import flowerSvg from './scene-assets/flowers.svg?raw';
import benchSvg from './scene-assets/bench.svg?raw';
import peopleSvg from './scene-assets/people.svg?raw';

type PaletteStop = { at: number; back: RGB; middle: RGB; front: RGB; haze: RGB; hill: RGB; blade: RGB; bench: RGB; benchDark: RGB; people: RGB };

const stops: readonly PaletteStop[] = [
  { at: 0, back: [154, 179, 106], middle: [108, 145, 70], front: [77, 122, 56], haze: [244, 181, 138], hill: [127, 167, 181], blade: [47, 100, 40], bench: [122, 79, 48], benchDark: [62, 40, 20], people: [26, 20, 32] },
  { at: .3, back: [140, 192, 99], middle: [106, 160, 74], front: [63, 122, 51], haze: [159, 194, 232], hill: [127, 167, 181], blade: [47, 100, 40], bench: [107, 69, 40], benchDark: [62, 40, 20], people: [10, 13, 26] },
  { at: .7, back: [138, 138, 74], middle: [92, 112, 51], front: [58, 90, 44], haze: [255, 154, 90], hill: [128, 115, 104], blade: [55, 74, 38], bench: [90, 51, 32], benchDark: [45, 27, 19], people: [18, 10, 20] },
  { at: 1, back: [22, 48, 47], middle: [16, 37, 37], front: [12, 28, 32], haze: [26, 33, 80], hill: [15, 24, 48], blade: [13, 27, 29], bench: [29, 26, 36], benchDark: [13, 12, 20], people: [4, 6, 12] },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const asHex = (color: RGB) => `#${color.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;

function paletteAt(progress: number) {
  const p = clamp01(progress);
  const found = stops.findIndex((_, i) => i < stops.length - 1 && p <= stops[i + 1].at);
  const index = found < 0 ? stops.length - 2 : found;
  const start = stops[index];
  const end = stops[Math.min(stops.length - 1, index + 1)];
  const t = smoothstep(clamp01((p - start.at) / (end.at - start.at)));
  const mix = (a: RGB, b: RGB) => asHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
  return {
    '--haze': mix(start.haze, end.haze), '--hill': mix(start.hill, end.hill),
    '--grass-back': mix(start.back, end.back), '--grass-mid': mix(start.middle, end.middle), '--grass-front': mix(start.front, end.front),
    '--blade': mix(start.blade, end.blade), '--bench': mix(start.bench, end.bench), '--bench-dark': mix(start.benchDark, end.benchDark), '--people': mix(start.people, end.people),
  } as CSSProperties;
}

function seedRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const random = seedRandom(2406);
const flowers = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  x: 2 + random() * 96,
  bottom: 5 + random() * 19,
  size: 18 + random() * 24,
  symbol: ['daisy', 'tulip', 'bell'][Math.floor(random() * 3)],
  delay: random() * -8,
  mobileHidden: index >= 13,
}));

export function GroundScene({ progress }: { progress: number }) {
  const bloom = smoothstep(clamp01((progress - .02) / .16));
  const flowerNightFade = 1 - smoothstep(clamp01((progress - .74) / .14));
  const benchProgress = smoothstep(clamp01((progress - .62) / .10));
  const peopleProgress = smoothstep(clamp01((progress - .82) / .08));
  const style = paletteAt(progress);

  return <div className="journey__ground-scene" style={style} aria-hidden="true">
    <div className="journey__ground-art" dangerouslySetInnerHTML={{ __html: groundSvg }} />
    <div className="journey__flower-sprite" dangerouslySetInnerHTML={{ __html: flowerSvg }} />
    <div className="journey__flowers">
      {flowers.map((flower) => <span key={flower.id} className={`journey__flower${flower.mobileHidden ? ' journey__flower--mobile-hidden' : ''}`} style={{
        left: `${flower.x}%`, bottom: `${flower.bottom}%`, width: `${flower.size}px`, height: `${flower.size * 1.5}px`,
        opacity: bloom * flowerNightFade, transform: `scaleY(${bloom})`,
      }}>
        <svg viewBox="0 0 40 60" focusable="false" style={{ animationDelay: `${flower.delay}s` }}><use href={`#${flower.symbol}`} /></svg>
      </span>)}
    </div>
    <div className="journey__bench-scene" style={{ opacity: benchProgress, transform: `translateY(${(1 - benchProgress) * 12}px)` }}>
      <div className="journey__bench-art" dangerouslySetInnerHTML={{ __html: benchSvg }} />
      <div className="journey__people-art" style={{ opacity: peopleProgress }} dangerouslySetInnerHTML={{ __html: peopleSvg }} />
    </div>
  </div>;
}
