/**
 * The sky timeline is the shared source for scroll and clock modes. Scroll mode
 * maps home page progress from 0 to 1; clock mode selects a phase and holds it.
 * Keyframes and sample() contain no rendering objects so CSS and future WebGL
 * layers can use identical values.
 */
export type RGB = readonly [number, number, number];

export type SkyKeyframe = {
  at: number;
  phase: string;
  top: RGB;
  middle: RGB;
  horizon: RGB;
  sunX: number;
  sunY: number;
  sunOpacity: number;
  sunScale: number;
  stars: number;
  moonOpacity: number;
  moonX: number;
  moonY: number;
  clouds: number;
  glow: number;
  sunColor: RGB;
  cloudTint: RGB;
  exposure: number;
  fg: RGB;
};

export type SkySample = SkyKeyframe & { progress: number; chapter: 'dawn' | 'day' | 'golden' | 'dusk' | 'night' };

export const skyKeyframes: readonly SkyKeyframe[] = [
  { at: 0, phase: 'Pre-dawn', top: [7, 17, 31], middle: [19, 36, 59], horizon: [59, 73, 96], sunX: 14, sunY: 86, sunOpacity: .28, sunScale: .72, stars: .5, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .13, glow: .14, sunColor: [177, 112, 99], cloudTint: [125, 146, 172], exposure: .55, fg: [242, 235, 224] },
  { at: .08, phase: 'Sunrise', top: [24, 42, 69], middle: [199, 126, 103], horizon: [241, 183, 126], sunX: 18, sunY: 80, sunOpacity: .92, sunScale: .83, stars: .1, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .3, glow: .72, sunColor: [242, 160, 119], cloudTint: [241, 175, 145], exposure: .82, fg: [250, 241, 228] },
  { at: .2, phase: 'Morning', top: [63, 127, 176], middle: [156, 199, 221], horizon: [243, 210, 168], sunX: 30, sunY: 55, sunOpacity: .95, sunScale: .96, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .48, glow: .38, sunColor: [255, 221, 174], cloudTint: [231, 242, 245], exposure: 1, fg: [239, 247, 244] },
  { at: .38, phase: 'Day', top: [111, 174, 209], middle: [169, 213, 232], horizon: [221, 238, 243], sunX: 50, sunY: 22, sunOpacity: .9, sunScale: .9, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .42, glow: .2, sunColor: [255, 248, 225], cloudTint: [242, 249, 250], exposure: 1.12, fg: [239, 247, 244] },
  { at: .55, phase: 'Afternoon', top: [106, 166, 204], middle: [165, 207, 224], horizon: [230, 227, 207], sunX: 68, sunY: 30, sunOpacity: .91, sunScale: .98, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .4, glow: .23, sunColor: [255, 231, 192], cloudTint: [241, 241, 230], exposure: 1.08, fg: [239, 247, 244] },
  { at: .68, phase: 'Golden hour', top: [88, 124, 155], middle: [217, 149, 97], horizon: [242, 181, 111], sunX: 82, sunY: 58, sunOpacity: .96, sunScale: 1.12, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .46, glow: .82, sunColor: [255, 176, 105], cloudTint: [241, 175, 145], exposure: .92, fg: [255, 239, 217] },
  { at: .78, phase: 'Sunset', top: [74, 54, 84], middle: [183, 95, 93], horizon: [229, 138, 98], sunX: 90, sunY: 82, sunOpacity: .83, sunScale: 1.24, stars: .02, moonOpacity: 0, moonX: 77, moonY: 68, clouds: .32, glow: .98, sunColor: [250, 133, 105], cloudTint: [218, 141, 138], exposure: .76, fg: [251, 229, 229] },
  { at: .87, phase: 'Twilight', top: [20, 26, 58], middle: [52, 55, 107], horizon: [122, 79, 120], sunX: 92, sunY: 104, sunOpacity: 0, sunScale: 1.3, stars: .5, moonOpacity: .4, moonX: 72, moonY: 70, clouds: .17, glow: .38, sunColor: [175, 130, 177], cloudTint: [123, 132, 169], exposure: .62, fg: [231, 229, 245] },
  { at: 1, phase: 'Night', top: [3, 7, 18], middle: [7, 19, 41], horizon: [11, 24, 50], sunX: 92, sunY: 108, sunOpacity: 0, sunScale: 1.3, stars: 1, moonOpacity: 1, moonX: 78, moonY: 28, clouds: .08, glow: .1, sunColor: [96, 119, 170], cloudTint: [91, 111, 145], exposure: .48, fg: [220, 232, 247] },
];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const mix = (a: number, b: number, amount: number) => a + (b - a) * amount;
const mixColor = (a: RGB, b: RGB, amount: number): RGB => [mix(a[0], b[0], amount), mix(a[1], b[1], amount), mix(a[2], b[2], amount)];

export function chapterAt(progress: number): SkySample['chapter'] {
  const p = clamp01(progress);
  if (p < .3) return 'dawn';
  if (p < .58) return 'day';
  if (p < .78) return 'golden';
  if (p < .9) return 'dusk';
  return 'night';
}

export function sample(progress: number): SkySample {
  const p = clamp01(Number.isFinite(progress) ? progress : 0);
  let left = skyKeyframes[0];
  let right = skyKeyframes[skyKeyframes.length - 1];
  for (let index = 1; index < skyKeyframes.length; index += 1) {
    if (p <= skyKeyframes[index].at) { left = skyKeyframes[index - 1]; right = skyKeyframes[index]; break; }
  }
  const linear = right.at === left.at ? 0 : clamp01((p - left.at) / (right.at - left.at));
  const amount = smoothstep(linear);
  const scalarKeys = ['sunX', 'sunY', 'sunOpacity', 'sunScale', 'stars', 'moonOpacity', 'moonX', 'moonY', 'clouds', 'glow', 'exposure'] as const;
  const colorKeys = ['top', 'middle', 'horizon', 'sunColor', 'cloudTint', 'fg'] as const;
  const scalars = Object.fromEntries(scalarKeys.map((key) => [key, mix(left[key], right[key], amount)])) as Pick<SkyKeyframe, typeof scalarKeys[number]>;
  const colors = Object.fromEntries(colorKeys.map((key) => [key, mixColor(left[key], right[key], amount)])) as Pick<SkyKeyframe, typeof colorKeys[number]>;
  return { ...left, ...scalars, ...colors, phase: linear < .5 ? left.phase : right.phase, at: p, progress: p, chapter: chapterAt(p) };
}

export const skyPhaseProgress = {
  dawn: .08,
  day: .38,
  golden: .68,
  dusk: .87,
  night: 1,
} as const;
