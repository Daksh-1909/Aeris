export type GalleryCategory = 'All' | 'Sky' | 'Cloud' | 'Nature' | 'Featured';
export type CloudType = 'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus' | 'altocumulus' | 'stratocumulus' | 'nimbostratus' | 'altostratus' | 'cirrocumulus' | 'cirrostratus' | 'lenticular' | 'mammatus' | 'clear';

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
  cloudType: CloudType;
  credit: string;
  /** Static editorial glow selected with the photo record at build time. */
  tone: string;
}

export type OpenPhotograph = (photo: Photograph, photos: Photograph[]) => void;
