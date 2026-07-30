const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  await page.goto('http://localhost:5178/Image-Keychain/');
  await page.waitForTimeout(3000);
  const size = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return 'NO CANVAS';
    return canvas.width + 'x' + canvas.height;
  });
  console.log('CANVAS SIZE:', size);
  await browser.close();
})();
