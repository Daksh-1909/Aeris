import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Header } from './components/Header';
import { Lightbox } from './components/Lightbox';
import { LoadingScreen } from './components/LoadingScreen';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Collection } from './sections/Collection';
import { Manifesto } from './sections/Manifesto';
import { Footer } from './sections/Footer';
import type { Photograph } from './types/gallery';
import type { GalleryCategory } from './types/gallery';
import { startScrollExperience, useScrollReveals } from './animations/scroll';

export default function App() {
  const [selection, setSelection] = useState<{ photo: Photograph; photos: Photograph[] } | null>(null);
  const [category, setCategory] = useState<GalleryCategory>('All');
  const [isLoading, setIsLoading] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stopScroll = startScrollExperience();
    const stopReveals = pageRef.current ? useScrollReveals(pageRef.current) : () => undefined;
    return () => { stopReveals(); stopScroll(); };
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeline = gsap.timeline({ onComplete: () => setIsLoading(false) });
    timeline.to('.loading-screen', { autoAlpha: 0, yPercent: -8, duration: reduceMotion ? 0.12 : 0.55, delay: reduceMotion ? 0 : 0.2, ease: 'power2.inOut' });
    return () => { timeline.kill(); };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading || !heroCopyRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(heroCopyRef.current, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power2.out' });
  }, [isLoading]);

  return <div ref={pageRef} className={isLoading ? '' : 'page--ready'}><CustomCursor /><Header category={category} onNavigate={(next) => setCategory(next)} /><main><Hero copyRef={heroCopyRef} /><Collection category={category} onCategoryChange={setCategory} onOpen={(photo, photos) => setSelection({ photo, photos })} /><Manifesto /></main><Footer />{selection && <Lightbox photos={selection.photos} active={selection.photo} onChange={(photo) => setSelection({ ...selection, photo })} onClose={() => setSelection(null)} />}{isLoading && <LoadingScreen />}</div>;
}
