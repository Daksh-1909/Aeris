import { ArrowUpRight } from 'lucide-react';
import { Brand } from '../components/Brand';
export function Footer() {
  return <footer className="site-footer"><div className="footer-top"><div><p className="eyebrow">For print, projects & kind words</p><a className="footer-email" href="mailto:hello@aeris.studio">Let’s find<br /><em>the light.</em><ArrowUpRight /></a></div><div className="footer-side"><a href="mailto:hello@aeris.studio">hello@aeris.studio</a><a href="#collection">Instagram <ArrowUpRight size={13} /></a></div></div><div className="footer-bottom"><Brand footer /><span>© 2024 AERIS Studio</span><a href="#top">Back to beginning ↑</a></div></footer>;
}
