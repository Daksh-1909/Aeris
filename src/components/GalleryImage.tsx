import { ArrowUpRight } from 'lucide-react';
import { imageUrl } from '../data/gallery';
import type { Photograph } from '../types/gallery';
import { ImageReveal } from './ImageReveal';

interface GalleryImageProps {
  photo: Photograph;
  photos: Photograph[];
  onOpen: (photo: Photograph, photos: Photograph[]) => void;
  className?: string;
  imageWidth?: number;
  index?: string;
  reveal?: boolean;
  parallax?: boolean;
  metadata?: boolean;
}

/** Shared interactive photograph: reveal, hover, optional scroll parallax, caption, metadata, and lightbox entry. */
export function GalleryImage({ photo, photos, onOpen, className = '', imageWidth = 1200, index, reveal = true, parallax = false, metadata = true }: GalleryImageProps) {
  return <button
    className={`gallery-image ${parallax ? 'gallery-image--parallax ' : ''}${className}`}
    data-cursor="view"
    {...(reveal ? { 'data-reveal': true } : {})}
    onClick={() => onOpen(photo, photos)}
    aria-label={`View ${photo.title}, ${photo.location}`}
  >
    <span className="gallery-image__media">
      <ImageReveal image={imageUrl(photo.image, imageWidth)} alt={photo.description ?? photo.title} className="gallery-image__reveal" parallax={parallax} reveal={reveal} />
      <span className="gallery-image__shade" />
    </span>
    {index && <span className="gallery-image__index">{index} <i /> {photo.category}</span>}
    {metadata && <span className="gallery-image__meta"><span><small>{photo.location} · {photo.year}{photo.metadata ? ` · ${photo.metadata}` : ''}</small><strong>{photo.title}</strong></span><ArrowUpRight className="gallery-image__arrow" size={18} />
    </span>}
  </button>;
}
