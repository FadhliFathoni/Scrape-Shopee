const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", // Ganti dengan path Chrome/Chromium di sistem kamu
    profilePath: "C:Users/User/AppData/Local/Google/Chrome/User Data",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.google.com");

  await page.screenshot({ path: "example.png" });

//   await browser.close();
})();
