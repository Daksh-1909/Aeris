export type JourneyScene = {
  id: 'sunrise' | 'noon' | 'sunset' | 'night';
  label: string;
  time: string;
  titleBefore: string;
  titleAccent: string;
  body?: string;
  actions: { label: string; href: string; secondary?: boolean }[];
  side: 'left' | 'right';
  inStart: number;
  inEnd: number;
  outStart: number;
  outEnd: number;
};

export const journeyScenes: readonly JourneyScene[] = [
  {
    id: 'sunrise', label: 'Sunrise', time: '05:48', titleBefore: 'Read the', titleAccent: 'sky.',
    body: 'A journal of light, cloud and weather. Begin where the day begins.',
    actions: [{ label: 'Explore the sky', href: '#collection' }], side: 'left',
    inStart: -.06, inEnd: 0, outStart: .19, outEnd: .25,
  },
  {
    id: 'noon', label: 'Noon', time: '12:10', titleBefore: 'Under an endless', titleAccent: 'blue.',
    body: 'Cloud studies, light and weather, read slowly.',
    actions: [{ label: 'Open the Cloud Atlas', href: '/atlas' }], side: 'left',
    inStart: .22, inEnd: .28, outStart: .46, outEnd: .52,
  },
  {
    id: 'sunset', label: 'Sunset', time: '17:52', titleBefore: 'Light, before it', titleAccent: 'leaves.',
    actions: [{ label: 'Plan your golden hour', href: '/planner' }], side: 'right',
    inStart: .50, inEnd: .56, outStart: .74, outEnd: .80,
  },
  {
    id: 'night', label: 'Night', time: '22:30', titleBefore: 'When the sky becomes', titleAccent: 'infinite.',
    actions: [
      { label: 'Start your sky journal', href: '/register' },
      { label: 'Browse the gallery', href: '#collection', secondary: true },
    ], side: 'left',
    inStart: .78, inEnd: .85, outStart: 1, outEnd: 1,
  },
];

export const journeyStops = [
  { id: 'sunrise', label: 'Sunrise', time: '05:48', progress: .12 },
  { id: 'noon', label: 'Noon', time: '12:10', progress: .42 },
  { id: 'sunset', label: 'Sunset', time: '17:52', progress: .72 },
  { id: 'night', label: 'Night', time: '22:30', progress: 1 },
] as const;
