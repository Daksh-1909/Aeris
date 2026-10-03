/**
 * Editorial content from the pre-cloud homepage, preserved before its sections
 * are replaced. Photo IDs resolve against the existing gallery records.
 */
export interface JourneyPhoto {
  id: string;
  title: string;
  location: string;
  year: string;
  description: string;
  timeOfDay: string;
  category: string;
  cloudType: string;
  metadata: string;
}

export interface LegacySection {
  name: string;
  eyebrow?: string;
  headings: string[];
  text: string[];
  images: Array<{ id: string; alt: string; caption?: string }>;
  links: Array<{ label: string; href: string }>;
  numbers: Array<{ label: string; value: number | string }>;
  buttons: string[];
}

export interface JourneyGroup {
  heading: string;
  intro: string;
  featuredPhotos: JourneyPhoto[];
  legacySections: LegacySection[];
}

const photos: JourneyPhoto[] = [
  { id: '01', title: 'The quiet between', location: 'Dolomites, Italy', year: '2024', description: 'Clouds resting in the mountain quiet.', timeOfDay: 'day', category: 'Cloud', cloudType: 'altocumulus', metadata: 'Cloud study' },
  { id: '02', title: 'Where the day begins', location: 'Lofoten, Norway', year: '2023', description: 'The first light opening above the coast.', timeOfDay: 'dawn', category: 'Sky', cloudType: 'cirrus', metadata: 'First light' },
  { id: '03', title: 'A softer kind of wild', location: 'South Island, NZ', year: '2024', description: 'A fleeting encounter in the open landscape.', timeOfDay: 'morning', category: 'Featured', cloudType: 'clear', metadata: 'Field note' },
  { id: '04', title: 'Last light, slowly', location: 'Algarve, Portugal', year: '2022', description: 'The last warmth of the day along the shore.', timeOfDay: 'golden-hour', category: 'Featured', cloudType: 'stratocumulus', metadata: 'Golden hour' },
  { id: '05', title: 'The shape of silence', location: 'Iceland', year: '2024', description: 'A mountain ridge beneath a passing sky.', timeOfDay: 'day', category: 'Cloud', cloudType: 'lenticular', metadata: 'Cloud study' },
  { id: '06', title: 'A little more sky', location: 'Patagonia, Chile', year: '2023', description: 'A wide horizon held in the afternoon.', timeOfDay: 'day', category: 'Sky', cloudType: 'cumulus', metadata: 'Open sky' },
  { id: '07', title: 'Above the weather', location: 'Scottish Highlands', year: '2024', description: 'A high layer of cloud moving over the hills.', timeOfDay: 'dusk', category: 'Cloud', cloudType: 'cumulonimbus', metadata: 'Cloud study' },
  { id: '08', title: 'The slow drift', location: 'Sierra Nevada, USA', year: '2023', description: 'Soft weather crossing the mountain light.', timeOfDay: 'dusk', category: 'Cloud', cloudType: 'nimbostratus', metadata: 'Cloud study' },
  { id: '09', title: 'The green hush', location: 'Pacific Northwest, USA', year: '2024', description: 'Tall forest trees gathered around a quiet path.', timeOfDay: 'day', category: 'Nature', cloudType: 'stratus', metadata: 'Forest study' },
  { id: '10', title: 'Into the trees', location: 'Black Forest, Germany', year: '2023', description: 'A path disappearing into the woodland.', timeOfDay: 'morning', category: 'Nature', cloudType: 'mammatus', metadata: 'Forest study' },
];

