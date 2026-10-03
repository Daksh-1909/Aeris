import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { imageSrcSet, imageUrl } from '../data/gallery';
import './journey-content.css';

gsap.registerPlugin(ScrollTrigger);

export function AbovePanel() {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo(panel, { yPercent: 14, autoAlpha: .82 }, {
        yPercent: 0,
        autoAlpha: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: panel,
          start: 'top bottom',
          end: 'top 25%',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, panel);
    return () => context.revert();
  }, []);

  return <section className="above-panel" id="above" ref={panelRef} aria-labelledby="above-title">
    <div className="above-panel__copy">
      <p className="eyebrow">AERIS · THE SKY JOURNAL</p>
      <h2 id="above-title">There is always<br />more <em>above.</em></h2>
      <p className="above-panel__description">A living collection of light, weather, and the small moments that make us look up.</p>
      <a className="above-panel__link" href="#light-and-landscape">Enter the journal <ArrowUpRight size={15} aria-hidden="true" /></a>
      <a className="above-panel__continue" href="#light-and-landscape"><span>Continue below</span><ArrowDown size={13} aria-hidden="true" /></a>
    </div>
    <figure className="above-panel__image">
      <img
        src={imageUrl('photo-1464822759023-fed622ff2c3b', 1600)}
        srcSet={imageSrcSet('photo-1464822759023-fed622ff2c3b', [480, 960, 1600])}
        sizes="(max-width: 760px) 100vw, 50vw"
        width="1600"
        height="900"
        alt="A mountain range beneath a broad, cloud-filled sky"
        loading="lazy"
        decoding="async"
      />
      <span className="above-panel__image-glow" aria-hidden="true" />
      <figcaption><span>01 / 08</span> The world opens upward</figcaption>
    </figure>
  </section>;
}
