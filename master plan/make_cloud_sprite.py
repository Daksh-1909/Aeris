#!/usr/bin/env python3
"""
Cut a real cloud out of one of YOUR sky photos (white or grey cloud on blue sky)
and save it as a transparent WebP sprite with soft, natural edges.

Usage:
  python make_cloud_sprite.py INPUT.jpg OUTPUT.webp [WIDTH] [--low 20] [--high 90]

Example:
  python make_cloud_sprite.py my_cumulus.jpg cloud_real_1.webp 640

How it works: clear sky has blue much higher than red, while clouds are close to neutral.
So the "cloudiness" is how far a pixel is from sky blue. The soft edge is also de-fringed so no blue halo is left. --low / --high set the soft ramp
(raise --high if too much sky remains, lower --low if the thin edges are cut off).

Tips:
  - Use a photo where the sky is plain blue and the cloud is isolated.
  - Keep the original colors (do not apply a filter). The site tints them by time of day.
  - After saving, open the file on a dark background and check the edges.
Needs: pip install pillow numpy
"""
import sys
import numpy as np
from PIL import Image, ImageFilter


def smoothstep(x, lo, hi):
    t = np.clip((x - lo) / max(hi - lo, 1e-6), 0, 1)
    return t * t * (3 - 2 * t)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opts = {}
    for i, a in enumerate(sys.argv):
        if a in ("--low", "--high") and i + 1 < len(sys.argv):
            opts[a] = float(sys.argv[i + 1])
    # remove option values from positional args
    args = [a for a in args if a not in {str(v) for v in opts.values()} or a.endswith((".jpg", ".png", ".webp", ".jpeg"))]
    if len(args) < 2:
        print(__doc__)
        sys.exit(1)
    src, dst = args[0], args[1]
    width = int(args[2]) if len(args) > 2 else 640
    low, high = opts.get("--low", 20.0), opts.get("--high", 90.0)

    im = Image.open(src).convert("RGB")
    if im.size[0] > width:
        h = int(im.size[1] * width / im.size[0])
        im = im.resize((width, h), Image.LANCZOS)

    rgb = np.asarray(im, dtype=np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]

    # Distance from "sky blue": sky has b much larger than r. Clouds have b close to r.
    blueness = b - r                      # large in clear sky, small in cloud
    sky_level = np.percentile(blueness, 95)  # typical clear-sky value in this photo
    cloudiness = (sky_level - blueness)   # grows from 0 (sky) to sky_level (pure cloud)
    cloudiness = cloudiness * (255.0 / max(sky_level, 1.0))
    alpha = smoothstep(cloudiness, low, high)

    a_img = Image.fromarray((alpha * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(1.2))
    a = np.asarray(a_img, dtype=np.float32) / 255.0

    # Remove the blue fringe: a soft edge pixel is a mix of cloud and sky. "f" is the true share of
    # cloud in each pixel (linear, 0 = sky, 1 = cloud). Subtract the sky's share so edges keep the
    # cloud's own color, then the ramp above decides how much of that edge stays visible.
    f = np.clip(cloudiness / 255.0, 0.0, 1.0)
    sky_pixels = rgb[f < 0.03]
    sky = np.median(sky_pixels, axis=0) if len(sky_pixels) else np.array([90.0, 140.0, 215.0])
    f3 = np.clip(f, 0.08, 1.0)[..., None]
    clean = np.clip((rgb - (1.0 - f3) * sky) / f3, 0, 255)
    clean = np.where((f > 0.9)[..., None], rgb, clean)

    out = Image.fromarray(clean.astype(np.uint8), "RGB").convert("RGBA")
    out.putalpha(a_img)

    # Trim empty borders.
    bbox = a_img.point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        out = out.crop(bbox)
    out.save(dst, "WEBP", quality=86, method=6)
    print(f"saved {dst}  size={out.size}")


if __name__ == "__main__":
    main()
