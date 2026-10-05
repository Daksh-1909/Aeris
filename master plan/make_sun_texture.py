#!/usr/bin/env python3
"""
Turn a NASA SDO full-disk image into a round, transparent WebP sun disc for AERIS.

Usage:
  python make_sun_texture.py INPUT.jpg OUTPUT.webp [SIZE]

Example:
  python make_sun_texture.py latest_2048_HMIIC.jpg sun_color_1k.webp 1024

Needs: pip install pillow numpy
What it does:
  1. Finds the bright solar disc automatically (ignores the black corners).
  2. Crops to a square around the disc.
  3. Makes everything outside the disc transparent, with a 2 px soft edge.
  4. Resizes to SIZE (default 1024) and saves a lossy WebP with alpha (quality 88).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]
    size = int(sys.argv[3]) if len(sys.argv) > 3 else 1024

    im = Image.open(src).convert("RGB")
    gray = np.asarray(im.convert("L"), dtype=np.uint8)

    # The disc is much brighter than the black space around it.
    mask = gray > 24
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise SystemExit("Could not find the solar disc: the image looks empty.")
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    radius = min(x1 - x0, y1 - y0) / 2

    # Stay a hair inside the limb so no black fringe is left.
    r = radius * 0.992
    pad = int(r)
    box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
    im = im.crop(box)
    d = im.size[0]

    # Circular alpha with a soft 2 px edge (measured at the final size).
    yy, xx = np.ogrid[:d, :d]
    dist = np.sqrt((xx - d / 2) ** 2 + (yy - d / 2) ** 2)
    edge = max(2.0 * d / size, 1.0)
    alpha = np.clip((d / 2 - dist) / edge, 0, 1)
    a = Image.fromarray((alpha * 255).astype(np.uint8), "L")

    im = im.convert("RGBA")
    im.putalpha(a)
    im = im.resize((size, size), Image.LANCZOS)
    im.save(dst, "WEBP", quality=88, method=6)
    print(f"saved {dst}  ({size}x{size}, disc radius found: {radius:.0f}px of {gray.shape[1]}x{gray.shape[0]})")


if __name__ == "__main__":
    main()
