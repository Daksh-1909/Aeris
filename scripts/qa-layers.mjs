import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const viewports = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [1366, 640]];
const expectedLayers = {
  sky: 0, stars: 1, nebula: 2, orb: 4, 'clouds-far': 5, 'clouds-mid': 6, 'clouds-near': 7,
  birds: 8, 'ground-back': 10, children: 12, 'ground-front': 14, tree: 15, beats: 30,
  rail: 45, 'rail-controls': 45, grain: 50,
};
const failureShots = 'shots/qa-layers';
await mkdir(failureShots, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:5173/?debug=layers', { waitUntil: 'domcontentloaded' });
  await page.locator('.journey__layer-debug').waitFor();
  const layerErrors = await page.evaluate((expected) => Object.entries(expected).flatMap(([layer, z]) => {
    const plane = document.querySelector(`[data-layer="${layer}"]`);
    if (!plane) return [`missing data-layer=${layer}`];
    const actual = Number.parseInt(getComputedStyle(plane).zIndex, 10);
    return actual === z ? [] : [`${layer} z-index ${actual}; expected ${z}`];
  }).concat([...document.querySelectorAll('.journey__stage [data-layer]')].flatMap((element) => {
    const style = getComputedStyle(element);
    if (style.zIndex === 'auto') return [];
    return element.classList.contains('journey__plane') ? [] : [`${element.dataset.layer} has z-index ${style.zIndex} outside a plane`];
  })), expectedLayers);
  if (layerErrors.length) failures.push({ width, height, progress: null, errors: layerErrors });

  const slider = page.getByLabel('Layer debug progress');
  for (let step = 0; step <= 24; step += 1) {
    const progress = Math.round(step / 24 * 100) / 100;
    await slider.evaluate((input, value) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, String(Math.round(value * 100)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, progress);
    await page.waitForFunction((target) => Number(document.querySelector('.journey__layer-debug')?.getAttribute('data-progress')) === target, progress);
    const errors = await page.evaluate(() => {
      const rect = (element) => {
        const r = element.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, height: r.height };
      };
      const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const zone = document.querySelector('[data-layer="beats"]');
      const orb = document.querySelector('.journey__orb');
      const header = document.querySelector('[data-layer="header"]');
      const zoneRect = rect(zone);
      const orbVisible = Number(getComputedStyle(orb).opacity) > .01;
      const activeBeats = [...document.querySelectorAll('.journey__beat')].filter((beat) => Number(getComputedStyle(beat).opacity) > .01);
      const contentOverflows = activeBeats.some((beat) => {
        const zoneRect = beat.getBoundingClientRect();
        return [...beat.children].some((child) => {
          const childRect = child.getBoundingClientRect();
          return childRect.height > 0 && (childRect.top < zoneRect.top - 1 || childRect.bottom > zoneRect.bottom + 1);
        });
      });
      const errors = [];
      if (overlaps(zoneRect, rect(header))) errors.push('beat zone intersects header');
      if (orbVisible && overlaps(zoneRect, rect(orb))) errors.push('beat zone intersects orb');
      if (contentOverflows) errors.push('beat content exceeds its bounded zone');
      return errors;
    });
    if (errors.length) {
      const filename = `${width}x${height}-p${String(Math.round(progress * 100)).padStart(2, '0')}.png`;
      await page.screenshot({ path: `${failureShots}/${filename}` });
      failures.push({ width, height, progress, errors, screenshot: `${failureShots}/${filename}` });
    }
  }
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log(`Layer order and beat-zone collision checks passed at ${viewports.length} widths and 25 progress samples per width.`);
}
