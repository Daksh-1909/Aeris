export type RGB = readonly [number, number, number];

export type TimelineKeyframe = {
  at: number;
  moment: string;
  top: RGB;
  middle: RGB;
  horizon: RGB;
  text: RGB;
  stars: number;
  cloudBrightness: number;
};

export type SunKeyframe = { at: number; x: number; y: number; size: number; opacity: number; color: RGB };
export type SunSample = Omit<SunKeyframe, 'at'>;
export type TimelineSample = Omit<TimelineKeyframe, 'at'> & { progress: number; sun: SunSample };

/** Palette stops from AERIS_SKY_JOURNEY_V2.md. Rendering layers share this sample. */
export const skyKeyframes: readonly TimelineKeyframe[] = [
  { at: 0, moment: 'Sunrise', top: [11, 21, 48], middle: [30, 47, 77], horizon: [244, 167, 122], text: [255, 248, 233], stars: .25, cloudBrightness: .25 },
  { at: .30, moment: 'Noon', top: [47, 127, 224], middle: [105, 177, 236], horizon: [191, 227, 255], text: [11, 26, 36], stars: 0, cloudBrightness: 1 },
  { at: .70, moment: 'Sunset', top: [58, 42, 106], middle: [184, 83, 110], horizon: [255, 122, 61], text: [255, 248, 233], stars: 0, cloudBrightness: .72 },
  { at: .85, moment: 'Dusk', top: [10, 16, 48], middle: [24, 27, 74], horizon: [42, 34, 96], text: [234, 244, 247], stars: .55, cloudBrightness: .2 },
  { at: 1, moment: 'Midnight', top: [3, 6, 15], middle: [5, 12, 35], horizon: [10, 16, 48], text: [234, 244, 247], stars: 1, cloudBrightness: .05 },
];

export const sunKeyframes: readonly SunKeyframe[] = [
  { at: 0, x: 70, y: 88, size: 1, opacity: 0, color: [219, 157, 128] },
  { at: .12, x: 68, y: 74, size: 1.3, opacity: 1, color: [255, 184, 133] },
  { at: .30, x: 60, y: 40, size: .9, opacity: 1, color: [255, 223, 177] },
  { at: .42, x: 50, y: 16, size: .7, opacity: 1, color: [255, 250, 232] },
  { at: .58, x: 40, y: 40, size: .9, opacity: 1, color: [255, 199, 133] },
  { at: .72, x: 30, y: 74, size: 1.4, opacity: .92, color: [255, 157, 99] },
  { at: .80, x: 26, y: 92, size: 1.4, opacity: 0, color: [232, 125, 101] },
  { at: 1, x: 26, y: 92, size: 1.4, opacity: 0, color: [232, 125, 101] },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixColor = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function splineValue(index: number, amount: number, value: (frame: SunKeyframe) => number) {
  const before = sunKeyframes[Math.max(0, index - 1)];
  const start = sunKeyframes[index];
  const end = sunKeyframes[index + 1];
  const after = sunKeyframes[Math.min(sunKeyframes.length - 1, index + 2)];
  const span = end.at - start.at;
  const startSlope = index === 0 ? (value(end) - value(start)) / span : (value(end) - value(before)) / (end.at - before.at);
  const endSlope = index + 2 >= sunKeyframes.length ? (value(end) - value(start)) / span : (value(after) - value(start)) / (after.at - start.at);
  const t2 = amount * amount;
  const t3 = t2 * amount;
  const result = (2 * t3 - 3 * t2 + 1) * value(start)
    + (t3 - 2 * t2 + amount) * span * startSlope
    + (-2 * t3 + 3 * t2) * value(end)
    + (t3 - t2) * span * endSlope;
  return result;
}

function sampleSun(progress: number): SunSample {
  let index = sunKeyframes.length - 2;
  for (let cursor = 0; cursor < sunKeyframes.length - 1; cursor += 1) {
    if (progress <= sunKeyframes[cursor + 1].at) { index = cursor; break; }
  }
  const start = sunKeyframes[index];
  const end = sunKeyframes[index + 1];
  const span = end.at - start.at;
  const amount = smoothstep(span === 0 ? 0 : clamp01((progress - start.at) / span));
  return {
    x: splineValue(index, amount, (frame) => frame.x),
    y: splineValue(index, amount, (frame) => frame.y),
    size: splineValue(index, amount, (frame) => frame.size),
    opacity: clamp01(splineValue(index, amount, (frame) => frame.opacity)),
    color: mixColor(start.color, end.color, amount),
  };
}

/** Smoothly interpolates every palette value for normalized journey progress. */
export function sample(progress: number): TimelineSample {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  let left = skyKeyframes[0];
  let right = skyKeyframes[skyKeyframes.length - 1];
  for (let index = 1; index < skyKeyframes.length; index += 1) {
    if (p <= skyKeyframes[index].at) {
      left = skyKeyframes[index - 1];
      right = skyKeyframes[index];
      break;
    }
  }

  const span = right.at - left.at;
  const amount = smoothstep(span === 0 ? 0 : clamp01((p - left.at) / span));
  return {
    progress: p,
    moment: amount < .5 ? left.moment : right.moment,
    top: mixColor(left.top, right.top, amount),
    middle: mixColor(left.middle, right.middle, amount),
    horizon: mixColor(left.horizon, right.horizon, amount),
    text: mixColor(left.text, right.text, amount),
    stars: mix(left.stars, right.stars, amount),
    cloudBrightness: mix(left.cloudBrightness, right.cloudBrightness, amount),
    sun: sampleSun(p),
  };
}
