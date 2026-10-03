import { ArrowDown } from 'lucide-react';

export function Hero() {
  return <section className="hero hero--static" id="top" aria-labelledby="hero-title">
    <div className="hero__copy">
      <p className="hero__eyebrow">SUNRISE <span aria-hidden="true">—</span> 05:48</p>
      <h1 id="hero-title">Read the <em>sky.</em></h1>
      <p className="hero__description">A journal of light, cloud and weather. Begin where the day begins.</p>
      <a className="hero__explore" href="#collection">Explore the sky <ArrowDown size={15} aria-hidden="true" /></a>
    </div>
  </section>;
}
