import { useEffect, useState } from 'react';
import './skyClock.css';

type Override = 'auto' | 'day' | 'night';
type SkyState = 'dawn' | 'day' | 'golden' | 'dusk' | 'night';
const storageKey = 'aeris:sky-mode';
function stateAt(date: Date): SkyState {
  const hour = date.getHours();
  if (hour < 5 || hour >= 21) return 'night';
  if (hour < 7) return 'dawn';
  if (hour < 16) return 'day';
  if (hour < 19) return 'golden';
  return 'dusk';
}
function readOverride(): Override {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'day' || value === 'night' ? value : 'auto';
  } catch { return 'auto'; }
}
function applySky(override: Override, date = new Date()) {
  const state = override === 'auto' ? stateAt(date) : override;
  document.documentElement.dataset.skyState = state;
}

export function SkyClock() {
  const [override, setOverride] = useState<Override>(readOverride);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    applySky(override, now);
    try { if (override === 'auto') localStorage.removeItem(storageKey); else localStorage.setItem(storageKey, override); } catch { /* Storage can be disabled. */ }
  }, [override, now]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const state = override === 'auto' ? stateAt(now) : override;
  const hour = now.getHours();
  const indicator = override === 'auto' && ((hour >= 5 && hour < 8) || (hour >= 16 && hour < 19)) ? 'Golden hour now' : state === 'night' ? 'Night sky' : state === 'dawn' ? 'First light' : state === 'dusk' ? 'Blue hour' : 'Daylight';
  return <div className="sky-clock-control"><a href="/planner" aria-label={indicator + ', open the Shoot Planner'}>{indicator}</a><label><span className="visually-hidden">Sky theme</span><select aria-label="Sky Clock theme" title="Sky Clock theme" value={override} onChange={(event) => setOverride(event.target.value as Override)}><option value="auto">Auto</option><option value="day">Day</option><option value="night">Night</option></select></label></div>;
}
