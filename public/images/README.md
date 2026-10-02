# Gallery image assets

The current demo gallery is self-hosted in this directory at three responsive widths:

- `<photo-id>-480.webp`
- `<photo-id>-960.webp`
- `<photo-id>-1600.webp`

`src/data/gallery.ts` maps each Unsplash photo ID to these local files, and gallery images select a candidate with `srcset` and `sizes`. The hero requests the largest local size with high fetch priority. This removes runtime hot-links to Unsplash.

These files are downloaded, resized WebP copies of Unsplash photographs. They are not AERIS-owned photographs, and the photographer could not be identified from the existing records. Keep the `credit` field accurate; replace the demo imagery and add verified creator credits before presenting the gallery as original studio work.

For new original assets, use descriptive filenames and update the corresponding `Photograph.image` value in `src/data/gallery.ts` to the file path (for example `/images/sky/lofoten-blue-hour.webp`). Keep responsive dimensions, meaningful alt text, and the proper creator/license details.
