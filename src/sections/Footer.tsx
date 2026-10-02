import { Brand } from '../components/Brand';

export function Footer() {
  return <footer className="site-footer site-footer--minimal">
    <Brand footer />
    <div className="footer-links">
      <nav aria-label="Explore AERIS"><h2>Explore</h2><a href="/#collection">Gallery</a><a href="/atlas">Cloud Atlas</a><a href="/planner">Shoot Planner</a></nav>
      <nav aria-label="Your account"><h2>Account</h2><a href="/login">Sign in</a><a href="/collections">Collections</a><a href="/favorites">Favorites</a></nav>
      <nav aria-label="Contact AERIS"><h2>Contact</h2><a href="/contact">Send a note</a><a href="mailto:hello@aeris.studio">Email the studio</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram <span aria-hidden="true">↗</span></a></nav>
    </div>
    <div className="footer-bottom"><small className="footer-copyright">© {new Date().getFullYear()} AERIS · Read the Sky</small><a className="footer-backtop" href="#top">Back to top ↑</a></div>
  </footer>;
}
