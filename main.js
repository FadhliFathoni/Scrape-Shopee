import express, { json } from "express";
import { chromium } from "playwright";
import { writeFileSync } from "fs";
import { setTimeout } from "timers/promises";

const app = express();
const PORT = 3000;
app.use(json());

const response = await fetch("http://127.0.0.1:9222/json/version");
const data = await response.json();
console.log("WebSocket URL:", data.webSocketDebuggerUrl);
const wsChromeEndpointurl = data.webSocketDebuggerUrl;

const getRandomDelay = () => Math.floor(Math.random() * 5000) + 1000;

const scrapePage = async (url) => {
  try {
    const browser = await chromium.connectOverCDP(wsChromeEndpointurl);
    const context = browser.contexts()[0];
    const page = await context.newPage();

    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setExtraHTTPHeaders({ Referer: "https://web.telegram.org" });
    await page.goto(url);

    await page.mouse.move(Math.random() * 500, Math.random() * 500);
    await page.waitForTimeout(getRandomDelay());

    const response = await page.waitForResponse(
      (response) =>
        response.url().includes("https://shopee.co.id/api/v4/pdp/get_pc") &&
        response.status() === 200
    );

    const data = await response.json();
    const filename = `data_${Date.now()}.json`;
    writeFileSync("response/" + filename, JSON.stringify(data, null, 2));
    console.log(`Data berhasil disimpan ke ${filename}`);

    const cookies = await context.cookies();
    console.log("Captured Cookies:", cookies);
    writeFileSync(`cookies/my_cookies.json`, JSON.stringify(cookies, null, 2));

    await setTimeout(2000);
    await page.close();
    return { url, data };
  } catch (error) {
    console.error("Error scraping:", url, error);
    return { url, error: "Scraping failed" };
  }
};

app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Invalid URL" });
  }
  console.log(`Scraping URL: ${url}`);
  const result = await scrapePage(url);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
