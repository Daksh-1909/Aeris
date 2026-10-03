const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);

export function GroundScene({ progress }: { progress: number }) {
  const dayOpacity = 1 - smoothstep(clamp01((progress - .54) / .15));
  const sunsetOpacity = smoothstep(clamp01((progress - .56) / .12)) * (1 - smoothstep(clamp01((progress - .76) / .13)));
  const nightOpacity = smoothstep(clamp01((progress - .78) / .14));

  return <div className="journey__ground-scene" aria-hidden="true">
    <div className="journey__ground-art">
      <img src="/3d/scene/ground-day.svg" alt="" style={{ opacity: dayOpacity }} />
      <img src="/3d/scene/ground-sunset.svg" alt="" style={{ opacity: sunsetOpacity }} />
      <img src="/3d/scene/ground-night.svg" alt="" style={{ opacity: nightOpacity }} />
    </div>
  </div>;
}
