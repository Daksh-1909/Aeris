import { ArrowUpRight, Menu } from 'lucide-react';
import { Brand } from './Brand';

export function Header() {
  return <header className="site-header">
    <Brand />
    <nav className="desktop-nav" aria-label="Main navigation">
      <a href="#collection">Collection</a><a href="#about">Our story</a>
    </nav>
    <a className="header-contact" href="mailto:hello@aeris.studio">Get in touch <ArrowUpRight size={15} /></a>
    <a className="mobile-menu" href="#collection" aria-label="Explore collection"><Menu size={21} /></a>
  </header>;
}
