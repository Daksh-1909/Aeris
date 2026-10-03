import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { CustomCursor } from './components/CustomCursor';
import { SkyJourney } from './sky-journey/SkyJourney';
import { Introduction } from './sections/Introduction';
import { WhatIsAeris } from './sections/WhatIsAeris';
import { SkySection } from './sections/SkySection';
import { CloudsSection } from './sections/CloudsSection';
import { GoldenHourSection } from './sections/GoldenHourSection';
import { NatureSection } from './sections/NatureSection';
import { Collection } from './sections/Collection';
import { Manifesto } from './sections/Manifesto';
import { NightChapter } from './sections/NightChapter';
import { Footer } from './sections/Footer';
import type { Photograph } from './types/gallery';
import type { GalleryCategory } from './types/gallery';
import { setScrollEffectsReduced, startScrollExperience, startScrollReveals } from './animations/scroll';
import { isFavorite, recordView, toggleFavorite } from './services/memberStore';

const Lightbox = lazy(() => import('./components/Lightbox').then((module) => ({ default: module.Lightbox })));

export default function App() {
  const [selection, setSelection] = useState<{ photo: Photograph; photos: Photograph[] } | null>(null);
  const [category, setCategory] = useState<GalleryCategory>('Featured');
  const [memberRevision, setMemberRevision] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);
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


  return (
    <div ref={pageRef} data-member-revision={memberRevision} className="page--ready">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <CustomCursor />
      <Header category={category} onNavigate={setCategory} />
      <main id="main-content" tabIndex={-1}>
        <SkyJourney />
        <Introduction />
        <WhatIsAeris />
        <SkySection onOpen={openLightbox} />
        <CloudsSection onOpen={openLightbox} />
        <GoldenHourSection onOpen={openLightbox} />
        <NatureSection onOpen={openLightbox} />
        <Collection category={category} onCategoryChange={setCategory} onOpen={openLightbox} />
        <Manifesto />
        <NightChapter onOpen={openLightbox} />
      </main>
      <Footer />
      {selection && <Suspense fallback={<p role="status" className="lightbox-loading">Opening photograph…</p>}><Lightbox photos={selection.photos} active={selection.photo} onChange={changeLightboxPhoto} onClose={closeLightbox} favorite={isFavorite(selection.photo.id)} onToggleFavorite={(photo) => { toggleFavorite(photo.id); setMemberRevision((value) => value + 1); }} /></Suspense>}
    </div>
  );
}
