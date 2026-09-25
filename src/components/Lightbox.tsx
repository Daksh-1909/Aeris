import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { Photograph } from '../types/gallery';
import { imageUrl } from '../data/gallery';

export function Lightbox({ photos, active, onClose, onChange }: { photos: Photograph[]; active: Photograph; onClose: () => void; onChange: (photo: Photograph) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      const index = photos.findIndex((photo) => photo.id === active.id);
      if (event.key === 'ArrowRight') onChange(photos[(index + 1) % photos.length]);
      if (event.key === 'ArrowLeft') onChange(photos[(index - 1 + photos.length) % photos.length]);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [active, photos, onChange, onClose]);
  const index = photos.findIndex((photo) => photo.id === active.id);
  return <div className="lightbox" role="dialog" aria-modal="true" aria-label={active.title} onClick={onClose}>
    <button className="lightbox__close" onClick={onClose} aria-label="Close"><X /></button>
    <button className="lightbox__arrow lightbox__arrow--left" onClick={(event) => { event.stopPropagation(); onChange(photos[(index - 1 + photos.length) % photos.length]); }} aria-label="Previous"><ArrowLeft /></button>
    <figure onClick={(event) => event.stopPropagation()}><img src={imageUrl(active.image, 2000)} alt={active.title} /><figcaption><span>{active.location} · {active.year}</span><strong>{active.title}</strong></figcaption></figure>
    <button className="lightbox__arrow lightbox__arrow--right" onClick={(event) => { event.stopPropagation(); onChange(photos[(index + 1) % photos.length]); }} aria-label="Next"><ArrowRight /></button>
  </div>;
}
