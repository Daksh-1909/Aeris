import type { SyntheticEvent } from 'react';

/** Replace failed remote/local photo candidates with the bundled neutral sky gradient. */
export function handleSkyImageFallback(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallback === 'true') return;
  image.dataset.fallback = 'true';
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.src = '/images/sky-placeholder.svg';
}
