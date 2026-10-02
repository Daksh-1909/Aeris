export interface GalleryFacets {
  timeOfDay: 'dawn'|'morning'|'day'|'golden-hour'|'dusk';
  season: 'spring'|'summer'|'autumn'|'winter';
  mood: 'soft'|'cool'|'warm'|'dramatic'|'green'|'open';
}

export const galleryFacets: Record<string, GalleryFacets> = {
  '01': { timeOfDay: 'day', season: 'autumn', mood: 'soft' },
  '02': { timeOfDay: 'dawn', season: 'winter', mood: 'cool' },
  '03': { timeOfDay: 'morning', season: 'spring', mood: 'green' },
  '04': { timeOfDay: 'golden-hour', season: 'summer', mood: 'warm' },
  '05': { timeOfDay: 'day', season: 'winter', mood: 'cool' },
  '06': { timeOfDay: 'day', season: 'summer', mood: 'open' },
  '07': { timeOfDay: 'dusk', season: 'autumn', mood: 'dramatic' },
  '08': { timeOfDay: 'dusk', season: 'winter', mood: 'soft' },
  '09': { timeOfDay: 'day', season: 'summer', mood: 'green' },
  '10': { timeOfDay: 'morning', season: 'autumn', mood: 'green' },
};
