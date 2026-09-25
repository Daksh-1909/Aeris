export type GalleryCategory = 'All' | 'Sky' | 'Clouds' | 'Nature' | 'Light';

export interface Photograph {
  id: string;
  title: string;
  location: string;
  category: Exclude<GalleryCategory, 'All'>;
  image: string;
  /** Short editorial description, also used as image alt text when available. */
  description?: string;
  /** Optional collection note such as a time of day or study label. */
  metadata?: string;
  year: string;
  aspect: 'wide' | 'tall' | 'square';
}

export type OpenPhotograph = (photo: Photograph, photos: Photograph[]) => void;
