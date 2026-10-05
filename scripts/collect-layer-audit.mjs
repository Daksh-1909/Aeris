import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const widths = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900], [1920, 1080]];
const progressValues = [.05, .30, .55, .70, .90];
const output = 'docs/layer-audit/screenshots';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const audit = [];
for (const [width, height] of widths) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:5173/?debug=layers', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('.journey__layer-debug').waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  for (const progress of progressValues) {
    await page.getByLabel('Layer debug progress').evaluate((input, value) => {
      const control = input;
      control.value = String(Math.round(value * 100));
      control.dispatchEvent(new Event('input', { bubbles: true }));
      control.dispatchEvent(new Event('change', { bubbles: true }));
    }, progress);
    await page.waitForTimeout(180);
    const filename = `${width}x${height}-p${String(Math.round(progress * 100)).padStart(2, '0')}.png`;
    await page.screenshot({ path: `${output}/${filename}`, fullPage: false });
    const state = await page.evaluate(() => {
      const rect = (element) => {
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
      };
      const visible = (el) => {
        let n = el;
        while (n) { if (Number(getComputedStyle(n).opacity) < .03 || getComputedStyle(n).display === 'none' || getComputedStyle(n).visibility === 'hidden') return false; n = n.parentElement; }
        return el.getClientRects().length > 0;
      };
      const intersects = (a, b) => a.x < b.right && a.right > b.x && a.y < b.bottom && a.bottom > b.y;
      const text = [...document.querySelectorAll('.journey__scene h1, .journey__copy p, .journey__copy .journey__button, .journey__overlap-front h1, .journey__moment')].filter(visible).map((el) => ({ label: el.textContent.trim().replace(/\s+/g, ' '), type: el.matches('h1') ? 'headline' : el.classList.contains('journey__button') ? 'pill' : 'copy', rect: rect(el), opacity: getComputedStyle(el.parentElement).opacity, z: getComputedStyle(el.parentElement).zIndex }));
      const targets = [...document.querySelectorAll('.journey__orb,.site-header,.journey__tree,.journey__children,.journey__bench-scene,.journey__cloud-layer--near')].filter(visible).map((el) => ({ label: el.dataset.layer || el.className, rect: rect(el), z: getComputedStyle(el).zIndex }));
      const collisions = [];
      for (let i = 0; i < text.length; i++) for (let j = i + 1; j < text.length; j++) if (intersects(text[i].rect, text[j].rect)) collisions.push({ text: text[i].label, withText: text[j].label, kind: 'text-text' });
      for (const a of text) for (const b of targets) if (intersects(a.rect, b.rect)) collisions.push({ text: a.label, with: b.label, kind: 'text-layer' });
      const orb = document.querySelector('.journey__orb');
      const orbStyle = getComputedStyle(orb);
      const contexts = [];
      let parent = orb;
      while (parent && parent !== document.documentElement) {
        const style = getComputedStyle(parent);
        const reasons = [];
        if (style.transform !== 'none') reasons.push(`transform:${style.transform}`);
        if (style.filter !== 'none') reasons.push(`filter:${style.filter}`);
        if (Number(style.opacity) < 1) reasons.push(`opacity:${style.opacity}`);
        if (style.isolation !== 'auto') reasons.push(`isolation:${style.isolation}`);
        if (style.willChange !== 'auto') reasons.push(`will-change:${style.willChange}`);
        if (style.position !== 'static' && style.zIndex !== 'auto') reasons.push(`position:${style.position};z-index:${style.zIndex}`);
        if (reasons.length) contexts.push({ element: parent.className || parent.tagName.toLowerCase(), reasons });
        parent = parent.parentElement;
      }
      const stage = document.querySelector('.journey__stage');
      return { text, targets, collisions, orb: { zIndex: orbStyle.zIndex, position: orbStyle.position, opacity: orbStyle.opacity, contexts }, contexts: [...document.querySelectorAll('.journey__stage *')].filter((el) => { const s = getComputedStyle(el); return s.transform !== 'none' || s.filter !== 'none' || Number(s.opacity) < 1 || s.willChange !== 'auto' || s.position !== 'static' && s.zIndex !== 'auto'; }).map((el) => ({ element: el.className?.baseVal || el.className || el.tagName.toLowerCase(), zIndex: getComputedStyle(el).zIndex, transform: getComputedStyle(el).transform !== 'none', filter: getComputedStyle(el).filter !== 'none', opacity: getComputedStyle(el).opacity, willChange: getComputedStyle(el).willChange })).filter((item) => item.zIndex !== 'auto' || item.transform || item.filter || Number(item.opacity) < 1 || item.willChange !== 'auto'), stage: rect(stage) };
    });
    audit.push({ viewport: `${width}x${height}`, progress, screenshot: filename, ...state });
  }
  await page.close();
}
await browser.close();
await import('node:fs/promises').then(({ writeFile }) => writeFile('docs/layer-audit/data.json', JSON.stringify(audit, null, 2)));
console.log(`Captured ${audit.length} screenshots; ${audit.reduce((sum, item) => sum + item.collisions.length, 0)} geometric text intersections.`);
