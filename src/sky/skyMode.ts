export type SkyMode = 'scroll' | 'clock';
export type SkyModeChange = { mode: 'scroll' } | { mode: 'clock'; progress: number };

const eventName = 'aeris:sky-mode-change';

export function setSkyMode(change: SkyModeChange) {
  window.dispatchEvent(new CustomEvent<SkyModeChange>(eventName, { detail: change }));
}

export function listenForSkyModeChange(listener: (change: SkyModeChange) => void) {
  const handle = (event: Event) => listener((event as CustomEvent<SkyModeChange>).detail);
  window.addEventListener(eventName, handle);
  return () => window.removeEventListener(eventName, handle);
}
