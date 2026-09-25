import { useEffect, useState } from 'react';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPhotographs } from '../services/galleryService';
import type { Photograph } from '../types/gallery';
import { GalleryImage } from '../components/GalleryImage';

gsap.registerPlugin(ScrollTrigger);

export function CloudsSection({ onOpen }: { onOpen: (photo: Photograph, photos: Photograph[]) => void }) {
  const [photos, setPhotos] = useState<Photograph[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => { void getPhotographs('Clouds').then(setPhotos); }, []);
  const [feature, ...studies] = photos;

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || photos.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 761px)', () => {
      if (track.scrollWidth <= viewport.clientWidth) return;
      viewport.classList.add('is-scroll-controlled');

      const horizontal = gsap.to(track, {
        x: () => -(track.scrollWidth - viewport.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: viewport,
          start: 'top top',
          end: () => `+=${track.scrollWidth - viewport.clientWidth}`,
          scrub: 1,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      Array.from(track.children).forEach((panel) => {
        gsap.fromTo(panel, { scale: 0.9, opacity: 0.58 }, {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'left 82%', end: 'center center', scrub: true },
        });
        gsap.to(panel, {
          scale: 0.9,
          opacity: 0.58,
          ease: 'none',
          scrollTrigger: { trigger: panel, containerAnimation: horizontal, start: 'center center', end: 'right 18%', scrub: true },
        });
      });
      ScrollTrigger.refresh();

      return () => viewport.classList.remove('is-scroll-controlled');
    });

    return () => media.revert();
  }, [photos]);

  return <section className="clouds-section" id="clouds" aria-labelledby="clouds-title">
    {feature && <div className="clouds-section__hero">
      <GalleryImage photo={feature} photos={photos} onOpen={onOpen} className="clouds-feature" imageWidth={2200} parallax metadata />
      <div className="clouds-section__identity"><p className="eyebrow">Field note · 02</p><h2 id="clouds-title">CLOUDS</h2><p>Somewhere between<br /><em>earth and infinity.</em></p></div>
      <span className="clouds-section__edge-note">Weather, light, and everything in between</span>
    </div>}
    {studies.length > 0 && <div className="cloud-studies">
      <div className="cloud-studies__heading"><p className="eyebrow">The cloud studies</p><span>{String(photos.length).padStart(2, '0')} collected moments</span></div>
      <div className="cloud-studies__viewport" ref={viewportRef} role="region" aria-label="Cloud photographs">
        <div className="cloud-studies__track" ref={trackRef}>{studies.map((photo, index) => <GalleryImage key={photo.id} photo={photo} photos={photos} onOpen={onOpen} className={`cloud-study cloud-study--${photo.aspect}`} imageWidth={1000} index={String(index + 2).padStart(2, '0')} parallax />)}</div>
      </div>
    </div>}
  </section>;
}
