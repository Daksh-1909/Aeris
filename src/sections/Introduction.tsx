import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageReveal } from '../components/ImageReveal';
import { imageSrcSet, imageUrl } from '../data/gallery';

gsap.registerPlugin(ScrollTrigger);

export function Introduction() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      const intro = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 74%', once: true },
      });
      intro
        .fromTo(section.querySelectorAll('.intro-line'),
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.14, ease: 'power2.out' },
        )
        .fromTo(section.querySelector('.intro__statement'),
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.28',
        )
        .fromTo(section.querySelectorAll('.intro__word'),
          { color: 'rgba(190, 190, 185, .45)' },
          { color: 'rgba(245, 243, 239, .94)', duration: 0.5, stagger: 0.08, ease: 'power1.out' },
          '-=0.35',
        );
    }, section);
    return () => context.revert();
  }, []);

  return <section className="introduction" id="light-and-landscape" ref={sectionRef} aria-labelledby="intro-title">
    <p className="eyebrow">Moments in the sky</p>
    <div className="intro__layout">
      <div className="intro__copy">
        <h2 id="intro-title"><span className="intro-line">Every cloud carries</span><span className="intro-line">a different story.</span><span className="intro-line intro-line--italic">Every light exists</span><span className="intro-line intro-line--italic">only once.</span></h2>
        <p className="intro__statement"><span className="intro__word">AERIS</span>{' '}<span className="intro__word">is</span>{' '}<span className="intro__word">a</span>{' '}<span className="intro__word">collection</span>{' '}<span className="intro__word">of</span>{' '}<span className="intro__word">moments</span><br /><span className="intro__word">found</span>{' '}<span className="intro__word">above</span>{' '}<span className="intro__word">us</span>{' '}<span className="intro__word">and</span>{' '}<span className="intro__word">around</span>{' '}<span className="intro__word">us.</span></p>
      </div>
      <figure className="intro__image-frame"><ImageReveal className="intro__image" image={imageUrl('photo-1500530855697-b586d89ba3ee', 1200)} srcSet={imageSrcSet('photo-1500530855697-b586d89ba3ee', [320, 640, 960, 1200])} sizes="(max-width: 760px) 78vw, 36vw" alt="Open sky falling into a quiet landscape" parallax /><figcaption>Light moves. The moment remains.</figcaption></figure>
    </div>
  </section>;
}
