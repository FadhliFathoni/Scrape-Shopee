const { executablePath } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const readline = require("readline");
const axios = require("axios");

const takeScreenshot = async (url, filePath, useStealth) => {
  if (useStealth) puppeteer.use(StealthPlugin());
  const wsChromeEndpointurl =
    "ws://127.0.0.1:9222/devtools/browser/4824d21b-2155-4a4f-9a7a-a64cec188e97";

  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointurl,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.screenshot({ path: filePath, fullPage: true });

  console.log("Screenshot saved to", filePath);
  return { browser, page };
};

const getCookiesFromPage = async (page) => {
  const cookies = await page.cookies();
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
};

const fetchDataAfterEnter = async (apiUrl, headers, params) => {
  console.log("Press Enter to fetch data from the API...");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("", async () => {
    try {
      const response = await axios.get(apiUrl, { headers, params });
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    rl.close();
  });
};

(async () => {
  const pageUrl =
    "https://shopee.co.id/product/574569274/28754672975?is_from_login=true";
  const apiUrl = "https://shopee.co.id/api/v4/pdp/get_pc";
  const params = {
    item_id: "28754672975",
    shop_id: "574569274",
    tz_offset_minutes: "420",
    detail_level: "0",
  };

  console.log("Opening Shopee product page and taking screenshot...");
  const { browser, page } = await takeScreenshot(
    pageUrl,
    "screenshot.png",
    true
  );

  const cookies = await getCookiesFromPage(page);
  console.log("Cookies:", cookies);

  const headers = {
    Referer: pageUrl,
    Cookie: cookies,
  };

  await fetchDataAfterEnter(apiUrl, headers, params);
  // await browser.close();
})();
