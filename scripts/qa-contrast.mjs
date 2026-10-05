import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const output = 'shots/qa-contrast';
const baseUrl = new URL(process.env.AERIS_BASE_URL ?? 'http://127.0.0.1:5173/');
baseUrl.searchParams.set('debug', 'layers');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];
const remoteFontRequests = [];
const beats = [0.05, 0.3, 0.55, 0.7, 0.86, 0.96];

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('request', (request) => { if (/fonts\.(googleapis|gstatic)\.com/i.test(request.url())) remoteFontRequests.push(request.url()); });
  await page.goto(baseUrl.href, { waitUntil: 'domcontentloaded' });
  await page.locator('.journey__layer-debug').waitFor();
  await page.locator('.journey__layer-debug').evaluate((overlay) => { overlay.style.display = 'none'; });
  await page.evaluate(() => document.fonts.ready);
  const fontsLoaded = await page.evaluate(async () => {
    const [bodyFont, displayFont] = await Promise.all([document.fonts.load('400 16px Inter'), document.fonts.load('300 32px "Cormorant Garamond"')]);
    return { body: bodyFont.length > 0, display: displayFont.length > 0 };
  });
  if (!fontsLoaded.body || !fontsLoaded.display) failures.push({ viewport, error: 'One or both self-hosted typefaces failed to load.', fontsLoaded });
  for (let beatIndex = 0; beatIndex < beats.length; beatIndex += 1) {
    const progress = beats[beatIndex];
    await page.locator('.journey__stage').evaluate((stage, value) => stage.dispatchEvent(new CustomEvent('aeris:debug-progress', { detail: value })), progress);
    await page.waitForFunction((target) => Math.abs(Number(document.querySelector('.journey__layer-debug')?.dataset.progress) - target) < .01, progress);
    const sampleInfo = await page.evaluate((index) => {
      const beat = document.querySelectorAll('.journey__beat')[index];
      const targets = [
        { selector: 'h1', threshold: 3, role: 'headline' },
        { selector: '.journey__eyebrow', threshold: 4.5, role: 'eyebrow' },
        { selector: ':scope > p:not(.journey__eyebrow)', threshold: 4.5, role: 'copy' },
        { selector: '.journey__button', threshold: 4.5, role: 'button' },
      ];
      return targets.map(({ selector, threshold, role }) => {
        const element = beat.querySelector(selector);
        const rect = element.getBoundingClientRect();
        const color = getComputedStyle(element).color.match(/[\d.]+/g).slice(0, 3).map(Number);
        element.dataset.contrastTarget = role;
        return { role, threshold, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, color };
      });
    }, beatIndex);
    await page.evaluate(() => document.querySelectorAll('.journey__beat [data-contrast-target]').forEach((element) => { element.style.visibility = 'hidden'; }));
    const screenshot = await page.screenshot();
    const measured = await page.evaluate(async ({ encoded, targets }) => {
      const image = new Image(); image.src = `data:image/png;base64,${encoded}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
      const luminance = (rgb) => {
        const linear = rgb.map((channel) => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
        return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
      };
      for (const target of targets) {
        const { x, y, width, height } = target.rect;
        const fg = luminance(target.color);
        let minimum = Infinity;
        for (let row = 0; row < 7; row += 1) for (let column = 0; column < 11; column += 1) {
          const px = Math.max(0, Math.min(canvas.width - 1, Math.floor(x + width * (column + .5) / 11)));
          const py = Math.max(0, Math.min(canvas.height - 1, Math.floor(y + height * (row + .5) / 7)));
          const pixel = context.getImageData(px, py, 1, 1).data;
          const bg = luminance(pixel);
          minimum = Math.min(minimum, (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05));
        }
        target.ratio = minimum;
      }
      return targets;
    }, { encoded: screenshot.toString('base64'), targets: sampleInfo });
    await page.evaluate((index) => {
      const beat = document.querySelectorAll('.journey__beat')[index];
      return [...beat.querySelectorAll('[data-contrast-target]')].map((element) => {
        element.style.visibility = '';
        delete element.dataset.contrastTarget;
        return element;
      });
    }, beatIndex);
    const filename = `${viewport.width}x${viewport.height}-beat-${beatIndex + 1}.png`;
    await page.screenshot({ path: `${output}/${filename}` });
    // The browser-side contrast results are reported from the DOM-free screenshot sample.
    for (const target of measured) {
      if (!Number.isFinite(target.ratio) || target.ratio < target.threshold) failures.push({ viewport, beat: beatIndex + 1, role: target.role, ratio: target.ratio, threshold: target.threshold, screenshot: `${output}/${filename}` });
    }
  }
  await page.close();
}

await browser.close();
if (remoteFontRequests.length) failures.push({ error: 'A Google Fonts request was made.', requests: [...new Set(remoteFontRequests)] });
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else console.log(`Text contrast passed for all six beats at desktop and mobile sizes. Screenshots: ${output}`);
