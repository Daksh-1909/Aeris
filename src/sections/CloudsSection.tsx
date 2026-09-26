import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useGalleryPhotos } from '../hooks/useGalleryPhotos';
import type { OpenPhotograph } from '../types/gallery';
import { GalleryImage } from '../components/GalleryImage';
import { GalleryStatus } from '../components/GalleryStatus';

export function CloudsSection({ onOpen }: { onOpen: OpenPhotograph }) {
  const { photos, isLoading, hasError } = useGalleryPhotos('Clouds');
  const viewportRef = useRef<HTMLDivElement>(null);
  const [feature, ...studies] = photos;
  const scrollStudies = (direction: -1 | 1) => viewportRef.current?.scrollBy({ left: direction * viewportRef.current.clientWidth * .78, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

  return <section className="clouds-section" id="clouds" aria-labelledby="clouds-title">
    {feature && <div className="clouds-section__hero">
      <GalleryImage photo={feature} photos={photos} onOpen={onOpen} className="clouds-feature" imageWidth={2200} parallax metadata />
      <div className="clouds-section__identity"><p className="eyebrow">Field note · 02</p><h2 id="clouds-title">CLOUDS</h2><p>Somewhere between<br /><em>earth and infinity.</em></p></div>
      <span className="clouds-section__edge-note">Weather, light, and everything in between</span>
    </div>}
    {studies.length > 0 && <div className="cloud-studies">
      <div className="cloud-studies__heading"><p className="eyebrow">The cloud studies</p><div className="cloud-studies__controls"><span>{String(photos.length).padStart(2, '0')} collected moments</span><button type="button" onClick={() => scrollStudies(-1)} aria-label="Previous cloud photographs"><ArrowLeft size={16}/></button><button type="button" onClick={() => scrollStudies(1)} aria-label="Next cloud photographs"><ArrowRight size={16}/></button></div></div>
      <div className="cloud-studies__viewport" ref={viewportRef} role="region" aria-label="Cloud photographs" tabIndex={0}>
        <div className="cloud-studies__track">{studies.map((photo, index) => <GalleryImage key={photo.id} photo={photo} photos={photos} onOpen={onOpen} className={`cloud-study cloud-study--${photo.aspect}`} imageWidth={1000} index={String(index + 2).padStart(2, '0')} parallax />)}</div>
      </div>
    </div>}
    {!isLoading && photos.length === 0 && <GalleryStatus hasError={hasError} />}
  </section>;
}
