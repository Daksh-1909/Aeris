import { useEffect } from 'react';
import { Header } from './components/Header';
import { CustomCursor } from './components/CustomCursor';
import { SkyJourney } from './sky-journey/SkyJourney';
import { CloudAssetDebugPage } from './sky-journey/cloud/CloudAssetDebugPage';
import { Footer } from './sections/Footer';
import { startScrollExperience } from './animations/scroll';

export default function App() {
  const cloudDebugMode = import.meta.env.DEV && new URLSearchParams(window.location.search).has('cloud-debug');

  useEffect(() => {
    if (cloudDebugMode) return;
    return startScrollExperience();
  }, [cloudDebugMode]);

  if (cloudDebugMode) return <CloudAssetDebugPage />;

  return (
    <div className="page--ready">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <CustomCursor />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <SkyJourney />
        <section id="cloud-journey" aria-label="Cloud journey" />
      </main>
      <Footer />
    </div>
  );
}
