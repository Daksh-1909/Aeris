import { ArrowDown } from 'lucide-react';

export function Hero() {
  return <section className="hero" id="top">
    <img className="hero__image" src="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=2400&q=90" alt="First light spilling across a quiet mountain valley" />
    <div className="hero__veil" />
    <div className="hero__copy"><p className="eyebrow">A photographic journal of the natural world</p><h1>Moments<br /><em>above</em> everything.</h1><p className="hero__note">A study of light, atmosphere<br />and the spaces in between.</p></div>
    <div className="hero__bottom"><span>Independent photography · Est. 2018</span><a href="#collection">Scroll to explore <ArrowDown size={14} /></a><span>45° 26′ N &nbsp; 12° 20′ E</span></div>
    <span className="hero__index">01 <i /> 06</span>
  </section>;
}
