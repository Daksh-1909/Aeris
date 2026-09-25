import { useState } from 'react';
import { Header } from './components/Header';
import { Lightbox } from './components/Lightbox';
import { Hero } from './sections/Hero';
import { Collection } from './sections/Collection';
import { Manifesto } from './sections/Manifesto';
import { Footer } from './sections/Footer';
import type { Photograph } from './types/gallery';

export default function App() {
  const [selection, setSelection] = useState<{ photo: Photograph; photos: Photograph[] } | null>(null);
  return <><Header /><main><Hero /><Collection onOpen={(photo, photos) => setSelection({ photo, photos })} /><Manifesto /></main><Footer />{selection && <Lightbox photos={selection.photos} active={selection.photo} onChange={(photo) => setSelection({ ...selection, photo })} onClose={() => setSelection(null)} />}</>;
}
