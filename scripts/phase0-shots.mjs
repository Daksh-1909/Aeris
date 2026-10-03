import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';

const widths = [360, 390, 768, 1024, 1440, 1920];
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: join(outputDir, `phase0-hero-${width}.png`), fullPage: false });
    const result = await page.evaluate(() => {
      const title = document.querySelector('.hero h1');
      const header = document.querySelector('.site-header');
      const rect = title?.getBoundingClientRect();
      const outOfBounds = [...document.querySelectorAll('body *')].filter((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.left < -1 || bounds.right > innerWidth + 1;
      }).map((element) => `${element.tagName.toLowerCase()}.${typeof element.className === 'string' ? element.className.trim().replaceAll(' ', '.') : ''}`);
      return {
        viewportWidth: innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        headline: rect ? { left: Math.round(rect.left), right: Math.round(rect.right), text: title.textContent?.trim() } : null,
        headerTop: header ? Math.round(header.getBoundingClientRect().top) : null,
        outOfBounds,
      };
    });
    console.log(JSON.stringify(result));
    await page.close();
  }
} finally {
  await browser.close();
}
