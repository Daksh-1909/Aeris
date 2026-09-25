import { ArrowUpRight } from 'lucide-react';
import { imageSrcSet, imageUrl } from '../data/gallery';
import type { OpenPhotograph, Photograph } from '../types/gallery';
import { ImageReveal } from './ImageReveal';

interface GalleryImageProps {
  photo: Photograph;
  photos: Photograph[];
  onOpen: OpenPhotograph;
  className?: string;
  imageWidth?: number;
  imageSizes?: string;
  index?: string;
  reveal?: boolean;
  parallax?: boolean;
  metadata?: boolean;
}

/** Shared interactive photograph: reveal, hover, optional scroll parallax, caption, metadata, and lightbox entry. */
export function GalleryImage({ photo, photos, onOpen, className = '', imageWidth = 1200, imageSizes = '(max-width: 760px) 84vw, 58vw', index, reveal = true, parallax = false, metadata = true }: GalleryImageProps) {
  const responsiveWidths = [320, 640, 960, 1200, 1600, 2000, 2200].filter((width) => width < imageWidth).concat(imageWidth);
  return <button
    className={`gallery-image ${parallax ? 'gallery-image--parallax ' : ''}${className}`}
    data-cursor="view"
    {...(reveal ? { 'data-reveal': true } : {})}
    onClick={() => onOpen(photo, photos)}
    aria-label={`View ${photo.title}, ${photo.location}`}
  >
    <span className="gallery-image__media">
      <ImageReveal image={imageUrl(photo.image, imageWidth)} srcSet={imageSrcSet(photo.image, responsiveWidths)} sizes={imageSizes} alt={photo.description ?? photo.title} className="gallery-image__reveal" parallax={parallax} reveal={reveal} />
      <span className="gallery-image__shade" />
    </span>
    {index && <span className="gallery-image__index">{index} <i /> {photo.category}</span>}
    {metadata && <span className="gallery-image__meta"><span><small>{photo.location} · {photo.year}{photo.metadata ? ` · ${photo.metadata}` : ''}</small><strong>{photo.title}</strong></span><ArrowUpRight className="gallery-image__arrow" size={18} />
    </span>}
  </button>;
}
