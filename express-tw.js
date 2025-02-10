const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
    const browser = await chromium.connectOverCDP(wsChromeEndpointurl);
    
  const page = await browser.newPage();

  await page.goto("https://shopee.tw/");

  // Uncomment jika ingin menutup browser setelah selesai
  // await browser.close();
})();
