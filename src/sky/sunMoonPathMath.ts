const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Sun elevation in radians, kept free of Three.js for UI and fallback consumers. */
export function sunElevation(progress: number) {
  const t = clamp01((progress - .04) / .76);
  return Math.sin(Math.PI * t) * 1.05 - .12;
}
