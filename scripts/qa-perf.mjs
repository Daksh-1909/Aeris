import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:4173';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'ignore' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try { ready = (await fetch(origin)).ok; } catch { /* Preview is still starting. */ }
    if (ready) break;
    await delay(250);
  }
  if (!ready) throw new Error('Production preview did not start on port 4173.');

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(origin, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => window.scrollTo(0, 0));
  const measurements = await page.evaluate(async () => {
    const track = document.querySelector('.journey');
    const scrollDistance = Math.max(1, track.getBoundingClientRect().height - window.innerHeight);
    const gaps = [];
    let last = performance.now();
    let running = true;
    const sampleFrame = (time) => {
      gaps.push(time - last); last = time;
      if (running) requestAnimationFrame(sampleFrame);
    };
    requestAnimationFrame(sampleFrame);
    const started = performance.now();
    for (let step = 1; step <= 100; step += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.scrollTo(0, scrollDistance * step / 100);
    }
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 10000 - (performance.now() - started))));
    running = false;
    const sorted = gaps.slice(1).sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * .95) - 1)] || 0;
    return { samples: sorted.length, p50: sorted[Math.floor(sorted.length * .5)] || 0, p95, max: sorted.at(-1) || 0, over24: sorted.filter((gap) => gap > 24).length };
  });
  console.log(`4x CPU mobile RAF over 10 s: ${JSON.stringify(measurements)}`);
  await browser.close(); browser = undefined;
  const installedChrome = `${process.env.PROGRAMFILES || 'C:/Program Files'}/Google/Chrome/Application/chrome.exe`;
  const chromePath = existsSync(installedChrome) ? installedChrome : chromium.executablePath();
  execFileSync(process.execPath, ['node_modules/@lhci/cli/src/cli.js', 'autorun'], { stdio: 'inherit', env: { ...process.env, CHROME_PATH: chromePath } });
  if (measurements.p95 > 24) throw new Error(`Hero RAF p95 ${measurements.p95.toFixed(1)} ms exceeds the 24 ms budget.`);
} finally {
  await browser?.close();
  server.kill();
}
