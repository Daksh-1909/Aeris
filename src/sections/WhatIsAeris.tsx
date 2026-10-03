import { photographs, imageSrcSet, imageUrl } from '../data/gallery';

const stats = [
  { value: String(photographs.length).padStart(2, '0'), label: 'moments collected' },
  { value: String(new Set(photographs.map((photo) => photo.category)).size).padStart(2, '0'), label: 'ways to explore' },
  { value: String(new Set(photographs.map((photo) => photo.year)).size).padStart(2, '0'), label: 'years in the field' },
];

export function WhatIsAeris() {
  return <section className="what-is-aeris section-wrap" id="what-is-aeris" aria-labelledby="what-is-aeris-title">
    <p className="eyebrow">AERIS / THE IDEA</p>
    <h2 id="what-is-aeris-title">A sky journal for looking up—and going out.</h2>
    <div className="what-is-aeris__jobs">
      <article><h3>Look closer</h3><p>Spend time with photographs of sky, light, clouds and the natural world.</p></article>
      <article><h3>Go further</h3><p>Learn to read the clouds and changing light, then plan your next walk beneath an open sky.</p></article>
    </div>
    <div className="what-is-aeris__stats" aria-label="AERIS collection at a glance">
      {stats.map((stat) => <div className="what-is-aeris__stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
    </div>
    <div className="what-is-aeris__tiles" aria-label="A few moments from the collection">
      {photographs.slice(0, 3).map((photo) => <a href="#collection" key={photo.id} aria-label={`Explore ${photo.title} in the collection`}>
        <img src={imageUrl(photo.image, 960)} srcSet={imageSrcSet(photo.image, [480, 960, 1600])} sizes="(max-width: 760px) 30vw, 24vw" alt="" loading="lazy" decoding="async" />
      </a>)}
    </div>
  </section>;
}
