import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './Brand';
import type { GalleryCategory } from '../types/gallery';

const categoryLinks: { label: string; category: GalleryCategory }[] = [
  { label: 'Sky', category: 'Sky' },
  { label: 'Clouds', category: 'Clouds' },
  { label: 'Nature', category: 'Nature' },
  { label: 'Gallery', category: 'All' },
];

export function Header({ category, onNavigate }: { category: GalleryCategory; onNavigate: (category: GalleryCategory) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const closeMenu = () => setMenuOpen(false);
  const selectCategory = (next: GalleryCategory) => {
    onNavigate(next);
    closeMenu();
  };

  return <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}${menuOpen ? ' site-header--open' : ''}`}>
    <div className="site-header__bar">
      <div onClick={closeMenu}><Brand /></div>
      <nav className="desktop-nav" aria-label="Main navigation">
        <a href="#top" data-cursor="magnetic">Home</a>
        {categoryLinks.map((link) => <a key={link.label} data-cursor="magnetic" href={link.category === 'Sky' ? '#sky' : link.category === 'Clouds' ? '#clouds' : link.category === 'Nature' ? '#nature' : '#collection'} className={category === link.category && link.category !== 'All' ? 'is-current' : ''} onClick={() => selectCategory(link.category)}>{link.label}</a>)}
        <a href="#about" data-cursor="magnetic">About</a>
      </nav>
      <a className="header-contact" data-cursor="arrow" href="mailto:hello@aeris.studio">Contact <ArrowUpRight size={15} /></a>
      <button className="mobile-menu" data-cursor="arrow" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation" inert={!menuOpen}>
      <a href="#top" onClick={closeMenu}>Home</a>
      {categoryLinks.map((link) => <a key={link.label} href={link.category === 'Sky' ? '#sky' : link.category === 'Clouds' ? '#clouds' : link.category === 'Nature' ? '#nature' : '#collection'} onClick={() => selectCategory(link.category)}>{link.label}</a>)}
      <a href="#about" onClick={closeMenu}>About</a>
      <a href="mailto:hello@aeris.studio" onClick={closeMenu}>Contact <ArrowUpRight size={15} /></a>
    </nav>
  </header>;
}
