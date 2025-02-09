const { firefox } = require('playwright');
const fs = require('fs');

const userDataDir = './user-data';
const cookiesFile = 'cookies.json';
const tokensFile = 'tokens.json';

// Simpan cookies ke file
async function saveCookies(context) {
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesFile, JSON.stringify(cookies, null, 2));
}

// Muat cookies dari file
async function loadCookies(context) {
    if (fs.existsSync(cookiesFile)) {
        const cookies = JSON.parse(fs.readFileSync(cookiesFile, 'utf-8'));
        await context.addCookies(cookies);
    }
}

// Simpan localStorage ke file
async function saveTokens(page) {
    const tokens = await page.evaluate(() => {
        const storedTokens = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            storedTokens[key] = localStorage.getItem(key);
        }
        return storedTokens;
    });
    fs.writeFileSync(tokensFile, JSON.stringify(tokens, null, 2));
}

// Muat localStorage dari file
async function loadTokens(page) {
    if (fs.existsSync(tokensFile)) {
        const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf-8'));
        await page.addInitScript((tokens) => {
            for (const [key, value] of Object.entries(tokens)) {
                localStorage.setItem(key, value);
            }
        }, tokens);
    }
}

// Tunggu input dari user
function waitForUserInput() {
    return new Promise((resolve) => {
        const onKeyPress = () => {
            process.stdin.off('data', onKeyPress);
            resolve();
        };
        process.stdin.on('data', onKeyPress);
    });
}

(async () => {
    const browser = await firefox.launchPersistentContext(userDataDir, {
        headless: false,
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
    });

    const page = browser.pages()[0] || (await browser.newPage());

    // Muat cookies dan localStorage
    await loadCookies(browser);
    await loadTokens(page);

    await page.goto('https://shopee.co.id/');

    console.log('Login ke Shopee jika diperlukan, lalu tekan Enter untuk menyimpan cookies & tokens...');
    await waitForUserInput();

    // Simpan cookies dan localStorage
    await saveCookies(browser);
    await saveTokens(page);
    console.log('Cookies & tokens telah disimpan.');

    // Uncomment jika ingin menutup browser setelah selesai
    // await browser.close();
})();
