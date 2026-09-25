import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

function App() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // default
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-aeris-deepBlack text-aeris-warmWhite min-h-screen">
      <main className="w-full">
        {/* Placeholder for Hero */}
        <section className="h-screen w-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-8xl md:text-9xl tracking-wide uppercase">Aeris</h1>
            <p className="font-ui mt-6 text-xl text-aeris-mutedGray tracking-[0.2em] uppercase">Moments Above.</p>
          </div>
        </section>
        
        {/* Test scroll section */}
        <section className="h-screen w-full flex items-center justify-center bg-aeris-deepBlack">
          <h2 className="font-display text-6xl">Scroll down...</h2>
        </section>
      </main>
    </div>
  );
}

export default App;
