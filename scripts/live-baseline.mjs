import { chromium } from 'playwright';

const url = 'https://aeris-liart.vercel.app/';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
const page = await context.newPage();
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
const stamp = page.getByText('v0.2 · 2026-10-05', { exact: false }).first();
await stamp.scrollIntoViewIfNeeded({ timeout: 30000 });
const stampVisibleInPrivateContext = await stamp.isVisible();
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(800);
const setup = await page.evaluate(() => {
  const track = document.querySelector('.journey');
  if (!track) throw new Error('Hero journey not found on production page');
  const r = track.getBoundingClientRect();
  const start = r.top + window.scrollY;
  return { start, end: start + track.offsetHeight - window.innerHeight };
});
const session = await context.newCDPSession(page);
await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const gaps = await page.evaluate(async ({ start, end }) => {
  const samples = [];
  const began = performance.now();
  let previous = began;
  await new Promise((resolve) => {
    const tick = (now) => {
      samples.push(now - previous);
      previous = now;
      const fraction = Math.min(1, (now - began) / 10000);
      window.scrollTo(0, start + (end - start) * fraction);
      if (fraction < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
  return samples.slice(1);
}, setup);
await session.detach();
const sorted = [...gaps].sort((a, b) => a - b);
const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
const result = {
  url,
  viewport: '390x844 mobile emulation, DPR 1',
  browser: await page.evaluate(() => navigator.userAgent),
  privateContext: true,
  versionStampVisible: stampVisibleInPrivateContext,
  scrollDurationMs: Math.round(gaps.reduce((a, b) => a + b, 0)),
  cpuThrottle: '4x',
  frameSamples: gaps.length,
  frameTimeMs: { p50: Number(percentile(.50).toFixed(2)), p95: Number(percentile(.95).toFixed(2)), max: Number(sorted.at(-1).toFixed(2)), over24ms: gaps.filter((gap) => gap > 24).length },
  capturedAt: new Date().toISOString(),
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (!result.versionStampVisible) process.exitCode = 1;
