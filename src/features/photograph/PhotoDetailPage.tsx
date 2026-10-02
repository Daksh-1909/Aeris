import { useEffect, useState } from 'react';
import { imageUrl } from '../../data/gallery';
import type { Photograph } from '../../types/gallery';
import { ContactForm } from '../../components/ContactForm';
import './photoDetail.css';

function setMeta(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>('meta[property="' + property + '"]');
  if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.append(tag); }
  tag.content = content;
}
export function PhotoDetailPage({ photo }: { photo: Photograph|null; }) {
  const [requestType, setRequestType] = useState<'print'|'license'>('print');
  useEffect(() => {
    if (!photo) return;
    const oldTitle = document.title;
    document.title = photo.title + ' · AERIS — Read the Sky';
    setMeta('og:title', photo.title + ' · AERIS');
    setMeta('og:description', photo.description ?? photo.title + ' — ' + photo.location);
    setMeta('og:image', imageUrl(photo.image, 1200));
    setMeta('og:type', 'article');
    return () => { document.title = oldTitle; setMeta('og:type', 'website'); };
  }, [photo]);
  if (!photo) return <section className="photo-detail"><p className="eyebrow">AERIS / 404</p><h2>Photograph not found.</h2><a href="/">Return to the gallery →</a></section>;
  const chooseRequest = (type: 'print'|'license') => { setRequestType(type); window.requestAnimationFrame(() => document.getElementById('photo-inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); };
  return <section className="photo-detail"><a className="photo-detail__back" href="/">← Back to the gallery</a><div className="photo-detail__layout"><figure><img src={imageUrl(photo.image, 1600)} alt={photo.description ?? 'Sky photograph: ' + photo.title} width="1600" height="1200" loading="eager" decoding="async" /><figcaption>Credit: {photo.credit}</figcaption></figure><div className="photo-detail__info"><p className="eyebrow">AERIS / {photo.category.toUpperCase()} STUDY</p><h2>{photo.title}</h2><p>{photo.description}</p><dl><div><dt>Location</dt><dd>{photo.location}</dd></div><div><dt>Time and light</dt><dd>{photo.metadata ?? 'Field study'}</dd></div><div><dt>Cloud type</dt><dd><a href={'/atlas/' + photo.cloudType}>{photo.cloudType} · Cloud Atlas →</a></dd></div><div><dt>Camera settings</dt><dd>Not supplied in the source record</dd></div><div><dt>Year</dt><dd>{photo.year}</dd></div></dl><div className="photo-detail__actions"><button type="button" onClick={() => chooseRequest('print')}>Request a print</button><button type="button" onClick={() => chooseRequest('license')}>License this photo</button></div></div></div><ContactForm key={requestType} photo={photo} requestType={requestType} /></section>;
}
