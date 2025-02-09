const puppeteer = require('puppeteer-extra'); // Fix import
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // Fix import

const takeScreenshot = async (url, filePath, useStealth) => {
  if (useStealth) puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);
  
  await page.screenshot({ path: filePath, fullPage: true });
  await browser.close();
};

(async () => {
  const url = 'https://bot.sannysoft.com';
  
  await takeScreenshot(url, 'screenshot_without_stealth.png', false);
  await takeScreenshot(url, 'screenshot_with_stealth.png', true);
})();
