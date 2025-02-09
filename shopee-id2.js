const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Gunakan Stealth Plugin untuk menghindari deteksi bot
puppeteer.use(StealthPlugin());

(async () => {
    // Baca cookies dari file JSON
    const cookies = JSON.parse(fs.readFileSync('cookies-id.json', 'utf8'));

    // Validasi dan perbaiki nilai sameSite jika invalid
    const validSameSite = ["Strict", "Lax", "None"];
    cookies.forEach(cookie => {
        if (!validSameSite.includes(cookie.sameSite)) {
            cookie.sameSite = "Lax"; // Default ke "Lax" jika invalid
        }
        // Pastikan secure: true jika sameSite=None
        if (cookie.sameSite === "None" && !cookie.secure) {
            cookie.secure = true;
        }
    });

    // Konfigurasi proxy yang sudah ada
    const PROXY_SERVER = "http://superproxy.zenrows.com:1337";
    const PROXY_USERNAME = "2PdkzxPXKkWT";
    const PROXY_PASSWORD = "WQ8n2kCDSdm0_country-id";

    // Luncurkan browser dengan proxy dan stealth mode
    const browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${PROXY_SERVER}`],
    });

    const page = await browser.newPage();

    // Set autentikasi proxy
    await page.authenticate({
        username: PROXY_USERNAME,
        password: PROXY_PASSWORD
    });

    // Tambahkan cookies ke page
    await page.setCookie(...cookies);

    // Buka halaman target
    await page.goto("https://shopee.co.id/product/574569274/28754672975", { waitUntil: "load" });

    // Biarkan halaman terbuka untuk observasi
    // await page.waitForTimeout(30000);

    // Tutup browser setelah selesai
    // await browser.close();
})();
