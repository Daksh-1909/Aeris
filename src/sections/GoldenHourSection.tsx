import { ArrowUpRight } from 'lucide-react';
import { GalleryImage } from '../components/GalleryImage';
import { GalleryStatus } from '../components/GalleryStatus';
import { useGalleryPhotos } from '../hooks/useGalleryPhotos';
import type { OpenPhotograph } from '../types/gallery';

export function GoldenHourSection({ onOpen }: { onOpen: OpenPhotograph }) {
  const { photos, isLoading, hasError } = useGalleryPhotos('Featured');
  const featured = photos.slice(0, 3);

  return <section className="golden-hour" id="golden-hour" aria-labelledby="golden-hour-title">
    <div className="golden-hour__orbs" aria-hidden="true"><span className="golden-hour__orb golden-hour__orb--sun" /><span className="golden-hour__orb golden-hour__orb--moon" /><span className="golden-hour__orb golden-hour__orb--small" /></div>
    <div className="golden-hour__copy">
      <p className="eyebrow">Field note · 03</p>
      <h2 id="golden-hour-title">Unlock the magic<br /><em>of the sky.</em></h2>
      <p>Stay for the last light, then keep looking as the night gathers around the horizon.</p>
      <a className="golden-hour__planner" href="/planner">Plan your golden hour <ArrowUpRight size={16} aria-hidden="true" /></a>
    </div>
    <div className="golden-hour__stack" role="group" aria-label="Golden-hour photographs">
      {featured.map((photo, index) => <GalleryImage key={photo.id} photo={photo} photos={photos} onOpen={onOpen} className={`golden-hour__photo golden-hour__photo--${index + 1}`} imageWidth={1600} index={String(index + 1).padStart(2, '0')} parallax />)}
      {!isLoading && featured.length === 0 && <GalleryStatus hasError={hasError} />}
    </div>
  </section>;
}
