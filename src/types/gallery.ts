export type GalleryCategory = 'All' | 'Sky' | 'Clouds' | 'Nature' | 'Light';

export interface Photograph {
  id: string;
  title: string;
  location: string;
  category: Exclude<GalleryCategory, 'All'>;
  image: string;
  year: string;
  aspect: 'wide' | 'tall' | 'square';
}
