const chapters = [
  { id: 'top', name: 'Dawn', theme: 'dawn' },
  { id: 'what-is-aeris', name: 'Midday', theme: 'day' },
  { id: 'clouds', name: 'Golden hour', theme: 'golden' },
  { id: 'nature', name: 'Dusk', theme: 'dusk' },
  { id: 'closing', name: 'Night', theme: 'night' },
] as const;

export function ChapterRail() {
  return <nav className="chapter-rail" aria-label="Sky chapters">
    {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`} data-chapter-link={chapter.theme} aria-label={`Go to ${chapter.name}`}>
      <span aria-hidden="true" /> <span className="chapter-rail__label">{chapter.name}</span>
    </a>)}
  </nav>;
}
