import { DailySky } from '../features/sky-clock/DailySky';
import type { OpenPhotograph } from '../types/gallery';
import { ClosingExperience } from './ClosingExperience';

export function NightChapter({ onOpen }: { onOpen: OpenPhotograph }) {
  return <section className="night-chapter" id="closing" aria-label="Night chapter">
    <DailySky onOpen={onOpen} />
    <ClosingExperience />
  </section>;
}
