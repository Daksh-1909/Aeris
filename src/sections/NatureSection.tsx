import { useEffect, useState } from 'react';
import { getPhotographs } from '../services/galleryService';
import type { Photograph } from '../types/gallery';
import { GalleryImage } from '../components/GalleryImage';

export function NatureSection({ onOpen }: { onOpen: (photo: Photograph, photos: Photograph[]) => void }) {
  const [photos, setPhotos] = useState<Photograph[]>([]);
  useEffect(() => { void getPhotographs('Nature').then(setPhotos); }, []);
  const [feature, ...details] = photos;

  return <section className="nature-section" id="nature" aria-labelledby="nature-title">
    <div className="nature-section__heading"><p className="eyebrow">Field note · 03</p><div><h2 id="nature-title">NATURE</h2><p>Where the sky<br /><em>meets the earth.</em></p></div></div>
    {feature && <div className="nature-section__composition">
      <GalleryImage photo={feature} photos={photos} onOpen={onOpen} className="nature-feature" imageWidth={2000} index="01" parallax />
      <div className="nature-section__details">
        <p className="nature-section__mark">Earth <i /> Sky</p>
        {details.map((photo, index) => <GalleryImage key={photo.id} photo={photo} photos={photos} onOpen={onOpen} className={`nature-detail nature-detail--${index + 1}`} imageWidth={900} index={String(index + 2).padStart(2, '0')} parallax />)}
        {details.length === 0 && <p className="nature-section__note">A slower rhythm,<br />written into the land.</p>}
      </div>
    </div>}
  </section>;
}
