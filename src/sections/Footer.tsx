import { Brand } from '../components/Brand';

export function Footer() {
  return <footer className="site-footer site-footer--minimal">
    <Brand footer />
    <nav className="footer-nav" aria-label="Footer navigation">
      <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a>
      <a href="#collection">Gallery</a>
      <a href="#about">About</a>
    </nav>
    <small className="footer-copyright">© {new Date().getFullYear()}</small>
  </footer>;
}
