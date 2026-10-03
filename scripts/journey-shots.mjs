import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const moments = [0, .12, .3, .42, .58, .72, .84, 1];
const viewports = [{ width: 1920, height: 1080 }, { width: 390, height: 844 }];
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    for (const progress of moments) {
      await page.goto(`http://127.0.0.1:5173/?p=${progress}`, { waitUntil: 'networkidle' });
      await page.locator('.journey__stage').waitFor();
      await page.screenshot({
        path: join(outputDir, `journey-${progress}-${viewport.width}.png`),
        fullPage: false,
      });
      const proof = await page.evaluate(() => {
        const title = document.querySelector('.journey__scene[aria-hidden="false"] h1');
        const titleRect = title?.getBoundingClientRect();
        return {
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          progress: document.querySelector('.journey__debug')?.textContent ?? 'debug disabled',
          visibleScene: title?.textContent?.trim() ?? null,
          headlineBounds: titleRect ? [Math.round(titleRect.left), Math.round(titleRect.right)] : null,
          railStops: document.querySelectorAll('.journey__rail [data-stop-progress]').length,
        };
      });
      console.log(JSON.stringify({ requestedProgress: progress, ...proof }));
    }
    await page.close();
  }

  const journeyPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await journeyPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await journeyPage.locator('.journey__rail [data-stop-id="noon"]').click();
  await journeyPage.waitForFunction(() => {
    const stage = document.querySelector('.journey__stage');
    if (stage?.querySelector('[data-stop-id="noon"]')?.getAttribute('aria-current') !== 'step') return false;
    return Math.abs(Number.parseFloat(getComputedStyle(stage).getPropertyValue('--journey-progress')) - .42) < .015;
  });
  const railProgress = await journeyPage.locator('.journey__stage').evaluate((stage) => Number.parseFloat(getComputedStyle(stage).getPropertyValue('--journey-progress')));
  await journeyPage.mouse.wheel(0, -700);
  await journeyPage.waitForFunction((previous) => {
    const stage = document.querySelector('.journey__stage');
    return Number.parseFloat(getComputedStyle(stage).getPropertyValue('--journey-progress')) < previous - .02;
  }, railProgress);
  console.log(JSON.stringify({ railClickProgress: railProgress, reverseScrollProgress: await journeyPage.locator('.journey__stage').evaluate((stage) => Number.parseFloat(getComputedStyle(stage).getPropertyValue('--journey-progress'))) }));
  await journeyPage.close();
} finally {
  await browser.close();
}
