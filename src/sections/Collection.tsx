import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PhotoCard } from '../components/PhotoCard';
import { getPhotographs } from '../services/galleryService';
import type { GalleryCategory, Photograph } from '../types/gallery';

const categories: GalleryCategory[] = ['All', 'Sky', 'Clouds', 'Nature', 'Light'];
export function Collection({ category, onCategoryChange, onOpen }: { category: GalleryCategory; onCategoryChange: (category: GalleryCategory) => void; onOpen: (photo: Photograph, photos: Photograph[]) => void }) {
  const [photos, setPhotos] = useState<Photograph[]>([]);
  useEffect(() => { void getPhotographs(category).then(setPhotos); }, [category]);
  return <section className="collection section-wrap" id="collection" data-reveal>
    <div className="section-heading"><div><p className="eyebrow">Selected work · 2022—2024</p><h2>Collected<br /><em>light.</em></h2></div><p className="section-heading__aside">Small moments, held still.<br />A collection shaped by looking up.</p></div>
    <div className="collection-toolbar"><div className="filters" aria-label="Filter photographs">{categories.map((item) => <button key={item} data-cursor="arrow" className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => onCategoryChange(item)}>{item}</button>)}</div><span>{String(photos.length).padStart(2, '0')} photographs</span></div>
    <div className="photo-grid">{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} onOpen={(item) => onOpen(item, photos)} />)}</div>
    <a href="mailto:hello@aeris.studio" className="collection-link">Request the full archive <ArrowUpRight size={16} /></a>
  </section>;
}
