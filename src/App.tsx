import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Menu, X } from 'lucide-react';
import { imageUrl, photographs } from './data/gallery';
import type { GalleryCategory } from './types/gallery';

const categories: GalleryCategory[] = ['All', 'Cloud', 'Sky', 'Nature'];
const featuredPhotographs = photographs.filter((photo) => ['01', '05', '07', '02', '09', '04'].includes(photo.id));

export default function App() {
  const [category, setCategory] = useState<GalleryCategory>('All');
  const [menuOpen, setMenuOpen] = useState(false);
  const visiblePhotographs = category === 'All'
    ? featuredPhotographs
    : featuredPhotographs.filter((photo) => photo.category === category);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#" aria-label="AERIS home">AERIS<span>®</span></a>
        <p className="header-note">A field guide to the sky<br />and the things beneath it.</p>
        <nav className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Main navigation">
          <a href="#field-notes" onClick={closeMenu}>Field notes <span>01</span></a>
          <a href="#about" onClick={closeMenu}>About <span>02</span></a>
        </nav>
        <a className="header-cta" href="#field-notes">Explore the archive <ArrowUpRight size={15} aria-hidden="true" /></a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> Independent sky journal · Est. 2024</p>
            <h1 id="hero-title">LOOK<br />UP<span className="hero-period">.</span></h1>
            <p className="hero-description">A little more sky in your everyday.<br />Stories, studies, and passing weather.</p>
            <a className="hero-link" href="#field-notes">Find your piece of sky <ArrowDownRight size={19} aria-hidden="true" /></a>
            <div className="hero-stamp" aria-hidden="true">
              <span>SKY<br />IS<br />NEVER<br />THE<br />SAME</span>
              <span className="stamp-star">✳</span>
            </div>
          </div>
          <figure className="hero-image-frame">
            <img
              src={imageUrl('photo-1470770841072-f978cf4d019e', 1600)}
              alt="Clouds gathering above a quiet alpine lake"
              fetchPriority="high"
            />
            <figcaption><span>FIG. 001</span><span>Dolomites, IT · 46°N 11°E</span></figcaption>
            <span className="image-index" aria-hidden="true">01 / 06</span>
          </figure>
          <div className="hero-side-label" aria-hidden="true">OBSERVATION IS A FORM OF CARE — AERIS FIELD GUIDE</div>
        </section>

        <div className="ticker" aria-label="Look up. Stay awhile. The sky is doing something.">
          <div className="ticker-track" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index}>LOOK UP <i>✳</i> STAY AWHILE <i>✳</i> THE SKY IS DOING SOMETHING <i>✳</i></span>
            ))}
          </div>
        </div>

        <section className="field-notes section-wrap" id="field-notes" aria-labelledby="field-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">AERIS ARCHIVE / VOL. 01</p>
              <h2 id="field-title">Field notes<span>.</span></h2>
            </div>
            <p className="section-intro">Small reminders that there is a whole world<br className="desktop-break" /> happening above us.</p>
          </div>

          <div className="archive-bar">
            <div className="filter-list" role="group" aria-label="Filter field notes by subject">
              {categories.map((item) => (
                <button
                  className={category === item ? 'filter-button is-active' : 'filter-button'}
                  key={item}
                  type="button"
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <span className="archive-count">SHOWING {String(visiblePhotographs.length).padStart(2, '0')} / 06</span>
          </div>

          <div className="photo-grid">
            {visiblePhotographs.map((photo, index) => (
              <article className={`photo-card photo-card--${index + 1}`} key={photo.id}>
                <div className="photo-image">
                  <img src={imageUrl(photo.image, 960)} alt={photo.description ?? photo.title} loading="lazy" />
                  <span className="photo-number">A—{photo.id}</span>
                  <span className="photo-arrow" aria-hidden="true"><ArrowUpRight size={20} /></span>
                </div>
                <div className="photo-meta">
                  <div><span className="photo-category">{photo.category} STUDY</span><h3>{photo.title}</h3></div>
                  <span className="photo-location">{photo.location}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-band" id="about" aria-labelledby="about-title">
          <div className="about-mark" aria-hidden="true">A.</div>
          <div className="about-copy">
            <p className="eyebrow">A NOTE FROM AERIS</p>
            <h2 id="about-title">Not everything<br />needs a screen.<br /><span>Some things just need a look.</span></h2>
          </div>
          <p className="about-footnote">AERIS IS AN INDEPENDENT JOURNAL FOR THE SKY-CURIOUS. MADE SLOWLY, ON EARTH.</p>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#" aria-label="AERIS home">AERIS<span>®</span></a>
        <p>Keep your eyes on the sky.</p>
        <a className="back-to-top" href="#main-content">BACK TO TOP ↑</a>
        <span className="footer-copy">© AERIS 2024—26</span>
      </footer>
    </>
  );
}
