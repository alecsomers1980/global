const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message, '\nSTACK:', error.stack));

  console.log('Navigating to https://www.dbib.co.za/ ...');
  await page.goto('https://www.dbib.co.za/', { waitUntil: 'networkidle' });

  console.log('Clicking on find a service...');
  await page.click('a[href="/find-a-service"]');
  
  console.log('Waiting for 10 seconds...');
  await page.waitForTimeout(10000);

  console.log('Checking page text for "Application error"');
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes('Application error')) {
     console.log('FOUND APPLICATION ERROR TEXT ON PAGE');
  }

  console.log('Done checking.');
  await browser.close();
})();
