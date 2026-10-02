import { useEffect, useState } from 'react';

type Appearance = 'auto' | 'dusk' | 'daylight';
const storageKey = 'aeris:appearance';

function readAppearance(): Appearance {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'dusk' || value === 'daylight' ? value : 'auto';
  } catch { return 'auto'; }
}

function applyAppearance(appearance: Appearance) {
  const daylight = appearance === 'daylight' || (appearance === 'auto' && window.matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = daylight ? 'daylight' : 'dusk';
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) themeColor.content = daylight ? '#F4F8F6' : '#0B1A24';
}

export function AppearanceControl() {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const sync = () => applyAppearance(appearance);
    sync();
    if (appearance === 'auto') media.addEventListener('change', sync);
    try {
      if (appearance === 'auto') localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, appearance);
    } catch { /* Appearance preference is optional when storage is disabled. */ }
    return () => media.removeEventListener('change', sync);
  }, [appearance]);

  return <label className="appearance-control">
    <span className="visually-hidden">Color theme</span>
    <select aria-label="Color theme" value={appearance} onChange={(event) => setAppearance(event.target.value as Appearance)}>
      <option value="auto">Auto</option>
      <option value="dusk">Dusk</option>
      <option value="daylight">Daylight</option>
    </select>
  </label>;
}
