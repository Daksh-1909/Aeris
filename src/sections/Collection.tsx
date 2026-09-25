import { ArrowUpRight } from 'lucide-react';
import { PhotoCard } from '../components/PhotoCard';
import { GalleryStatus } from '../components/GalleryStatus';
import { useGalleryPhotos } from '../hooks/useGalleryPhotos';
import type { GalleryCategory, OpenPhotograph } from '../types/gallery';

const categories: GalleryCategory[] = ['All', 'Sky', 'Clouds', 'Nature', 'Light'];
export function Collection({ category, onCategoryChange, onOpen }: { category: GalleryCategory; onCategoryChange: (category: GalleryCategory) => void; onOpen: OpenPhotograph }) {
  const { photos, isLoading, hasError } = useGalleryPhotos(category);
  return <section className="collection section-wrap" id="collection" data-reveal>
    <div className="section-heading"><div><p className="eyebrow">Selected work · 2022—2024</p><h2>Collected<br /><em>light.</em></h2></div><p className="section-heading__aside">Small moments, held still.<br />A collection shaped by looking up.</p></div>
    <div className="collection-toolbar"><div className="filters" role="group" aria-label="Filter photographs">{categories.map((item) => <button key={item} data-cursor="arrow" className={category === item ? 'is-active' : ''} aria-pressed={category === item} onClick={() => onCategoryChange(item)}>{item}</button>)}</div><span aria-live="polite" aria-atomic="true">{isLoading ? 'Loading photographs' : `${String(photos.length).padStart(2, '0')} photographs`}</span></div>
    <div className="photo-grid" aria-busy={isLoading}>{photos.map((photo) => <PhotoCard key={photo.id} photo={photo} photos={photos} onOpen={onOpen} />)}
      {!isLoading && photos.length === 0 && <GalleryStatus hasError={hasError} />}
    </div>
    <a href="mailto:hello@aeris.studio" className="collection-link">Request the full archive <ArrowUpRight size={16} /></a>
  </section>;
}
