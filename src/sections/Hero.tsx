import { ArrowDown } from 'lucide-react';
import { lazy, Suspense, useEffect, useState, type RefObject } from 'react';
import { imageSrcSet, imageUrl } from '../data/gallery';

const AtmosphereCanvas = lazy(() => import('../components/AtmosphereCanvas'));
const atmosphereQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function Hero({ copyRef }: { copyRef: RefObject<HTMLDivElement | null> }) {
  const [showAtmosphere, setShowAtmosphere] = useState(() => window.matchMedia(atmosphereQuery).matches);
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(atmosphereQuery);
    const update = () => setShowAtmosphere(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return <section className="hero" id="top">
    <img className={heroImageFailed ? 'hero__image is-unavailable' : 'hero__image'} src={imageUrl('photo-1470252649378-9c29740c9fa8', 1600)} srcSet={imageSrcSet('photo-1470252649378-9c29740c9fa8', [640, 960, 1280, 1600, 2000, 2400])} sizes="100vw" width="2400" height="1600" alt="First light spilling across a quiet mountain valley" loading="eager" fetchPriority="high" decoding="async" onError={() => setHeroImageFailed(true)} />
    {heroImageFailed && <span className="hero__image-fallback" aria-hidden="true">Photograph unavailable</span>}
    <div className="hero__veil" />
    {showAtmosphere && <div className="hero-atmosphere" aria-hidden="true"><Suspense fallback={null}><AtmosphereCanvas /></Suspense></div>}
    <div className="hero__copy" ref={copyRef}><p className="eyebrow">A photographic journal of the natural world</p><h1>ABOVE<br /><em>EVERYTHING</em></h1><p className="hero__slogan">Moments Above.</p><p className="hero__note">A collection of moments captured<br />between earth and sky.</p><a className="hero__explore" href="#collection">Explore <ArrowDown size={14} /></a></div>
    <div className="hero__bottom"><span>Independent photography · Est. 2018</span><span>45° 26′ N &nbsp; 12° 20′ E</span></div>
    <span className="hero__index">01 <i /> 06</span>
  </section>;
}
