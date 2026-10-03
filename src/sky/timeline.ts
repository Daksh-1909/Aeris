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
  { at: .62, phase: 'Late afternoon', top: [99, 145, 173], middle: [190, 174, 157], horizon: [239, 207, 169], sunX: 75, sunY: 41, sunOpacity: .94, sunScale: 1.02, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .42, glow: .35, sunColor: [255, 211, 164], cloudTint: [234, 214, 197], exposure: 1.03, fg: [239, 242, 238] },
  { at: .68, phase: 'Golden hour', top: [87, 119, 146], middle: [211, 143, 105], horizon: [247, 178, 111], sunX: 82, sunY: 58, sunOpacity: .97, sunScale: 1.12, stars: 0, moonOpacity: 0, moonX: 78, moonY: 72, clouds: .46, glow: .76, sunColor: [255, 176, 105], cloudTint: [241, 175, 145], exposure: .91, fg: [255, 239, 217] },
  { at: .78, phase: 'Sunset', top: [73, 47, 71], middle: [179, 84, 86], horizon: [232, 122, 83], sunX: 90, sunY: 82, sunOpacity: .78, sunScale: 1.22, stars: .03, moonOpacity: 0, moonX: 77, moonY: 68, clouds: .36, glow: .96, sunColor: [251, 128, 94], cloudTint: [214, 132, 126], exposure: .73, fg: [251, 229, 229] },
  { at: .84, phase: 'Afterglow', top: [48, 39, 81], middle: [127, 74, 112], horizon: [197, 111, 111], sunX: 92, sunY: 96, sunOpacity: 0, sunScale: 1.25, stars: .28, moonOpacity: .12, moonX: 74, moonY: 72, clouds: .25, glow: .58, sunColor: [222, 135, 139], cloudTint: [171, 126, 151], exposure: .65, fg: [238, 229, 242] },
  { at: .87, phase: 'Twilight', top: [20, 26, 58], middle: [52, 55, 107], horizon: [122, 79, 120], sunX: 92, sunY: 104, sunOpacity: 0, sunScale: 1.3, stars: .5, moonOpacity: .4, moonX: 72, moonY: 70, clouds: .17, glow: .38, sunColor: [175, 130, 177], cloudTint: [123, 132, 169], exposure: .6, fg: [231, 229, 245] },
  { at: .92, phase: 'Blue hour', top: [10, 17, 43], middle: [29, 36, 78], horizon: [72, 62, 111], sunX: 92, sunY: 106, sunOpacity: 0, sunScale: 1.3, stars: .72, moonOpacity: .68, moonX: 74, moonY: 55, clouds: .12, glow: .2, sunColor: [126, 132, 190], cloudTint: [101, 116, 157], exposure: .53, fg: [224, 231, 247] },
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
