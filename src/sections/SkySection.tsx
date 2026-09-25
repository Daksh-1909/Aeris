import { useEffect, useState } from 'react';
import { getPhotographs } from '../services/galleryService';
import type { Photograph } from '../types/gallery';
import { GalleryImage } from '../components/GalleryImage';

export function SkySection({ onOpen }: { onOpen: (photo: Photograph, photos: Photograph[]) => void }) {
  const [photos, setPhotos] = useState<Photograph[]>([]);
  useEffect(() => { void getPhotographs('Sky').then(setPhotos); }, []);
  const [feature, detail] = photos;

  return <section className="sky-section" id="sky" aria-labelledby="sky-title">
    <div className="sky-section__heading"><p className="eyebrow">Field note · 01</p><div className="sky-section__title"><h2 id="sky-title">SKY</h2><p>A changing canvas<br />above us.</p></div></div>
    {feature && <div className="sky-section__composition">
      <GalleryImage photo={feature} photos={photos} onOpen={onOpen} className="sky-feature" imageWidth={1800} index="01" parallax />
      <div className="sky-section__foot"><p>The first light of another day.<br /><span>Every horizon, a beginning.</span></p>
        {detail && <GalleryImage photo={detail} photos={photos} onOpen={onOpen} className="sky-detail" imageWidth={700} metadata reveal={false} />}
      </div>
    </div>}
  </section>;
}
