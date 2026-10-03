import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const phases = process.env.SKY_SHOTS_PHASES
  ? process.env.SKY_SHOTS_PHASES.split(',').map(Number)
  : [0, 0.08, 0.2, 0.38, 0.55, 0.68, 0.78, 0.87, 1];
const viewports = [
  { width: 1920, height: 1080 },
  { width: 390, height: 844 },
];
const outputDirectory = new URL('../shots/', import.meta.url);
const outputPath = fileURLToPath(outputDirectory);
const server = await createServer({
  configFile: './vite.config.ts',
  server: { host: '127.0.0.1', port: 4173, strictPort: true },
});
let browser;

try {
  await server.listen();
  await mkdir(outputPath, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=swiftshader'],
  });
  const failures = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    // The capture environment has no external network. Keep typography on local fallbacks
    // without reporting unavailable Google Fonts as an application runtime error.
    await page.route('https://fonts.googleapis.com/**', (route) => route.fulfill({
      status: 200,
      contentType: 'text/css',
      body: '',
    }));
    page.on('pageerror', (error) => failures.push(`${viewport.width}px page error: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error' || message.type() === 'warning') {
        failures.push(`${viewport.width}px console ${message.type()}: ${message.text()}`);
      }
    });

    for (const progress of phases) {
      const value = progress.toFixed(2);
      await page.goto(`http://127.0.0.1:4173/?sky=${value}`, { waitUntil: 'networkidle', timeout: 60_000 });
      await page.waitForSelector('.sky-timeline[data-webgl-ready="true"]', { timeout: 20_000 });
      await page.waitForTimeout(500);

      const pageState = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        phase: document.body.dataset.skyPhase,
        simulatedTime: document.querySelector('.sky-hud time')?.textContent,
        url: location.href,
        hasMain: Boolean(document.querySelector('main#main-content')),
        poster: document.querySelector('.sky-timeline')?.getAttribute('data-poster'),
        skyState: document.documentElement.dataset.skyState,
        debug: document.querySelector('.sky-timeline__debug')?.textContent,
      }));
      const expectedMinutes = Math.round(5 * 60 + 48 + progress * (23 * 60 + 40 - (5 * 60 + 48)));
      const expectedTime = `${String(Math.floor(expectedMinutes / 60)).padStart(2, '0')}:${String(expectedMinutes % 60).padStart(2, '0')}`;
      if (pageState.simulatedTime !== expectedTime) {
        failures.push(`${viewport.width}px sky=${value} did not freeze at its requested phase (time ${pageState.simulatedTime ?? 'missing'}, expected ${expectedTime})`);
      }
      console.log(`sky=${value} ${viewport.width}px: ${pageState.phase ?? 'missing phase'}, ${pageState.simulatedTime ?? 'missing time'}; ${pageState.poster ?? 'no poster'}, ${pageState.skyState ?? 'no sky state'}, ${pageState.debug ?? 'no debug'}, ${pageState.url}; main=${pageState.hasMain}`);
      const pageWidth = pageState.width;
      if (pageWidth > viewport.width) {
        failures.push(`${viewport.width}px viewport overflows horizontally at sky=${value} (document width ${pageWidth}px)`);
      }

      const filename = `sky-${value}-${viewport.width}.png`;
      await page.screenshot({ path: join(outputPath, filename), animations: 'disabled' });
      console.log(`Saved shots/${filename}`);
    }
    await page.close();
  }

  if (failures.length) {
    console.error('\nIssues found during screenshot capture:');
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  await server.close();
}
