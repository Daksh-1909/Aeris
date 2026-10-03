import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const baseUrl = process.env.AERIS_BASE_URL ?? 'http://127.0.0.1:5173/';
const widths = [360, 390, 768, 1024, 1440, 1920];
const scenes = [
  { progress: .08, title: 'READ THE SKY' },
  { progress: .32, title: 'A NEW ANGLE OF LIGHT' },
  { progress: .52, title: 'UNDER AN ENDLESS BLUE' },
  { progress: .72, title: 'LIGHT, BEFORE IT LEAVES' },
  { progress: .82, title: 'THE SUN BECOMES THE MOON' },
  { progress: .95, title: 'WHEN THE SKY BECOMES INFINITE' },
];
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
await mkdir(outputDir, { recursive: true });

async function setProgress(page, progress, context = '') {
  await page.locator('.journey__debug input[type="range"]').evaluate((input, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, String(Math.round(value * 1000)));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, progress);
  try {
    await page.waitForFunction((value) => {
      const stage = document.querySelector('.journey__stage');
      const progressNow = Number.parseFloat(getComputedStyle(stage).getPropertyValue('--journey-progress'));
      return Number.isFinite(progressNow) && Math.abs(progressNow - value) < .025;
    }, progress, { timeout: 8000 });
  } catch {
    const actual = await page.locator('.journey__stage').evaluate((stage) => getComputedStyle(stage).getPropertyValue('--journey-progress'));
    throw new Error(`${context ? `${context}: ` : ''}timeline did not reach ${progress} (current value: ${actual})`);
  }
}

for (const [browserName, browserType, launchOptions] of [
  ['Chrome', chromium, { channel: 'chrome' }],
  ['Edge', chromium, { channel: 'msedge' }],
  ['WebKit', webkit, {}],
]) {
  const browser = await browserType.launch({ headless: true, ...launchOptions });
  const errors = [];
  try {
    for (const width of widths) {
      const height = width <= 390 ? 844 : 900;
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await page.locator('.journey__stage').waitFor();
      await page.locator('.journey__debug input[type="range"]').waitFor();

      if (browserName === 'Chromium' && width === 360) {
        await page.keyboard.press('Tab');
        const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
        if (firstFocus !== 'Skip to main content') throw new Error(`Keyboard skip-link check failed: ${firstFocus}`);
        const moonHref = await page.locator('.moon-credit a').getAttribute('href');
        if (moonHref !== 'https://svs.gsfc.nasa.gov/4720/') throw new Error(`NASA moon credit link is missing or incorrect: ${moonHref}`);
      }

      for (const scene of scenes) {
        await setProgress(page, scene.progress, `${browserName} ${width}px`);
        const proof = await page.evaluate(() => {
          const headings = [...document.querySelectorAll('.journey__scene[aria-hidden="false"] h1')];
          const visibleHeadings = headings.map((heading) => {
            const range = document.createRange();
            range.selectNodeContents(heading);
            return { title: heading.textContent?.trim() ?? null, opacity: Number.parseFloat(getComputedStyle(heading.parentElement).opacity), rects: [...range.getClientRects()] };
          });
          const primaryHeading = visibleHeadings.toSorted((a, b) => b.opacity - a.opacity)[0];
          const header = document.querySelector('.site-header')?.getBoundingClientRect();
          const banner = document.querySelector('.demo-mode-banner')?.getBoundingClientRect();
          return {
            title: primaryHeading?.title ?? null,
            textFits: visibleHeadings.every(({ rects }) => rects.length > 0 && rects.every((rect) => rect.left >= -1 && rect.right <= innerWidth + 1)),
            documentWidth: document.documentElement.scrollWidth,
            headerClear: !banner || !header || header.bottom <= banner.top || header.top >= banner.bottom,
          };
        });
        if (proof.title !== scene.title || !proof.textFits || proof.documentWidth !== width || !proof.headerClear) {
          throw new Error(`${browserName} failed at ${width}px, p=${scene.progress}: ${JSON.stringify(proof)}`);
        }
        if (browserName === 'Chromium' && (scene.progress === .08 || scene.progress === .95)) {
          await page.screenshot({ path: join(outputDir, `phase10-${width}-${scene.progress === .08 ? 'sunrise' : 'midnight'}.png`) });
        }
      }
      await page.close();
      console.log(`${browserName}: ${width}px — six headlines, header, and overflow passed`);
    }

    const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await reduced.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await reduced.locator('.journey__stage').waitFor();
    await setProgress(reduced, .95, `${browserName} reduced-motion`);
    const animationNames = await reduced.evaluate(() => [
      getComputedStyle(document.querySelector('.journey__aurora-ribbon')).animationName,
      getComputedStyle(document.querySelector('.journey__nebula-blob')).animationName,
      getComputedStyle(document.querySelector('.journey__cloud img')).animationName,
    ]);
    if (animationNames.some((name) => name !== 'none')) throw new Error(`${browserName} reduced-motion check failed: ${animationNames.join(', ')}`);
    await reduced.close();
    if (errors.length) throw new Error(`${browserName} page errors: ${errors.join(' | ')}`);
  } finally {
    await browser.close();
  }
}
console.log(`Phase 10 QA passed in Chrome, Edge, and WebKit. Screenshots are in ${outputDir}.`);
