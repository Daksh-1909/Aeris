import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { setSkyMode } from '../../sky/skyMode';
import { skyPhaseProgress } from '../../sky/timeline';
import './skyClock.css';

type Override = 'auto' | 'dawn' | 'day' | 'golden' | 'dusk' | 'night';
const storageKey = 'aeris:sky-mode';
function readOverride(): Override {
  try {
    const value = localStorage.getItem(storageKey);
    return value === 'dawn' || value === 'day' || value === 'golden' || value === 'dusk' || value === 'night' ? value : 'auto';
  } catch { return 'auto'; }
}
export function SkyClock() {
  const [override, setOverride] = useState<Override>(readOverride);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    setSkyMode(override === 'auto' ? { mode: 'scroll' } : { mode: 'clock', progress: skyPhaseProgress[override] });
    try { if (override === 'auto') localStorage.removeItem(storageKey); else localStorage.setItem(storageKey, override); } catch { /* Storage can be disabled. */ }
  }, [override]);
  const indicator = override === 'auto' ? 'Scroll' : override === 'golden' ? 'Golden' : override[0].toUpperCase() + override.slice(1);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  return <div className="sky-clock-control">
    <button ref={triggerRef} className="sky-clock-pill" type="button" aria-controls="sky-phase-options" aria-expanded={open} onClick={() => setOpen((value) => !value)}>Sky <span>{indicator}</span><ChevronDown size={13} aria-hidden="true" /></button>
    {override !== 'auto' && <button className="sky-clock-back" type="button" onClick={() => setOverride('auto')}>Back to scroll</button>}
    {open && <div id="sky-phase-options" className="sky-clock-popover" role="group" aria-label="Choose sky phase">{(['auto', 'dawn', 'day', 'golden', 'dusk', 'night'] as const).map((phase) => <button key={phase} type="button" aria-pressed={override === phase} onClick={() => { setOverride(phase); setOpen(false); triggerRef.current?.focus(); }}>{phase === 'auto' ? 'Auto · scroll' : phase === 'golden' ? 'Golden' : phase[0].toUpperCase() + phase.slice(1)}</button>)}</div>}
  </div>;
}
