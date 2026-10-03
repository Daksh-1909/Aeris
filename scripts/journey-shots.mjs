import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const moments = [0, .12, .3, .42, .58, .72, .84, 1];
const viewports = [{ width: 1920, height: 1080 }, { width: 390, height: 844 }];
const layoutWidths = [360, 390, 768, 1024, 1440, 1920];
const outputDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'shots');
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader'],
});

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') console.error(`[browser:${message.type()}] ${message.text().split('\n')[0]}`);
    });
    page.on('pageerror', (error) => console.error(`[pageerror] ${error.message}`));
    for (const progress of moments) {
      await page.goto(`http://127.0.0.1:5173/?p=${progress}`, { waitUntil: 'networkidle' });
      await page.locator('.journey__stage').waitFor();
      await page.locator('.journey__canvas').waitFor();
      await page.waitForFunction(() => {
        const stage = document.querySelector('.journey__stage');
        return stage?.dataset.webglReady === 'true' || stage?.dataset.webglFallback === 'true';
      }, undefined, { timeout: 10000 });
      if (await page.locator('.journey__stage').getAttribute('data-webgl-ready') === 'true') await page.waitForTimeout(450);
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
          webgl: document.querySelector('.journey__stage')?.getAttribute('data-webgl-ready') === 'true' ? 'ready' : 'CSS fallback',
        };
      });
      console.log(JSON.stringify({ requestedProgress: progress, ...proof }));
    }
    await page.close();
  }

  // Responsive layout proof at every width specified by the journey brief.
  for (const width of layoutWidths) {
    const page = await browser.newPage({ viewport: { width, height: width <= 390 ? 844 : 900 }, deviceScaleFactor: 1 });
    for (const progress of [.12, .72]) {
      await page.goto(`http://127.0.0.1:5173/?p=${progress}`, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => {
        const stage = document.querySelector('.journey__stage');
        return stage?.dataset.webglReady === 'true' || stage?.dataset.webglFallback === 'true';
      }, undefined, { timeout: 10000 });
      const proof = await page.evaluate(() => {
        const stage = document.querySelector('.journey__stage');
        const title = stage?.querySelector('.journey__scene[aria-hidden="false"] h1');
        const bounds = title?.getBoundingClientRect();
        const siteHeader = document.querySelector('.site-header')?.getBoundingClientRect();
        return {
          viewportWidth: innerWidth,
          documentWidth: document.documentElement.scrollWidth,
          visibleTitle: title?.textContent?.trim() ?? null,
          headlineBounds: bounds ? [Math.round(bounds.left), Math.round(bounds.right)] : null,
          headlineVisible: Boolean(bounds && bounds.left >= -1 && bounds.right <= innerWidth + 1),
          headerBottom: siteHeader ? Math.round(siteHeader.bottom) : null,
          headerClear: Boolean(bounds && siteHeader && bounds.top >= siteHeader.bottom),
        };
      });
      await page.screenshot({ path: join(outputDir, `journey-layout-${progress}-${width}.png`), fullPage: false });
      console.log(JSON.stringify({ layoutCheck: true, requestedProgress: progress, ...proof }));
      if (proof.documentWidth !== width || !proof.headlineVisible || !proof.headerClear) throw new Error(`Journey layout failed at ${width}px, p=${progress}`);
    }
    await page.close();
  }

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('.journey')?.clientHeight ?? 0, behavior: 'instant' }));
    await page.waitForTimeout(1400);
    await page.screenshot({ path: join(outputDir, `journey-continuation-${viewport.width}.png`), fullPage: false });
    console.log(JSON.stringify(await page.evaluate(() => ({
      continuationWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      continuation: Boolean(document.querySelector('.journey-continuation')),
      continuationBackground: getComputedStyle(document.querySelector('.journey-continuation')).backgroundColor,
      navHidden: document.querySelector('.site-header')?.classList.contains('site-header--hidden'),
    }))));
    await page.close();
  }

  const reducedMotionPage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reducedMotionPage.goto('http://127.0.0.1:5173/?p=0.42', { waitUntil: 'networkidle' });
  await reducedMotionPage.waitForFunction(() => document.querySelector('.journey__stage')?.dataset.renderMode === 'static');
  const staticProof = await reducedMotionPage.evaluate(() => ({
    renderMode: document.querySelector('.journey__stage')?.getAttribute('data-render-mode'),
    canvasCount: document.querySelectorAll('.journey__canvas').length,
    documentWidth: document.documentElement.scrollWidth,
  }));
  await reducedMotionPage.screenshot({ path: join(outputDir, 'journey-static-reduced-motion-390.png'), fullPage: false });
  console.log(JSON.stringify({ reducedMotion: staticProof }));
  await reducedMotionPage.close();

  const reducedEffectsPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await reducedEffectsPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
  await reducedEffectsPage.waitForFunction(() => document.querySelector('.journey__stage')?.dataset.renderMode === 'webgl');
  await reducedEffectsPage.locator('.footer-effects-toggle').click();
  await reducedEffectsPage.waitForFunction(() => document.querySelector('.journey__stage')?.dataset.renderMode === 'static');
  const reducedEffectsProof = await reducedEffectsPage.evaluate(() => ({
    renderMode: document.querySelector('.journey__stage')?.getAttribute('data-render-mode'),
    canvasCount: document.querySelectorAll('.journey__canvas').length,
    reduceEffects: document.documentElement.dataset.reduceEffects,
  }));
  await reducedEffectsPage.screenshot({ path: join(outputDir, 'journey-static-reduced-effects-390.png'), fullPage: false });
  console.log(JSON.stringify({ reducedEffects: reducedEffectsProof }));
  await reducedEffectsPage.close();

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
