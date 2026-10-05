import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { ThemeSwitch, ThemeSwitchFilters } from './ThemeSwitch';
import { setScrollEffectsReduced } from '../animations/scroll';

type Theme = 'daylight' | 'dusk';

function getInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem('aeris:theme');
    if (savedTheme === 'daylight' || savedTheme === 'dusk') return savedTheme;
  } catch { /* Storage can be disabled. */ }
  return document.documentElement.dataset.theme === 'daylight' ? 'daylight' : 'dusk';
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('aeris:theme', theme); } catch { /* Storage can be disabled. */ }
  }, [theme]);

  useEffect(() => {
    const update = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const bodyOverflow = document.body.style.overflow;
    const firstFocusTarget = mobileNavRef.current?.querySelector<HTMLElement>('a,button,input,select,[tabindex="0"]');
    const focusFrame = window.requestAnimationFrame(() => firstFocusTarget?.focus());
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key === 'Tab' && mobileNavRef.current) {
        const targets = [...mobileNavRef.current.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')];
        const first = targets[0];
        const last = targets.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = bodyOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    let reduceEffects = menuOpen;
    try { reduceEffects ||= localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { /* Storage can be disabled. */ }
    setScrollEffectsReduced(reduceEffects);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  return <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}${menuOpen ? ' site-header--open' : ''}`} data-layer="header">
    <div className="site-header__bar">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">
        <a className="desktop-nav__brand" href="#top" data-cursor="magnetic">AERIS</a>
        <a href="#cloud-journey" data-cursor="magnetic">Gallery</a>
        <a href="/atlas">Cloud Atlas</a><a href="/planner">Planner</a><a href="/collections">Collections</a>
        <a className="desktop-nav__sign-in" href="/login">Sign in</a>
        <span className="theme-switch-control theme-switch-control--desktop">
          <ThemeSwitch theme={theme} onChange={setTheme} />
        </span>
      </nav>
      <button ref={menuButtonRef} className="mobile-menu" data-cursor="arrow" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <nav ref={mobileNavRef} className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" inert={!menuOpen}>
      <span className="theme-switch-control theme-switch-control--mobile">
        <ThemeSwitch theme={theme} onChange={setTheme} />
      </span>
      <a href="#top" onClick={closeMenu}>Home</a>
      <a href="#cloud-journey" onClick={closeMenu}>Gallery</a>
      <a href="/atlas" onClick={closeMenu}>Cloud Atlas</a><a href="/planner" onClick={closeMenu}>Planner</a><a href="/collections" onClick={closeMenu}>Collections</a>
      <a href="/login" onClick={closeMenu}>Sign in <ArrowUpRight size={15} /></a>
    </nav>
    <ThemeSwitchFilters />
  </header>;
}
