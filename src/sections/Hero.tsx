import { ArrowDown } from 'lucide-react';
import { lazy, Suspense, useEffect, useState, type RefObject } from 'react';

const AtmosphereCanvas = lazy(() => import('../components/AtmosphereCanvas'));
const atmosphereQuery = '(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

export function Hero({ copyRef }: { copyRef: RefObject<HTMLDivElement | null> }) {
  const [showAtmosphere, setShowAtmosphere] = useState(() => window.matchMedia(atmosphereQuery).matches);

  useEffect(() => {
    const media = window.matchMedia(atmosphereQuery);
    const update = () => setShowAtmosphere(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return <section className="hero" id="top">
    <img className="hero__image" src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=90" alt="First light spilling across a quiet mountain valley" />
    <div className="hero__veil" />
    {showAtmosphere && <div className="hero-atmosphere" aria-hidden="true"><Suspense fallback={null}><AtmosphereCanvas /></Suspense></div>}
    <div className="hero__copy" ref={copyRef}><p className="eyebrow">A photographic journal of the natural world</p><h1>ABOVE<br /><em>EVERYTHING</em></h1><p className="hero__slogan">Moments Above.</p><p className="hero__note">A collection of moments captured<br />between earth and sky.</p><a className="hero__explore" href="#collection">Explore <ArrowDown size={14} /></a></div>
    <div className="hero__bottom"><span>Independent photography · Est. 2018</span><span>45° 26′ N &nbsp; 12° 20′ E</span></div>
    <span className="hero__index">01 <i /> 06</span>
  </section>;
}
