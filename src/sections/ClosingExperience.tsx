import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { imageSrcSet, imageUrl, photographs } from '../data/gallery';

const closingPhoto = photographs.find((photo) => photo.id === '03') ?? photographs[0];
const collectionStats = [
  { label: 'Photographs', value: photographs.length },
  { label: 'Cloud forms', value: new Set(photographs.map((photo) => photo.cloudType)).size },
  { label: 'Places', value: new Set(photographs.map((photo) => photo.location)).size },
];

export function ClosingExperience() {
  const [imageFailed, setImageFailed] = useState(false);
  const statsRef = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const stats = statsRef.current;
    if (!stats) return;
    const counters = Array.from(stats.querySelectorAll<HTMLElement>('[data-count-to]'));
    const tweens: gsap.core.Tween[] = [];
    const finish = () => counters.forEach((counter) => { counter.textContent = Number(counter.dataset.countTo).toLocaleString(); });
    const animate = () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reduceEffects === 'true') {
        finish();
        return;
      }
      counters.forEach((counter) => {
        const state = { value: 0 };
        tweens.push(gsap.to(state, {
          value: Number(counter.dataset.countTo),
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { counter.textContent = Math.round(state.value).toLocaleString(); },
        }));
      });
    };
    if (!('IntersectionObserver' in window)) {
      animate();
      return () => tweens.forEach((tween) => tween.kill());
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      animate();
    }, { threshold: .2 });
    observer.observe(stats);
    return () => { observer.disconnect(); tweens.forEach((tween) => tween.kill()); };
  }, []);

  return <section className="closing-experience" id="night-message" aria-labelledby="closing-title" data-reveal>
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
      <div className="closing-experience__actions"><a href="#collection" className="closing-experience__link">Enter the gallery <ArrowUpRight size={16} aria-hidden="true" /></a><a href="/register" className="closing-experience__link">Start your sky journal <ArrowUpRight size={16} aria-hidden="true" /></a></div>
      <dl ref={statsRef} className="closing-experience__stats" aria-label="AERIS collection statistics">
        {collectionStats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd><span aria-hidden="true" data-count-to={stat.value}>0</span><span className="visually-hidden">{stat.value}</span></dd></div>)}
      </dl>
    </div>
    <span className="closing-experience__credit">{closingPhoto.location} · {closingPhoto.year}</span>
  </section>;
}
