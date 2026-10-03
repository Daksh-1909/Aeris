export type QualityTier = 'high' | 'medium' | 'low';

export interface SkyQuality {
  tier: QualityTier;
  maxDpr: number;
  cloudLayers: number;
  stars: number;
  mouseParallax: boolean;
  twinkle: boolean;
}

const tiers: Record<QualityTier, SkyQuality> = {
  high: { tier: 'high', maxDpr: 2, cloudLayers: 4, stars: 3000, mouseParallax: true, twinkle: true },
  medium: { tier: 'medium', maxDpr: 1.5, cloudLayers: 3, stars: 2000, mouseParallax: false, twinkle: true },
  low: { tier: 'low', maxDpr: 1.25, cloudLayers: 2, stars: 1200, mouseParallax: false, twinkle: false },
};

export function detectSkyQuality(): SkyQuality {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || (cores >= 8 ? 8 : 4);
  if (connection?.saveData || mobile || cores <= 4 || memory <= 4) return { ...tiers.low };
  if (cores >= 8 && memory >= 8 && matchMedia('(hover: hover) and (pointer: fine)').matches) return { ...tiers.high };
  return { ...tiers.medium };
}

export function lowerSkyQuality(current: SkyQuality): SkyQuality | null {
  if (current.tier === 'high') return { ...tiers.medium };
  if (current.tier === 'medium') return { ...tiers.low };
  return null;
}
