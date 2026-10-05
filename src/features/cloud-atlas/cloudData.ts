import type { CloudType } from '../../types/gallery';

export interface CloudInfo {
  type: CloudType;
  name: string;
  commonName: string;
  altitude: string;
  description: string;
  weatherSignal: string;
  photoTip: string;
  /** Existing demo record used until a correctly classified, licensed image is supplied. */
  illustrativePhotoId?: string;
}

/** The ten WMO cloud genera, ordered from high to low and convective forms. */
export const cloudAtlas: CloudInfo[] = [
  { type: 'cirrus', name: 'Cirrus', commonName: 'Mare’s tails', altitude: 'High · 6–13 km', description: 'Fine, wispy ice-crystal clouds high in the atmosphere, swept into delicate streaks.', weatherSignal: 'Can arrive ahead of a broader weather system; isolated wisps do not guarantee a change.', photoTip: 'A low sun brings out their texture; expose for the bright sky to keep the strands visible.' },
  { type: 'cirrostratus', name: 'Cirrostratus', commonName: 'Halo veil', altitude: 'High · 6–13 km', description: 'A thin, widespread ice-crystal veil that can soften the sky and form halos around the Sun or Moon.', weatherSignal: 'A thickening veil can precede a frontal system.', photoTip: 'Include the halo and a foreground reference without pointing a camera directly at the Sun.', illustrativePhotoId: '02' },
  { type: 'cirrocumulus', name: 'Cirrocumulus', commonName: 'Mackerel sky', altitude: 'High · 6–13 km', description: 'Small high cloudlets arranged in ripples or patches, with little or no shading.', weatherSignal: 'Often marks moisture and wave motion high in the atmosphere.', photoTip: 'Use a longer focal length to make the fine repeated pattern legible.', illustrativePhotoId: '01' },
  { type: 'altocumulus', name: 'Altocumulus', commonName: 'Sheep’s-back clouds', altitude: 'Middle · 2–7 km', description: 'Patches or rows of rounded cloudlets, often with light and shade across their tops.', weatherSignal: 'Can indicate moisture and instability in the middle levels; the wider weather pattern matters.', photoTip: 'A longer focal length helps isolate repeating ripples and cloudlet patterns.' },
  { type: 'altostratus', name: 'Altostratus', commonName: 'Grey sheet', altitude: 'Middle · 2–7 km', description: 'A broad, grey or blue-grey sheet that covers much of the sky and often softens the Sun.', weatherSignal: 'Can thicken ahead of widespread precipitation.', photoTip: 'Expose for the subtle tonal layers and include a dark foreground.', illustrativePhotoId: '08' },
  { type: 'nimbostratus', name: 'Nimbostratus', commonName: 'Rain cloud', altitude: 'Low to middle · surface–7 km', description: 'A thick, dark, widespread layer that hides the Sun and often obscures the cloud base.', weatherSignal: 'Usually brings prolonged, steady rain or snow.', photoTip: 'Search for reflections, rain curtains and small areas of brighter contrast.' },
  { type: 'stratocumulus', name: 'Stratocumulus', commonName: 'Cloud rolls', altitude: 'Low · surface–2 km', description: 'A broad low layer broken into rounded rolls or patches, with gaps that reveal blue sky.', weatherSignal: 'Common in relatively settled weather, sometimes with brief light rain.', photoTip: 'Use the repeating gaps and bands to build a strong horizontal composition.' },
  { type: 'stratus', name: 'Stratus', commonName: 'Low cloud', altitude: 'Low · surface–2 km', description: 'A low, uniform grey layer that can cover much of the sky like a raised blanket.', weatherSignal: 'Often brings overcast skies, mist or light drizzle.', photoTip: 'Look for a dark foreground or a break in the layer to give the soft sky definition.' },
  { type: 'cumulus', name: 'Cumulus', commonName: 'Fair-weather heaps', altitude: 'Low · surface–2 km', description: 'Separate heaps with rounded tops and flatter bases, often bright against blue sky.', weatherSignal: 'Small fair-weather cumulus usually means settled conditions; growing towers can signal stronger uplift.', photoTip: 'Use a wider frame and leave room around the cloud so its shape reads clearly.' },
  { type: 'cumulonimbus', name: 'Cumulonimbus', commonName: 'Thunderstorm cloud', altitude: 'Surface to high · up to 16 km', description: 'A deep, towering cloud that can spread into a broad anvil at its top.', weatherSignal: 'Associated with showers, thunderstorms, gusty winds and sometimes hail.', photoTip: 'Photograph from a safe, sheltered location and never approach lightning.' },
];

export function cloudInfo(type: string | undefined) {
  return cloudAtlas.find((cloud) => cloud.type === type);
}
