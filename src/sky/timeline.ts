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

export type TimelineSample = Omit<TimelineKeyframe, 'at'> & { progress: number };

/** Palette stops from AERIS_SKY_JOURNEY_V2.md. Rendering layers share this sample. */
export const skyKeyframes: readonly TimelineKeyframe[] = [
  { at: 0, moment: 'Pre-dawn', top: [7, 17, 31], middle: [19, 36, 59], horizon: [59, 73, 96], text: [234, 244, 247], stars: .5, cloudBrightness: .25 },
  { at: .12, moment: 'Sunrise', top: [24, 42, 69], middle: [199, 126, 103], horizon: [241, 183, 126], text: [234, 244, 247], stars: .05, cloudBrightness: .7 },
  { at: .30, moment: 'Morning', top: [63, 127, 176], middle: [156, 199, 221], horizon: [243, 210, 168], text: [11, 26, 36], stars: 0, cloudBrightness: .95 },
  { at: .42, moment: 'Noon', top: [95, 163, 206], middle: [169, 213, 232], horizon: [221, 238, 243], text: [11, 26, 36], stars: 0, cloudBrightness: 1 },
  { at: .58, moment: 'Golden hour', top: [88, 124, 155], middle: [217, 149, 97], horizon: [242, 181, 111], text: [234, 244, 247], stars: 0, cloudBrightness: .9 },
  { at: .72, moment: 'Sunset', top: [74, 54, 84], middle: [183, 95, 93], horizon: [229, 138, 98], text: [234, 244, 247], stars: 0, cloudBrightness: .6 },
  { at: .84, moment: 'Twilight', top: [20, 26, 58], middle: [52, 55, 107], horizon: [122, 79, 120], text: [234, 244, 247], stars: .5, cloudBrightness: .2 },
  { at: 1, moment: 'Night', top: [3, 7, 18], middle: [7, 19, 41], horizon: [11, 24, 50], text: [234, 244, 247], stars: 1, cloudBrightness: .1 },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixColor = (a: RGB, b: RGB, t: number): RGB => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

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
  };
}
