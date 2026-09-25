import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ImageReveal } from '../components/ImageReveal';

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
        );
    }, section);
    return () => context.revert();
  }, []);

  return <section className="introduction" ref={sectionRef} aria-labelledby="intro-title">
    <p className="eyebrow">Moments in the sky</p>
    <div className="intro__layout">
      <div className="intro__copy">
        <h2 id="intro-title"><span className="intro-line">Every cloud carries</span><span className="intro-line">a different story.</span><span className="intro-line intro-line--italic">Every light exists</span><span className="intro-line intro-line--italic">only once.</span></h2>
        <p className="intro__statement">AERIS is a collection of moments<br />found above us and around us.</p>
      </div>
      <figure className="intro__image-frame"><ImageReveal className="intro__image" image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85" alt="Open sky falling into a quiet landscape" parallax /><figcaption>Light moves. The moment remains.</figcaption></figure>
    </div>
  </section>;
}
