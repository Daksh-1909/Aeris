import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Header } from './components/Header';
import { Lightbox } from './components/Lightbox';
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Introduction } from './sections/Introduction';
import { SkySection } from './sections/SkySection';
import { CloudsSection } from './sections/CloudsSection';
import { NatureSection } from './sections/NatureSection';
import { Collection } from './sections/Collection';
import { Manifesto } from './sections/Manifesto';
import { ClosingExperience } from './sections/ClosingExperience';
import { Footer } from './sections/Footer';
import type { Photograph } from './types/gallery';
import type { GalleryCategory } from './types/gallery';
import { startScrollExperience, startScrollReveals } from './animations/scroll';

export default function App() {
  const [selection, setSelection] = useState<{ photo: Photograph; photos: Photograph[] } | null>(null);
  const [category, setCategory] = useState<GalleryCategory>('All');
  const [isLoading, setIsLoading] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const closeLightbox = useCallback(() => setSelection(null), []);
  const openLightbox = useCallback((photo: Photograph, photos: Photograph[]) => setSelection({ photo, photos }), []);
  const changeLightboxPhoto = useCallback((photo: Photograph) => setSelection((current) => current ? { ...current, photo } : null), []);

  useEffect(() => {
    const stopScroll = startScrollExperience();
    const stopReveals = pageRef.current ? startScrollReveals(pageRef.current) : () => undefined;
    return () => { stopReveals(); stopScroll(); };
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const image = page.querySelector('.hero__image');
    const nav = page.querySelector('.site-header');
    const heading = heroCopyRef.current?.querySelector('h1');
    const slogan = heroCopyRef.current?.querySelector('.hero__slogan');
    const note = heroCopyRef.current?.querySelector('.hero__note');
    const explore = heroCopyRef.current?.querySelector('.hero__explore');
    if (!image || !nav || !heading || !slogan || !note || !explore) return;

    const timeline = gsap.timeline({ onComplete: () => setIsLoading(false) });
    timeline
      .set(image, { scale: 1.08, transformOrigin: '50% 50%' })
      .set(nav, { autoAlpha: 0, y: -8 })
      .set([heading, slogan, note, explore], { autoAlpha: 0, y: 22 })
      .to(image, { scale: 1, duration: 1.15, ease: 'power2.out' }, 0)
      .to('.loading-screen', { autoAlpha: 0, yPercent: -8, duration: 0.48, ease: 'power2.inOut' }, 0.42)
      .to(nav, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 0.98)
      .to(heading, { autoAlpha: 1, y: 0, duration: 0.42, ease: 'power2.out' }, 1.04)
      .to(slogan, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.36)
      .to(note, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.43)
      .to(explore, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 1.52);
    return () => { timeline.kill(); };
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const hero = root.querySelector<HTMLElement>('.hero');
    const image = root.querySelector<HTMLElement>('.hero__image');
    const copy = heroCopyRef.current;
    const veil = root.querySelector<HTMLElement>('.hero__veil');
    if (!hero || !image || !copy || !veil || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 },
      })
        .to(image, { scale: 0.97, ease: 'none' }, 0)
        .to(copy, { y: -64, autoAlpha: 0.38, ease: 'none' }, 0)
        .to(veil, { opacity: 0.62, ease: 'none' }, 0);
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className={isLoading ? '' : 'page--ready'}>
      <CustomCursor />
      <Header category={category} onNavigate={setCategory} />
      <main>
        <Hero copyRef={heroCopyRef} />
        <Introduction />
        <SkySection onOpen={openLightbox} />
        <CloudsSection onOpen={openLightbox} />
        <NatureSection onOpen={openLightbox} />
        <Collection category={category} onCategoryChange={setCategory} onOpen={openLightbox} />
        <Manifesto />
        <ClosingExperience />
      </main>
      <Footer />
      {selection && <Lightbox photos={selection.photos} active={selection.photo} onChange={changeLightboxPhoto} onClose={closeLightbox} />}
      {isLoading && <LoadingScreen />}
    </div>
  );
}
