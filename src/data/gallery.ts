import type { Photograph } from '../types/gallery';

export const photographs: Photograph[] = [
  { id: '01', title: 'The quiet between', location: 'Dolomites, Italy', category: 'Clouds', image: 'photo-1470770841072-f978cf4d019e', year: '2024', aspect: 'tall' },
  { id: '02', title: 'Where the day begins', location: 'Lofoten, Norway', category: 'Sky', image: 'photo-1500530855697-b586d89ba3ee', year: '2023', aspect: 'wide' },
  { id: '03', title: 'A softer kind of wild', location: 'South Island, NZ', category: 'Nature', image: 'photo-1472396961693-142e6e269027', year: '2024', aspect: 'square' },
  { id: '04', title: 'Last light, slowly', location: 'Algarve, Portugal', category: 'Light', image: 'photo-1472120435266-53107fd0c44a', year: '2022', aspect: 'tall' },
  { id: '05', title: 'The shape of silence', location: 'Iceland', category: 'Clouds', image: 'photo-1464822759023-fed622ff2c3b', year: '2024', aspect: 'wide' },
  { id: '06', title: 'A little more sky', location: 'Patagonia, Chile', category: 'Sky', image: 'photo-1500534623283-312aade485b7', year: '2023', aspect: 'square' },
];

export function imageUrl(id: string, width = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
}
