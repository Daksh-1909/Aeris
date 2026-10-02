import { useMemo, useState, type FormEvent } from 'react';
import { photographs, imageUrl } from '../../data/gallery';
import type { CloudType } from '../../types/gallery';
import { cloudAtlas, cloudInfo } from './cloudData';
import './cloudAtlas.css';

export function CloudAtlasPage({ pathname }: { pathname: string }) {
  const slug = pathname.split('/')[2];
  const selected = cloudInfo(slug);
  const [height, setHeight] = useState('');
  const [shape, setShape] = useState('');
  const [color, setColor] = useState('');
  const [weather, setWeather] = useState('');
  const [answer, setAnswer] = useState<CloudType | null>(null);
  const related = useMemo(() => selected ? photographs.filter((photo) => photo.cloudType === selected.type) : [], [selected]);
  const identify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let result: CloudType = 'cumulus';
    if (shape === 'wispy') result = 'cirrus';
    else if (shape === 'towering' || weather === 'storm') result = 'cumulonimbus';
    else if (shape === 'lens') result = 'lenticular';
    else if (shape === 'pouches') result = 'mammatus';
    else if (shape === 'layer' && weather === 'steady-rain') result = 'nimbostratus';
    else if (shape === 'layer') result = height === 'middle' ? 'altocumulus' : 'stratus';
    else if (shape === 'patches') result = height === 'middle' ? 'altocumulus' : 'stratocumulus';
    else if (color === 'grey' && height === 'low') result = 'stratus';
    setAnswer(result);
  };

  if (slug && !selected) return <section className="cloud-atlas"><p className="eyebrow">AERIS / CLOUD ATLAS</p><h1>We couldn’t find that cloud.</h1><a href="/atlas">Explore the Cloud Atlas →</a></section>;
  if (selected) return <section className="cloud-atlas"><a className="cloud-atlas__back" href="/atlas">← All cloud types</a><p className="eyebrow">AERIS / CLOUD ATLAS</p><h1>{selected.name}</h1><p className="cloud-atlas__lede">{selected.description}</p><dl className="cloud-atlas__facts"><div><dt>Typical altitude</dt><dd>{selected.altitude} level</dd></div><div><dt>Weather signal</dt><dd>{selected.weatherSignal}</dd></div><div><dt>Photography tip</dt><dd>{selected.photoTip}</dd></div></dl><h2>Gallery studies</h2>{related.length ? <div className="cloud-atlas__photos">{related.map((photo) => <article key={photo.id}><img src={imageUrl(photo.image, 700)} alt={photo.description ?? `Sky study showing ${selected.name}`} width="1600" height="1200" loading="lazy" /><div><strong>{photo.title}</strong><span>{photo.location} · {photo.year}</span><small>Credit: {photo.credit}</small></div></article>)}</div> : <p className="cloud-atlas__empty">No gallery studies are tagged with this cloud yet.</p>}</section>;

  return <section className="cloud-atlas"><p className="eyebrow">AERIS / LEARN THE SKY</p><h1>Cloud Atlas</h1><p className="cloud-atlas__lede">A field guide to the shapes overhead: what they are, what they can tell you, and how to photograph them.</p>
    <section className="cloud-atlas__grid" aria-label="Cloud types">{cloudAtlas.map((cloud) => <a className="cloud-atlas__type" href={`/atlas/${cloud.type}`} key={cloud.type}><span>{cloud.altitude} level</span><h2>{cloud.name}</h2><p>{cloud.description}</p><b>Read field note →</b></a>)}</section>
    <section className="cloud-quiz"><p className="eyebrow">FIELD IDENTIFIER</p><h2>What cloud might that be?</h2><p>Choose the closest match. This quick guide suggests a possibility, not a weather forecast.</p><form onSubmit={identify}><label>Where is it in the sky?<select value={height} onChange={(event) => setHeight(event.target.value)} required><option value="">Choose height</option><option value="low">Low</option><option value="middle">Middle</option><option value="high">High</option></select></label><label>What shape do you see?<select value={shape} onChange={(event) => setShape(event.target.value)} required><option value="">Choose shape</option><option value="heaps">Rounded heaps</option><option value="layer">A broad flat layer</option><option value="wispy">Fine wisps</option><option value="towering">A tall tower or anvil</option><option value="patches">Rows or patches</option><option value="lens">A smooth lens</option><option value="pouches">Pouches hanging below</option></select></label><label>What color is it?<select value={color} onChange={(event) => setColor(event.target.value)} required><option value="">Choose color</option><option value="white">Bright white</option><option value="grey">Grey or dark</option><option value="mixed">Light and shaded</option></select></label><label>What is the weather doing?<select value={weather} onChange={(event) => setWeather(event.target.value)} required><option value="">Choose conditions</option><option value="fair">Mostly fair</option><option value="steady-rain">Steady rain or snow</option><option value="storm">Showers or thunder</option><option value="changing">Changing or unsure</option></select></label><button type="submit">Suggest a cloud</button></form>{answer&&<div className="cloud-quiz__result" role="status"><span>One possibility</span><h3><a href={`/atlas/${answer}`}>{cloudInfo(answer)?.name}</a></h3><p>{cloudInfo(answer)?.description}</p><a href={`/atlas/${answer}`}>Read its field note →</a></div>}</section>
  </section>;
}
