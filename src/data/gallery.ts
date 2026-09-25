import type { Photograph } from '../types/gallery';

export const photographs: Photograph[] = [
  { id: '01', title: 'The quiet between', location: 'Dolomites, Italy', category: 'Clouds', image: 'photo-1470770841072-f978cf4d019e', description: 'Clouds resting in the mountain quiet.', metadata: 'Cloud study', year: '2024', aspect: 'tall' },
  { id: '02', title: 'Where the day begins', location: 'Lofoten, Norway', category: 'Sky', image: 'photo-1500530855697-b586d89ba3ee', description: 'The first light opening above the coast.', metadata: 'First light', year: '2023', aspect: 'wide' },
  { id: '03', title: 'A softer kind of wild', location: 'South Island, NZ', category: 'Nature', image: 'photo-1472396961693-142e6e269027', description: 'A fleeting encounter in the open landscape.', metadata: 'Field note', year: '2024', aspect: 'square' },
  { id: '04', title: 'Last light, slowly', location: 'Algarve, Portugal', category: 'Light', image: 'photo-1472120435266-53107fd0c44a', description: 'The last warmth of the day along the shore.', metadata: 'Golden hour', year: '2022', aspect: 'tall' },
  { id: '05', title: 'The shape of silence', location: 'Iceland', category: 'Clouds', image: 'photo-1464822759023-fed622ff2c3b', description: 'A mountain ridge beneath a passing sky.', metadata: 'Cloud study', year: '2024', aspect: 'wide' },
  { id: '06', title: 'A little more sky', location: 'Patagonia, Chile', category: 'Sky', image: 'photo-1500534623283-312aade485b7', description: 'A wide horizon held in the afternoon.', metadata: 'Open sky', year: '2023', aspect: 'square' },
  { id: '07', title: 'Above the weather', location: 'Scottish Highlands', category: 'Clouds', image: 'photo-1534081333815-ae5019106622', description: 'A high layer of cloud moving over the hills.', metadata: 'Cloud study', year: '2024', aspect: 'wide' },
  { id: '08', title: 'The slow drift', location: 'Sierra Nevada, USA', category: 'Clouds', image: 'photo-1499346030926-9a72daac6c63', description: 'Soft weather crossing the mountain light.', metadata: 'Cloud study', year: '2023', aspect: 'tall' },
  { id: '09', title: 'The green hush', location: 'Pacific Northwest, USA', category: 'Nature', image: 'photo-1441974231531-c6227db76b6e', description: 'Tall forest trees gathered around a quiet path.', metadata: 'Forest study', year: '2024', aspect: 'wide' },
  { id: '10', title: 'Into the trees', location: 'Black Forest, Germany', category: 'Nature', image: 'photo-1473448912268-2022ce9509d8', description: 'A path disappearing into the woodland.', metadata: 'Forest study', year: '2023', aspect: 'tall' },
];

export function imageUrl(id: string, width = 1200) {
  if (id.startsWith('/') || /^https?:\/\//i.test(id)) return id;
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}
