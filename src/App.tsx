import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Header } from './components/Header';
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Introduction } from './sections/Introduction';
import { WhatIsAeris } from './sections/WhatIsAeris';
import { DailySky } from './features/sky-clock/DailySky';
import { SkySection } from './sections/SkySection';
import { CloudsSection } from './sections/CloudsSection';
import { NatureSection } from './sections/NatureSection';
import { Collection } from './sections/Collection';
import { Manifesto } from './sections/Manifesto';
import { ClosingExperience } from './sections/ClosingExperience';
import { Footer } from './sections/Footer';
import { ChapterRail } from './components/ChapterRail';
import { SkyTimeline } from './components/SkyTimeline';
import type { Photograph } from './types/gallery';
import type { GalleryCategory } from './types/gallery';
import { setScrollEffectsReduced, startScrollExperience, startScrollReveals } from './animations/scroll';
import { isFavorite, recordView, toggleFavorite } from './services/memberStore';

const Lightbox = lazy(() => import('./components/Lightbox').then((module) => ({ default: module.Lightbox })));

export default function App() {
  const [selection, setSelection] = useState<{ photo: Photograph; photos: Photograph[] } | null>(null);
  const [category, setCategory] = useState<GalleryCategory>('Featured');
  const [memberRevision, setMemberRevision] = useState(0);
  const [isLoading, setIsLoading] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pageRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const closeLightbox = useCallback(() => setSelection(null), []);
  const openLightbox = useCallback((photo: Photograph, photos: Photograph[]) => { recordView(photo); setSelection({ photo, photos }); }, []);
  const changeLightboxPhoto = useCallback((photo: Photograph) => setSelection((current) => current ? { ...current, photo } : null), []);

  useEffect(() => {
    const onMemberChange = () => setMemberRevision((value) => value + 1);
    window.addEventListener('aeris:member-change', onMemberChange);
    return () => window.removeEventListener('aeris:member-change', onMemberChange);
  }, []);

  useEffect(() => {
    const stopScroll = startScrollExperience();
    const stopReveals = pageRef.current ? startScrollReveals(pageRef.current) : () => undefined;
    return () => { stopReveals(); stopScroll(); };
  }, []);

  useEffect(() => {
    let userPrefersReducedEffects = false;
    try { userPrefersReducedEffects = localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
    setScrollEffectsReduced(userPrefersReducedEffects || selection !== null);
  }, [selection]);

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
    const explore = heroCopyRef.current?.querySelector('.hero__actions');
    if (!image || !nav || !heading || !slogan || !note || !explore) return;

    const timeline = gsap.timeline({ onComplete: () => setIsLoading(false) });
    timeline
      .set(image, { scale: 1.08, transformOrigin: '50% 50%' })
      .set(nav, { autoAlpha: 0, y: -8 })
      .set([heading, slogan, note, explore], { autoAlpha: 0, y: 22 })
      .to(image, { scale: 1, duration: 0.78, ease: 'power2.out' }, 0)
      .to('.loading-screen', { autoAlpha: 0, yPercent: -5, duration: 0.28, ease: 'power2.inOut' }, 0.34)
      .to(nav, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.48)
      .to(heading, { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power2.out' }, 0.50)
      .to(slogan, { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out' }, 0.62)
      .to(note, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.66)
      .to(explore, { autoAlpha: 1, y: 0, duration: 0.15, ease: 'power2.out' }, 0.69);
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
    <div ref={pageRef} data-member-revision={memberRevision} className={isLoading ? '' : 'page--ready'}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <CustomCursor />
      <ChapterRail />
      <Header category={category} onNavigate={setCategory} />
      <main ref={mainRef} id="main-content" tabIndex={-1}>
        <SkyTimeline scrollRootRef={mainRef} />
        <Hero copyRef={heroCopyRef} />
        <DailySky onOpen={openLightbox} />
        <Introduction />
        <WhatIsAeris />
        <SkySection onOpen={openLightbox} />
        <CloudsSection onOpen={openLightbox} />
        <NatureSection onOpen={openLightbox} />
        <Collection category={category} onCategoryChange={setCategory} onOpen={openLightbox} />
        <Manifesto />
        <ClosingExperience />
      </main>
      <Footer />
      {selection && <Suspense fallback={<p role="status" className="lightbox-loading">Opening photograph…</p>}><Lightbox photos={selection.photos} active={selection.photo} onChange={changeLightboxPhoto} onClose={closeLightbox} favorite={isFavorite(selection.photo.id)} onToggleFavorite={(photo) => { toggleFavorite(photo.id); setMemberRevision((value) => value + 1); }} /></Suspense>}
      {isLoading && <LoadingScreen />}
    </div>
  );
}
