import { useEffect, useState } from 'react';
import { getPhotographs } from '../services/galleryService';
import type { GalleryCategory, Photograph } from '../types/gallery';

export function useGalleryPhotos(category: GalleryCategory) {
  const [result, setResult] = useState<{ category: GalleryCategory; photos: Photograph[]; isLoading: boolean; hasError: boolean }>({
    category,
    photos: [],
    isLoading: true,
    hasError: false,
  });

  useEffect(() => {
    let isCurrent = true;
    void getPhotographs(category)
      .then((items) => {
        if (isCurrent) setResult({ category, photos: items, isLoading: false, hasError: false });
      })
      .catch(() => {
        if (isCurrent) setResult({ category, photos: [], isLoading: false, hasError: true });
      });

    return () => { isCurrent = false; };
  }, [category]);

  if (result.category !== category) return { photos: [], isLoading: true, hasError: false };
  return { photos: result.photos, isLoading: result.isLoading, hasError: result.hasError };
}
