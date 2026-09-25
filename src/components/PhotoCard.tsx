import type { Photograph } from '../types/gallery';
import { GalleryImage } from './GalleryImage';

export function PhotoCard({ photo, photos, onOpen }: { photo: Photograph; photos: Photograph[]; onOpen: (photo: Photograph, photos: Photograph[]) => void }) {
  return <GalleryImage photo={photo} photos={photos} onOpen={onOpen} className={`photo-card photo-card--${photo.aspect}`} imageWidth={1000} parallax />;
}
