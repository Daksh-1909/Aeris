import { Brand } from '../components/Brand';
import { useEffect, useState } from 'react';
import { resumeScrollExperience, setScrollEffectsReduced } from '../animations/scroll';

export function Footer() {
  const [reduceEffects, setReduceEffects] = useState(() => {
    try { return localStorage.getItem('aeris:reduce-effects') === 'true'; } catch { return false; }
  });
  useEffect(() => {
    document.documentElement.dataset.reduceEffects = String(reduceEffects);
    try { localStorage.setItem('aeris:reduce-effects', String(reduceEffects)); } catch { /* Storage can be disabled. */ }
  }, [reduceEffects]);
  const toggleReduceEffects = () => {
    const nextValue = !reduceEffects;
    setReduceEffects(nextValue);
    document.documentElement.dataset.reduceEffects = String(nextValue);
    try { localStorage.setItem('aeris:reduce-effects', String(nextValue)); } catch { /* Storage can be disabled. */ }
    setScrollEffectsReduced(nextValue);
    if (!nextValue) resumeScrollExperience();
    window.dispatchEvent(new CustomEvent('aeris:reduce-effects-change', { detail: nextValue }));
  };
  return <footer className="site-footer site-footer--minimal">
    <Brand footer />
    <div className="footer-links">
      <nav aria-label="Explore AERIS"><h2>Explore</h2><a href="/#collection">Gallery</a><a href="/atlas">Cloud Atlas</a><a href="/planner">Shoot Planner</a></nav>
      <nav aria-label="Your account"><h2>Account</h2><a href="/login">Sign in</a><a href="/collections">Collections</a><a href="/favorites">Favorites</a></nav>
      <nav aria-label="Contact AERIS"><h2>Contact</h2><a href="/contact">Send a note</a><a href="mailto:hello@aeris.studio">Email the studio</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a></nav>
    </div>
    <div className="footer-bottom"><small className="footer-copyright">© {new Date().getFullYear()} AERIS · Read the Sky · v0.1 · 2026-10-03</small><small className="moon-credit">Moon texture: <a href="https://svs.gsfc.nasa.gov/4720/" target="_blank" rel="noreferrer">NASA Scientific Visualization Studio · CGI Moon Kit</a></small><button className="footer-effects-toggle" type="button" aria-pressed={reduceEffects} onClick={toggleReduceEffects}>Reduce effects: {reduceEffects ? 'On' : 'Off'}</button><a className="footer-backtop" href="#top">Back to top ↑</a></div>
  </footer>;
}
