import { chromium } from 'playwright';

const baseUrl = new URL(process.env.AERIS_BASE_URL ?? 'http://127.0.0.1:5173/');
const failures = [];
const browser = await chromium.launch({ headless: true });
try {
  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJs = await noJsContext.newPage();
  await noJs.goto(baseUrl.href, { waitUntil: 'domcontentloaded' });
  const fallback = await noJs.evaluate(() => ({ visible: getComputedStyle(document.querySelector('#no-js-cloud-journey')).display !== 'none', cards: document.querySelectorAll('#no-js-cloud-journey article').length, nav: [...document.querySelectorAll('#no-js-cloud-journey nav a')].every((link) => link.getBoundingClientRect().height >= 44) }));
  if (!fallback.visible || fallback.cards !== 4 || !fallback.nav) failures.push({ mode: 'no-js', ...fallback });
  await noJsContext.close();

  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseUrl.href, { waitUntil: 'domcontentloaded' });
  await page.locator('.journey__stage').waitFor();
  await page.keyboard.press('Tab');
  const skipLink = await page.evaluate(() => document.activeElement?.textContent?.trim());
  if (skipLink !== 'Skip to main content') failures.push({ mode: 'keyboard', skipLink });
  const fullMode = await page.evaluate(() => ({
    decorativePlanesHidden: [...document.querySelectorAll('.journey__stage .journey__plane')].filter((element) => !element.classList.contains('journey__plane--beats') && !element.classList.contains('journey__debug-plane') && !element.classList.contains('journey__layer-debug')).every((element) => element.getAttribute('aria-hidden') === 'true'),
    photosHaveAlt: [...document.querySelectorAll('.cloud-journey img:not(.cloud-journey__static-cloud)')].every((image) => image.hasAttribute('alt') && image.getAttribute('alt').trim().length > 0),
  }));
  if (!fullMode.decorativePlanesHidden || !fullMode.photosHaveAlt) failures.push({ mode: 'full', ...fullMode });
  const targets = await page.evaluate(() => [...document.querySelectorAll('a[href],button,input,select,textarea')].filter((element) => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && Number(style.opacity) > .01 && (rect.width < 44 || rect.height < 44);
  }).map((element) => ({ tag: element.tagName, href: element.getAttribute('href'), className: element.className, parent: element.parentElement?.className, grandparent: element.parentElement?.parentElement?.className, visibility: getComputedStyle(element).visibility, opacity: getComputedStyle(element).opacity, text: element.textContent.trim().slice(0, 50), width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) })));
  if (targets.length) failures.push({ mode: 'mobile-targets', targets });
  await page.close();

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await reduced.goto(baseUrl.href, { waitUntil: 'domcontentloaded' });
  await reduced.locator('.journey__stage').waitFor();
  await reduced.evaluate(() => document.fonts.ready);
  const reducedMode = await reduced.evaluate(() => ({
    birds: getComputedStyle(document.querySelector('.journey__birds')).display,
    children: getComputedStyle(document.querySelector('.journey__children')).display,
    shootingStars: document.querySelectorAll('.journey__stars .shooting-star, .cloud-journey__shooting-star').length,
    animations: [...document.querySelectorAll('.journey__sun-disc,.journey__tree-art #canopy,.journey__cloud img')].map((element) => getComputedStyle(element)).filter((style) => style.animationName !== 'none' && style.animationPlayState !== 'paused').map((style) => `${style.animationName}:${style.animationPlayState}`),
    staticStory: document.querySelectorAll('.cloud-journey__static-block').length,
  }));
  if (reducedMode.birds !== 'none' || reducedMode.children !== 'none' || reducedMode.shootingStars || reducedMode.animations.length || reducedMode.staticStory < 4) failures.push({ mode: 'reduced-motion', ...reducedMode });
  if (errors.length) failures.push({ mode: 'runtime', errors });
  await reduced.close();

  for (const route of ['/atlas', '/planner', '/collections', '/login', '/register', '/contact']) {
    const routePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const routeErrors = [];
    routePage.on('pageerror', (error) => routeErrors.push(error.message));
    await routePage.goto(new URL(route, baseUrl).href, { waitUntil: 'domcontentloaded' });
    await routePage.locator('#root').waitFor();
    await routePage.waitForTimeout(350);
    if (routeErrors.length) failures.push({ route, errors: routeErrors });
    await routePage.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else console.log('Accessibility passed: no-JS fallback, reduced motion, keyboard skip link, scene semantics, photo alternatives, 44 px mobile targets, and six core routes.');
