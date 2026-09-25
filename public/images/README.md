# Gallery image folders

Store owned, optimized photographs here. Vite serves files in `public/` from the site root, so these are their browser paths:

- `public/images/sky/` → `/images/sky/filename.webp`
- `public/images/clouds/` → `/images/clouds/filename.webp`
- `public/images/nature/` → `/images/nature/filename.webp`
- `public/images/featured/` → `/images/featured/filename.webp`

Use descriptive, lowercase filenames, for example `lofoten-blue-hour.webp` or `dolomites-low-cloud.webp`.

Then add an entry in `src/data/gallery.ts` with `image` set to the browser path and `category` set to `Sky`, `Clouds`, or `Nature`. The collection service filters these records and the existing cards and lightbox will load the local file. Keep a matching photograph entry for each image you want displayed; placing a file in this folder alone does not add it to the collection.

Example:

```ts
{
  id: '07',
  title: 'Blue hour over Lofoten',
  location: 'Lofoten, Norway',
  category: 'Sky',
  image: '/images/sky/lofoten-blue-hour.webp',
  description: 'First light opening over the coast.',
  metadata: 'First light',
  year: '2026',
  aspect: 'wide',
}
```

Prefer compressed WebP or AVIF images at appropriate display dimensions. The current demo entries still use Unsplash URLs.
