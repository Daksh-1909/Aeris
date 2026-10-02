import type { CloudType } from '../../types/gallery';

export interface CloudInfo {
  type: CloudType;
  name: string;
  altitude: 'low' | 'mid' | 'high';
  description: string;
  weatherSignal: string;
  photoTip: string;
}

export const cloudAtlas: CloudInfo[] = [
  { type: 'cumulus', name: 'Cumulus', altitude: 'low', description: 'Separate heaps with rounded tops and flatter bases, often bright against blue sky.', weatherSignal: 'Small fair-weather cumulus usually means settled conditions; growing towers can signal stronger uplift.', photoTip: 'Use a wider frame and leave room around the cloud so its shape reads clearly.' },
  { type: 'stratus', name: 'Stratus', altitude: 'low', description: 'A low, uniform grey layer that can cover much of the sky like a raised blanket.', weatherSignal: 'Often brings overcast skies, mist or light drizzle.', photoTip: 'Look for a dark foreground or a break in the layer to give the soft sky definition.' },
  { type: 'cirrus', name: 'Cirrus', altitude: 'high', description: 'Fine, wispy ice-crystal clouds high in the atmosphere, swept into delicate streaks.', weatherSignal: 'Can arrive ahead of a broader weather system, though isolated wisps do not guarantee a change.', photoTip: 'A low sun brings out their texture; expose for the bright sky to keep the strands visible.' },
  { type: 'cumulonimbus', name: 'Cumulonimbus', altitude: 'high', description: 'A deep, towering cloud that can spread into a broad anvil at its top.', weatherSignal: 'Associated with showers, thunderstorms, gusty winds and sometimes hail.', photoTip: 'Photograph from a safe, sheltered location and never approach lightning.' },
  { type: 'altocumulus', name: 'Altocumulus', altitude: 'mid', description: 'Patches or rows of rounded cloudlets, often with light and shade across their tops.', weatherSignal: 'Can indicate moisture and instability in the middle levels; the wider weather pattern matters.', photoTip: 'A longer focal length helps isolate repeating ripples and cloudlet patterns.' },
  { type: 'stratocumulus', name: 'Stratocumulus', altitude: 'low', description: 'A broad low layer broken into rounded rolls or patches, with gaps that reveal blue sky.', weatherSignal: 'Common in relatively settled weather, sometimes with brief light rain.', photoTip: 'Use the repeating gaps and bands to build a strong horizontal composition.' },
  { type: 'nimbostratus', name: 'Nimbostratus', altitude: 'mid', description: 'A thick, dark, widespread layer that hides the sun and often obscures the cloud base.', weatherSignal: 'Usually brings prolonged, steady rain or snow.', photoTip: 'Search for reflections, rain curtains and small areas of brighter contrast.' },
  { type: 'lenticular', name: 'Lenticular', altitude: 'mid', description: 'Smooth, lens-shaped clouds that form when stable air flows over mountains.', weatherSignal: 'Signals strong airflow and waves over terrain; it does not necessarily mean rain at ground level.', photoTip: 'A mountain or ridge in the frame explains the cloud’s distinctive stacked form.' },
  { type: 'mammatus', name: 'Mammatus', altitude: 'high', description: 'Rounded pouch-like forms hanging from the underside of a cloud, often an anvil.', weatherSignal: 'They can accompany storm systems but do not by themselves mean a tornado is forming.', photoTip: 'A wide view captures the scale; wait for side light to reveal each rounded pocket.' },
  { type: 'clear', name: 'Clear sky', altitude: 'high', description: 'No significant cloud cover: the color and character come from the atmosphere and available light.', weatherSignal: 'Conditions vary with humidity, haze, smoke and the broader forecast.', photoTip: 'Use a foreground, silhouette or long twilight gradient to give a clear sky a point of focus.' },
];

export function cloudInfo(type: string | undefined) {
  return cloudAtlas.find((cloud) => cloud.type === type);
}
