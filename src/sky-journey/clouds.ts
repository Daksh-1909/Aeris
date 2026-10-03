export type CloudDepth = 'far' | 'mid' | 'near';

export type CloudPlacement = {
  id: string;
  depth: CloudDepth;
  src: string;
  left: number;
  top: number;
  sizeVw: number;
  minPx: number;
  maxPx: number;
  parallaxX: number;
  parallaxY: number;
  driftPx: number;
  driftY: number;
  duration: number;
  phase: number;
  opacity: number;
  mobileHidden: boolean;
};

function seededRandom(seed: number) {
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const cloudLayers = [
  { depth: 'far', count: 6, mobileCount: 3, topMin: 8, topMax: 40, sizeMin: 13, sizeMax: 20, minPx: 128, maxPx: 320, parallax: 7, drift: 9, opacity: .50 },
  { depth: 'mid', count: 5, mobileCount: 3, topMin: 18, topMax: 51, sizeMin: 19, sizeMax: 29, minPx: 144, maxPx: 450, parallax: 13, drift: 15, opacity: .72 },
  { depth: 'near', count: 3, mobileCount: 2, topMin: 31, topMax: 55, sizeMin: 29, sizeMax: 41, minPx: 164, maxPx: 620, parallax: 20, drift: 22, opacity: .72 },
] as const;

const random = seededRandom(8317);
const between = (minimum: number, maximum: number) => minimum + random() * (maximum - minimum);

export const cloudPlacements: readonly CloudPlacement[] = cloudLayers.flatMap((layer) =>
  Array.from({ length: layer.count }, (_, index) => {
    const mobileHidden = index >= layer.mobileCount;
    const id = `${layer.depth}-${index + 1}`;
    return {
      id,
      depth: layer.depth,
      src: `/3d/clouds/cloud_${Math.floor(random() * 4) + 1}.webp`,
      left: between(-9, 88),
      top: between(layer.topMin, layer.topMax),
      sizeVw: between(layer.sizeMin, layer.sizeMax),
      minPx: layer.minPx,
      maxPx: layer.maxPx,
      parallaxX: between(-layer.parallax, layer.parallax),
      parallaxY: between(-layer.parallax * .18, layer.parallax * .18),
      driftPx: between(layer.drift * .55, layer.drift),
      driftY: between(2, 7),
      duration: between(23, 42),
      phase: between(0, 40),
      opacity: layer.opacity,
      mobileHidden,
    };
  }),
);
