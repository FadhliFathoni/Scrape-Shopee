const express = require("express");
const { chromium } = require("playwright");
const fs = require("fs");
const { setTimeout } = require("timers/promises");

const app = express();
const PORT = 3000;
app.use(express.json());

const wsChromeEndpointurl =
  "ws://127.0.0.1:9222/devtools/browser/4824d21b-2155-4a4f-9a7a-a64cec188e97";

const getRandomDelay = () => Math.floor(Math.random() * 5000) + 1000;

const scrapePage = async (url) => {
  try {
    // await setTimeout(getRandomDelay());
    const browser = await chromium.connectOverCDP(wsChromeEndpointurl);
    const context = browser.contexts()[0];
    const page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({ Referer: "https://web.telegram.org" });
    await page.goto(url);

    // await setTimeout(getRandomDelay());
    await page.mouse.move(Math.random() * 500, Math.random() * 500);
    await page.waitForTimeout(getRandomDelay());

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes("https://shopee.co.id/api/v4/pdp/get_pc") &&
        response.status() === 200
    );

    const data = await response.json();
    const filename = `data_${Date.now()}.json`;
    fs.writeFileSync("response/"+filename, JSON.stringify(data, null, 2));
    console.log(`Data berhasil disimpan ke ${filename}`);
    await setTimeout(getRandomDelay());
    await page.close();
    return { url, data };
  } catch (error) {
    console.error("Error scraping:", url, error);
    return { url, error: "Scraping failed" };
  }
};

app.post("/batch-scrape", async (req, res) => {
  const urls = req.body.urls;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "Invalid URL array" });
  }

  console.log(`Batch scraping ${urls.length} URLs...`);
  const results = [];
  for (const url of urls) {
    const result = await scrapePage(url);
    results.push(result);
  }
  res.json(results);
    // const results = await Promise.all(urls.map(scrapePage));
    // res.json(results);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
