export function GalleryStatus({ hasError }: { hasError: boolean }) {
  return <p className="gallery-empty" role="status">
    {hasError ? 'Moments are temporarily unavailable.' : 'No moments available.'}
  </p>;
}
