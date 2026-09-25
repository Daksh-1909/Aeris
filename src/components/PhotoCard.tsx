import type { OpenPhotograph, Photograph } from '../types/gallery';
import { GalleryImage } from './GalleryImage';

export function PhotoCard({ photo, photos, onOpen }: { photo: Photograph; photos: Photograph[]; onOpen: OpenPhotograph }) {
  return <GalleryImage photo={photo} photos={photos} onOpen={onOpen} className={`photo-card photo-card--${photo.aspect}`} imageWidth={1000} imageSizes="(max-width: 760px) 42vw, 40vw" parallax />;
}
