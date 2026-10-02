import { useMemo } from 'react';
import { imageUrl } from '../../data/gallery';
import { photographs } from '../../data/gallery';
import type { Photograph, OpenPhotograph } from '../../types/gallery';
import './dailySky.css';

function dateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
function photoForDate(date: Date): Photograph {
  const key = dateKey(date);
  const hash = [...key].reduce((value, character) => (value * 31 + character.charCodeAt(0)) >>> 0, 7);
  return photographs[hash % photographs.length]!;
}
export function DailySky({ onOpen }: { onOpen: OpenPhotograph; }) {
  const today = useMemo(() => new Date(), []);
  const featured = photoForDate(today);
  const previous = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - index - 1);
    return { date, photo: photoForDate(date) };
  }), [today]);
  return <section className="daily-sky" aria-labelledby="daily-sky-title">
    <div className="daily-sky__intro"><p className="eyebrow">AERIS / TODAY ABOVE</p><h2 id="daily-sky-title">Daily Sky</h2><p>One small reason to look up, chosen for this date.</p><time dateTime={dateKey(today)}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(today)}</time></div>
    <button className="daily-sky__feature" type="button" onClick={() => onOpen(featured, photographs)} aria-label={'Open ' + featured.title + ', today’s featured sky photograph'}>
      <img src={imageUrl(featured.image, 1500)} alt={featured.description ?? 'Sky photograph: ' + featured.title} width="1600" height="1200" loading="lazy" decoding="async" />
      <span className="daily-sky__caption"><small>{featured.location} · {featured.year}</small><strong>{featured.title}</strong><span>{featured.description}</span></span>
    </button>
    <div className="daily-sky__archive"><h3>Previous days</h3><div>{previous.map(({ date, photo }) => <button type="button" key={dateKey(date)} onClick={() => onOpen(photo, photographs)} aria-label={'Open Daily Sky for ' + dateKey(date) + ': ' + photo.title}><time dateTime={dateKey(date)}>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)}</time><span>{photo.title}</span></button>)}</div></div>
  </section>;
}
