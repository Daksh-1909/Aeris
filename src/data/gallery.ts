import type { Photograph } from '../types/gallery';

export const photographs: Photograph[] = [
  { id: '01', title: 'The quiet between', location: 'Dolomites, Italy', category: 'Cloud', image: 'photo-1470770841072-f978cf4d019e', description: 'Clouds resting in the mountain quiet.', metadata: 'Cloud study', year: '2024', aspect: 'tall', cloudType: 'altocumulus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '02', title: 'Where the day begins', location: 'Lofoten, Norway', category: 'Sky', image: 'photo-1500530855697-b586d89ba3ee', description: 'The first light opening above the coast.', metadata: 'First light', year: '2023', aspect: 'wide', cloudType: 'cirrus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '03', title: 'A softer kind of wild', location: 'South Island, NZ', category: 'Featured', image: 'photo-1472396961693-142e6e269027', description: 'A fleeting encounter in the open landscape.', metadata: 'Field note', year: '2024', aspect: 'square', cloudType: 'clear', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '04', title: 'Last light, slowly', location: 'Algarve, Portugal', category: 'Featured', image: 'photo-1472120435266-53107fd0c44a', description: 'The last warmth of the day along the shore.', metadata: 'Golden hour', year: '2022', aspect: 'tall', cloudType: 'stratocumulus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '05', title: 'The shape of silence', location: 'Iceland', category: 'Cloud', image: 'photo-1464822759023-fed622ff2c3b', description: 'A mountain ridge beneath a passing sky.', metadata: 'Cloud study', year: '2024', aspect: 'wide', cloudType: 'lenticular', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '06', title: 'A little more sky', location: 'Patagonia, Chile', category: 'Sky', image: 'photo-1500534623283-312aade485b7', description: 'A wide horizon held in the afternoon.', metadata: 'Open sky', year: '2023', aspect: 'square', cloudType: 'cumulus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '07', title: 'Above the weather', location: 'Scottish Highlands', category: 'Cloud', image: 'photo-1534081333815-ae5019106622', description: 'A high layer of cloud moving over the hills.', metadata: 'Cloud study', year: '2024', aspect: 'wide', cloudType: 'cumulonimbus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '08', title: 'The slow drift', location: 'Sierra Nevada, USA', category: 'Cloud', image: 'photo-1499346030926-9a72daac6c63', description: 'Soft weather crossing the mountain light.', metadata: 'Cloud study', year: '2023', aspect: 'tall', cloudType: 'nimbostratus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '09', title: 'The green hush', location: 'Pacific Northwest, USA', category: 'Nature', image: 'photo-1441974231531-c6227db76b6e', description: 'Tall forest trees gathered around a quiet path.', metadata: 'Forest study', year: '2024', aspect: 'wide', cloudType: 'stratus', credit: 'Unsplash (photographer credit unavailable)' },
  { id: '10', title: 'Into the trees', location: 'Black Forest, Germany', category: 'Nature', image: 'photo-1473448912268-2022ce9509d8', description: 'A path disappearing into the woodland.', metadata: 'Forest study', year: '2023', aspect: 'tall', cloudType: 'mammatus', credit: 'Unsplash (photographer credit unavailable)' },
];

export function imageUrl(id: string, width = 1200) {
  if (id.startsWith('/') || /^https?:\/\//i.test(id)) return id;
  const responsiveWidth = width <= 480 ? 480 : width <= 960 ? 960 : 1600;
  return `/images/${id}-${responsiveWidth}.webp`;
}

/** Return local WebP candidates for self-hosted records, or remote candidates for explicit URLs. */
export function imageSrcSet(id: string, widths: number[]) {
  if (id.startsWith('/') || /^https?:\/\//i.test(id)) return undefined;
  if (id.startsWith('photo-')) return [480, 960, 1600].map((width) => `/images/${id}-${width}.webp ${width}w`).join(', ');
  return [...new Set(widths)].sort((a, b) => a - b)
    .map((width) => `${imageUrl(id, width)} ${width}w`)
    .join(', ');
}
