export type JourneyQuality = 'high' | 'medium' | 'low';

const limits: Record<JourneyQuality, { dpr: number; stars: [number, number, number]; clouds: number[] }> = {
  high: { dpr: 2, stars: [2500, 500, 40], clouds: [6, 6, 7] },
  medium: { dpr: 1.5, stars: [1600, 380, 20], clouds: [5, 5, 5] },
  low: { dpr: 1.25, stars: [960, 224, 16], clouds: [3, 3, 4] },
};

export function getJourneyQuality(width = window.innerWidth): JourneyQuality {
  if (width <= 760) return 'low';
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency || 8;
  return memory <= 4 || cores <= 4 ? 'medium' : 'high';
}

export function qualityLimits(quality: JourneyQuality) {
  return limits[quality];
}

export function lowerJourneyQuality(quality: JourneyQuality): JourneyQuality {
  return quality === 'high' ? 'medium' : 'low';
}
