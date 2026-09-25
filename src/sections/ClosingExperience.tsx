import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { imageSrcSet, imageUrl, photographs } from '../data/gallery';

const closingPhoto = photographs.find((photo) => photo.id === '03') ?? photographs[0];

export function ClosingExperience() {
  const [imageFailed, setImageFailed] = useState(false);
  return <section className="closing-experience" aria-labelledby="closing-title" data-reveal>
    <img
      className="closing-experience__image"
      src={imageUrl(closingPhoto.image, 2200)}
      srcSet={imageSrcSet(closingPhoto.image, [480, 800, 1200, 1600, 2000, 2200])}
      sizes="100vw"
      width="2200"
      height="1467"
      alt={closingPhoto.description ?? closingPhoto.title}
      loading="lazy"
      decoding="async"
      onError={() => setImageFailed(true)}
    />
    <div className="closing-experience__shade" />
    {imageFailed && <span className="closing-experience__image-fallback" aria-hidden="true">Photograph unavailable</span>}
    <div className="closing-experience__copy">
      <p className="eyebrow">More than a photo</p>
      <h2 id="closing-title">A collection of moments<span className="closing-experience__line-break"><br /></span> that existed only once.</h2>
      <a href="#collection" className="closing-experience__link">Enter the gallery <ArrowUpRight size={16} aria-hidden="true" /></a>
    </div>
    <span className="closing-experience__credit">{closingPhoto.location} · {closingPhoto.year}</span>
  </section>;
}
