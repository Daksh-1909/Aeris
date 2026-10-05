import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const viewports = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [1366, 640]];
const expectedLayers = {
  sky: 0, stars: 1, nebula: 2, 'orb-glow': 3, orb: 4, 'clouds-far': 5, 'clouds-mid': 6, 'clouds-near': 7,
  birds: 8, 'ground-back': 10, children: 12, bench: 13, 'ground-front': 14, tree: 15, beats: 30,
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
  const assetErrors = await page.evaluate(() => {
    const sun = document.querySelector('.journey__sun-disc');
    const moon = document.querySelector('.journey__moon');
    if (!sun || !sun.complete || sun.naturalWidth !== 1024) return ['NASA sun disc did not load at 1024px'];
    if (!moon || !document.querySelector('[data-layer="orb-glow"] .journey__orb-glow')) return ['missing orb or glow layer'];
    const sunRect = sun.getBoundingClientRect(), moonRect = moon.getBoundingClientRect();
    return Math.abs(sunRect.width - moonRect.width) < 1 && Math.abs(sunRect.height - moonRect.height) < 1
      ? [] : ['sun and moon discs do not share the same diameter'];
  });
  if (layerErrors.length || assetErrors.length) failures.push({ width, height, progress: null, errors: [...layerErrors, ...assetErrors] });

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
      const paintRect = (element) => {
        if (!element) return null;
        const svg = element.matches('svg') ? element : element.querySelector('svg');
        if (!svg && element instanceof SVGGraphicsElement) return rect(element);
        if (!svg) return rect(element);
        const root = element.matches('svg') ? svg : element;
        const graphics = [...root.querySelectorAll('path,circle,ellipse,rect,line,polygon,polyline,use')];
        const bounds = [];
        for (const shape of graphics) {
          let parent = shape;
          let hidden = false;
          while (parent && parent !== root.parentElement) {
            if (Number(getComputedStyle(parent).opacity) <= .01 || getComputedStyle(parent).display === 'none' || getComputedStyle(parent).visibility === 'hidden') hidden = true;
            if (parent === root) break;
            parent = parent.parentElement;
          }
          if (hidden) continue;
          try {
            const box = shape.getBBox(), matrix = shape.getScreenCTM();
            if (!matrix || !box.width || !box.height) continue;
            const points = [[box.x, box.y], [box.x + box.width, box.y], [box.x, box.y + box.height], [box.x + box.width, box.y + box.height]].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
            bounds.push({ left: Math.min(...points.map((p) => p.x)), right: Math.max(...points.map((p) => p.x)), top: Math.min(...points.map((p) => p.y)), bottom: Math.max(...points.map((p) => p.y)) });
          } catch { /* Ignore non-rendered SVG fragments. */ }
        }
        if (!bounds.length) return rect(element);
        return { left: Math.min(...bounds.map((b) => b.left)), right: Math.max(...bounds.map((b) => b.right)), top: Math.min(...bounds.map((b) => b.top)), bottom: Math.max(...bounds.map((b) => b.bottom)) };
      };
      const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const zone = document.querySelector('[data-layer="beats"]');
      const orb = document.querySelector('.journey__orb');
      const header = document.querySelector('[data-layer="header"]');
      const zoneRect = rect(zone);
      const activeBeats = [...document.querySelectorAll('.journey__beat')].filter((beat) => Number(getComputedStyle(beat).opacity) > .01);
      const tree = document.querySelector('.journey__tree-art');
      const kids = document.querySelector('.journey__children');
      const bench = document.querySelector('.journey__bench-scene');
      const people = document.querySelector('.journey__people-art');
      const visible = (element) => element && Number(getComputedStyle(element).opacity) > .01;
      const contentOverflows = activeBeats.some((beat) => {
        const zoneRect = beat.getBoundingClientRect();
        return [...beat.children].some((child) => {
          const childRect = child.getBoundingClientRect();
          return childRect.height > 0 && (childRect.top < zoneRect.top - 1 || childRect.bottom > zoneRect.bottom + 1);
        });
      });
      const errors = [];
      if (overlaps(zoneRect, rect(header))) errors.push('beat zone intersects header');
      if (contentOverflows) errors.push('beat content exceeds its bounded zone');
      for (const beat of activeBeats) {
        const beatRect = rect(beat);
        if (overlaps(beatRect, rect(orb))) errors.push(`beat ${beat.querySelector('h1')?.textContent} intersects orb`);
        if (visible(tree) && overlaps(beatRect, paintRect(tree))) errors.push(`beat ${beat.querySelector('h1')?.textContent} intersects tree`);
        if (visible(kids) && overlaps(beatRect, paintRect(kids))) errors.push(`beat ${beat.querySelector('h1')?.textContent} intersects children`);
        if (visible(bench) && overlaps(beatRect, paintRect(bench.querySelector('.journey__bench-art')))) errors.push(`beat ${beat.querySelector('h1')?.textContent} intersects bench`);
        if (visible(people) && overlaps(beatRect, paintRect(people))) errors.push(`beat ${beat.querySelector('h1')?.textContent} intersects people`);
      }
      if (visible(tree) && visible(bench) && overlaps(paintRect(tree), paintRect(bench.querySelector('.journey__bench-art')))) errors.push('tree intersects bench');
      if (visible(tree) && visible(kids) && overlaps(paintRect(tree), paintRect(kids))) errors.push(`tree intersects children ${JSON.stringify({ tree: paintRect(tree), kids: paintRect(kids) })}`);
      if (visible(kids) && visible(bench) && overlaps(paintRect(kids), paintRect(bench.querySelector('.journey__bench-art')))) errors.push(`children intersect bench ${JSON.stringify({ kids: paintRect(kids), bench: paintRect(bench.querySelector('.journey__bench-art')) })}`);
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
  console.log(`Layer order, beat, and scene collision checks passed at ${viewports.length} widths and 25 progress samples per width.`);
}