export const journeyContent: {
  sky: JourneyGroup;
  nature: JourneyGroup;
  numbers: JourneyGroup;
  contact: JourneyGroup;
  extraLinks: Array<{ label: string; href: string; source: string }>;
} = {
  sky: {
    heading: 'Sky',
    intro: 'A changing canvas above us.',
    featuredPhotos: photos.filter((photo) => photo.category === 'Sky'),
    legacySections: [
      {
        name: 'Above panel',
        eyebrow: 'AERIS · THE SKY JOURNAL',
        headings: ['There is always more above.'],
        text: ['A living collection of light, weather, and the small moments that make us look up.', 'The world opens upward'],
        images: [{ id: 'photo-1464822759023-fed622ff2c3b', alt: 'A mountain range beneath a broad, cloud-filled sky', caption: '01 / 08' }],
        links: [{ label: 'Enter the journal', href: '#light-and-landscape' }, { label: 'Continue below', href: '#light-and-landscape' }],
        numbers: [], buttons: [],
      },
      {
        name: 'Light & Landscape introduction',
        eyebrow: 'Moments in the sky',
        headings: ['Every cloud carries a different story. Every light exists only once.'],
        text: ['AERIS is a collection of moments found above us and around us.', 'Light moves. The moment remains.'],
        images: [
          { id: 'photo-1500530855697-b586d89ba3ee', alt: 'A quiet road through sunlit mountain slopes', caption: 'Light moves. The moment remains.' },
          ...photos.slice(0, 3).map((photo) => ({ id: photo.id, alt: `${photo.title}, ${photo.location}`, caption: `${photo.title} · ${photo.location} · ${photo.year}` })),
        ],
        links: [], numbers: [], buttons: [],
      },
      {
        name: 'Sky field note',
        eyebrow: 'Field note · 01',
        headings: ['SKY'],
        text: ['A changing canvas above us.', 'The first light of another day. Every horizon, a beginning.'],
        images: photos.filter((photo) => photo.category === 'Sky').map((photo) => ({ id: photo.id, alt: photo.description, caption: `${photo.title} · ${photo.location} · ${photo.year} · ${photo.metadata} · ${photo.cloudType}` })),
        links: [], numbers: [], buttons: [],
      },
      {
        name: 'Clouds field note and studies',
        eyebrow: 'Field note · 02 / The cloud studies',
        headings: ['CLOUDS', 'The cloud studies'],
        text: ['Somewhere between earth and infinity.', 'Weather, light, and everything in between.', 'Collected moments; count shown from the gallery.'],
        images: photos.filter((photo) => photo.category === 'Cloud').map((photo) => ({ id: photo.id, alt: photo.description, caption: `${photo.title} · ${photo.location} · ${photo.year} · ${photo.metadata} · ${photo.cloudType}` })),
        links: [{ label: 'Explore the Cloud Atlas', href: '/atlas' }],
        numbers: [{ label: 'collected moments', value: 'dynamic' }],
        buttons: ['Previous cloud photographs', 'Next cloud photographs'],
      },
    ],
  },
  nature: {
    heading: 'Nature',
    intro: 'Where the sky meets the earth.',
    featuredPhotos: photos.filter((photo) => photo.category === 'Nature'),
    legacySections: [
      {
        name: 'Nature field note',
        eyebrow: 'Field note · 03',
        headings: ['NATURE'],
        text: ['Where the sky meets the earth.', 'Earth · Sky', 'A slower rhythm, written into the land.'],
        images: photos.filter((photo) => photo.category === 'Nature').map((photo) => ({ id: photo.id, alt: photo.description, caption: `${photo.title} · ${photo.location} · ${photo.year} · ${photo.metadata} · ${photo.cloudType}` })),
        links: [], numbers: [], buttons: [],
      },
      {
        name: 'A note on looking',
        eyebrow: 'A note on looking',
        headings: ['The sky asks for nothing. We look anyway.'],
        text: ['Somewhere between weather and wonder, there is a moment worth keeping. AERIS is an ongoing record of those fleeting hours above the everyday.', 'Made slowly, under open skies.'],
        images: [{ id: 'photo-1472396961693-142e6e269027', alt: 'Wildlife standing in a quiet woodland landscape' }],
        links: [], numbers: [], buttons: [],
      },
    ],
  },
  numbers: {
    heading: 'Numbers',
    intro: 'A collection at a glance.',
    featuredPhotos: photos,
    legacySections: [
      {
        name: 'AERIS / The Idea',
        eyebrow: 'AERIS / THE IDEA',
        headings: ['A sky journal for looking up—and going out.', 'Look closer', 'Go further'],
        text: ['Spend time with photographs of sky, light, clouds and the natural world.', 'Learn to read the clouds and changing light, then plan your next walk beneath an open sky.'],
        images: photos.slice(0, 3).map((photo) => ({ id: photo.id, alt: photo.description, caption: photo.title })),
        links: [],
        numbers: [
          { label: 'moments collected', value: 10 },
          { label: 'ways to explore', value: 4 },
          { label: 'years in the field', value: 3 },
        ],
        buttons: [],
      },
      {
        name: 'Collected light gallery',
        eyebrow: 'Selected work · 2022—2024',
        headings: ['Collected light.'],
        text: ['Small moments, held still. A collection shaped by looking up.', 'Gallery filters: Sky, Nature, Cloud, Featured.'],
        images: photos.map((photo) => ({ id: photo.id, alt: photo.description, caption: `${photo.title} · ${photo.location} · ${photo.year} · ${photo.category} · ${photo.cloudType}` })),
        links: [{ label: 'Request the full archive', href: 'mailto:hello@aeris.studio' }],
        numbers: [{ label: 'photographs shown per selected filter', value: 'dynamic' }],
        buttons: ['Sky', 'Nature', 'Cloud', 'Featured'],
      },
    ],
  },
  contact: {
    heading: 'Contact',
    intro: 'Stay for the last light, then keep looking as the night gathers around the horizon.',
    featuredPhotos: [photos.find((photo) => photo.id === '03')!],
    legacySections: [
      {
        name: 'Unlock the magic of the sky',
        eyebrow: 'Field note · 03',
        headings: ['Unlock the magic of the sky.'],
        text: ['Stay for the last light, then keep looking as the night gathers around the horizon.'],
        images: photos.filter((photo) => photo.category === 'Featured').map((photo) => ({ id: photo.id, alt: photo.description, caption: photo.title })),
        links: [{ label: 'Plan your golden hour', href: '/planner' }], numbers: [], buttons: [],
      },
      {
        name: 'Daily Sky',
        eyebrow: 'AERIS / TODAY ABOVE',
        headings: ['Daily Sky', 'Previous days'],
        text: ['One small reason to look up, chosen for this date.', 'A date-selected featured photograph and the previous seven days, chosen from the gallery.'],
        images: photos.map((photo) => ({ id: photo.id, alt: photo.description, caption: `${photo.title} · ${photo.location} · ${photo.year}` })),
        links: [], numbers: [], buttons: ['Open today’s featured sky photograph', 'Open a previous day’s photograph'],
      },
      {
        name: 'Closing experience',
        eyebrow: 'More than a photo',
        headings: ['A collection of moments that existed only once.'],
        text: [],
        images: [{ id: '03', alt: photos[2]!.description, caption: `${photos[2]!.location} · ${photos[2]!.year}` }],
        links: [{ label: 'Enter the gallery', href: '#collection' }, { label: 'Start your sky journal', href: '/register' }],
        numbers: [
          { label: 'Photographs', value: photos.length },
          { label: 'Cloud forms', value: new Set(photos.map((photo) => photo.cloudType)).size },
          { label: 'Places', value: new Set(photos.map((photo) => photo.location)).size },
        ],
        buttons: [],
      },
    ],
  },
  extraLinks: [
    { label: 'Explore the Cloud Atlas', href: '/atlas', source: 'Cloud studies' },
    { label: 'Plan your golden hour', href: '/planner', source: 'Golden hour section' },
    { label: 'Request the full archive', href: 'mailto:hello@aeris.studio', source: 'Gallery' },
    { label: 'Enter the gallery', href: '#collection', source: 'Closing experience' },
    { label: 'Start your sky journal', href: '/register', source: 'Closing experience' },
    { label: 'Daily Sky and previous days', href: '#closing', source: 'Daily Sky section' },
  ],
};
