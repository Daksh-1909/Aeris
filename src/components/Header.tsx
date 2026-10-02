import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import { AppearanceControl } from './AppearanceControl';
import { SkyClock } from '../features/sky-clock/SkyClock';
import type { GalleryCategory } from '../types/gallery';

const categoryLinks: { label: string; category: GalleryCategory }[] = [
  { label: 'Sky', category: 'Sky' },
  { label: 'Clouds', category: 'Cloud' },
  { label: 'Nature', category: 'Nature' },
  { label: 'Gallery', category: 'All' },
];

export function Header({ category, onNavigate }: { category: GalleryCategory; onNavigate: (category: GalleryCategory) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const bodyOverflow = document.body.style.overflow;
    const firstFocusTarget = mobileNavRef.current?.querySelector<HTMLElement>('a,button,select,[tabindex="0"]');
    const focusFrame = window.requestAnimationFrame(() => firstFocusTarget?.focus());
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key === 'Tab' && mobileNavRef.current) {
        const targets = [...mobileNavRef.current.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),select:not(:disabled),[tabindex="0"]')];
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

  const closeMenu = () => setMenuOpen(false);
  const selectCategory = (next: GalleryCategory) => {
    onNavigate(next);
    closeMenu();
  };

  return <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}${menuOpen ? ' site-header--open' : ''}`}>
    <div className="site-header__bar">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#top" data-cursor="magnetic">Home</a>
        {categoryLinks.map((link) => <a key={link.label} data-cursor="magnetic" href={link.category === 'Sky' ? '#sky' : link.category === 'Cloud' ? '#clouds' : link.category === 'Nature' ? '#nature' : '#collection'} className={category === link.category && link.category !== 'All' ? 'is-current' : ''} onClick={() => selectCategory(link.category)}>{link.label}</a>)}
        <a href="/atlas">Cloud Atlas</a><a href="/planner">Planner</a><a href="/collections">Collections</a>
        <a href="#about" data-cursor="magnetic">About</a>
      </nav>
      <SkyClock />
      <AppearanceControl placement="header" />
      <a className="header-contact" data-cursor="arrow" href="/login">Profile / Sign in <ArrowUpRight size={15} /></a>
      <button ref={menuButtonRef} className="mobile-menu" data-cursor="arrow" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <nav ref={mobileNavRef} className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" inert={!menuOpen}>
      <a href="#top" onClick={closeMenu}>Home</a>
      {categoryLinks.map((link) => <a key={link.label} href={link.category === 'Sky' ? '#sky' : link.category === 'Cloud' ? '#clouds' : link.category === 'Nature' ? '#nature' : '#collection'} onClick={() => selectCategory(link.category)}>{link.label}</a>)}
      <a href="/atlas" onClick={closeMenu}>Cloud Atlas</a><a href="/planner" onClick={closeMenu}>Planner</a><a href="/collections" onClick={closeMenu}>Collections</a>
      <a href="#about" onClick={closeMenu}>About</a>
      <AppearanceControl placement="menu" />
      <a href="/login" onClick={closeMenu}>Profile / Sign in <ArrowUpRight size={15} /></a>
    </nav>
  </header>;
}
