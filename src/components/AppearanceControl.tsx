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

export function AppearanceControl({ placement = 'header' }: { placement?: 'header' | 'menu' }) {
  const [appearance, setAppearance] = useState<Appearance>(readAppearance);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onStoredChange = (event: Event) => setAppearance((event as CustomEvent<Appearance>).detail);
    const sync = () => applyAppearance(appearance);
    sync();
    if (appearance === 'auto') media.addEventListener('change', sync);
    window.addEventListener('aeris:appearance-change', onStoredChange);
    try {
      if (appearance === 'auto') localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, appearance);
    } catch { /* Appearance preference is optional when storage is disabled. */ }
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('aeris:appearance-change', onStoredChange);
    };
  }, [appearance]);

  return <label className={`appearance-control appearance-control--${placement}`}>
    <span className="visually-hidden">Color theme</span>
    <select aria-label="Color theme" value={appearance} onChange={(event) => {
      const next = event.target.value as Appearance;
      setAppearance(next);
      window.dispatchEvent(new CustomEvent('aeris:appearance-change', { detail: next }));
    }}>
      <option value="auto">Auto theme</option>
      <option value="dusk">Dusk</option>
      <option value="daylight">Daylight</option>
    </select>
  </label>;
}
