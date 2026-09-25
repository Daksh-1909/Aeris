import { useState } from 'react';
import { imageSrcSet, imageUrl } from '../data/gallery';

export function Manifesto() {
  const [imageFailed, setImageFailed] = useState(false);
  return <section className="manifesto" id="about" data-reveal><div className={`manifesto__image${imageFailed ? ' is-unavailable' : ''}`}><img src={imageUrl('photo-1472396961693-142e6e269027', 1200)} srcSet={imageSrcSet('photo-1472396961693-142e6e269027', [480, 800, 1200, 1600])} sizes="(max-width: 760px) 100vw, 50vw" width="1600" height="1200" alt="Wildlife standing in a quiet woodland landscape" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />{imageFailed && <span className="image-fallback" aria-hidden="true">Photograph unavailable</span>}</div><div className="manifesto__copy"><p className="eyebrow">A note on looking</p><h2>The sky asks<br />for nothing.<br /><em>We look anyway.</em></h2><p>Somewhere between weather and wonder, there is a moment worth keeping. AERIS is an ongoing record of those fleeting hours above the everyday.</p><span className="signature">Made slowly, under open skies.</span></div></section>;
}
