import { ArrowUpRight } from 'lucide-react';
import type { Photograph } from '../types/gallery';
import { imageUrl } from '../data/gallery';

export function PhotoCard({ photo, onOpen }: { photo: Photograph; onOpen: (photo: Photograph) => void }) {
  return <button className={`photo-card photo-card--${photo.aspect}`} onClick={() => onOpen(photo)} aria-label={`View ${photo.title}`}>
    <img src={imageUrl(photo.image, 1000)} alt={photo.title} loading="lazy" />
    <span className="photo-card__shade" />
    <span className="photo-card__meta"><span><small>{photo.location} · {photo.year}</small><strong>{photo.title}</strong></span><ArrowUpRight size={18} /></span>
  </button>;
}
