import { photographs } from '../data/gallery';
import type { GalleryCategory, Photograph } from '../types/gallery';

/** UI-facing gallery boundary. Replace this implementation with an API client when a backend exists. */
export async function getPhotographs(category: GalleryCategory = 'All'): Promise<Photograph[]> {
  const items = category === 'All' ? photographs : photographs.filter((item) => item.category === category);
  return Promise.resolve(items);
}
