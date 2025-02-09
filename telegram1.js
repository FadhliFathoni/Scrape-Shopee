const { chromium } = require('playwright');
const fs = require('fs');

async function getCredentialTokens(page) {
    const tokens = await page.evaluate(() => {
        const tokens = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            tokens[key] = localStorage.getItem(key);
        }
        return tokens;
    });
    return tokens;
}

function saveCredentials(credentials) {
    fs.writeFileSync('tokens.json', JSON.stringify(credentials, null, 2));
}

function loadAndFormatCredentials(filePath) {
    const credentials = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const keysToExtract = ["dc4_auth_key", "dc3_auth_key", "dc2_auth_key", "user_auth"];
    const formattedCredentials = {};

    for (const key of keysToExtract) {
        if (credentials[key]) {
            let value = credentials[key].replace(/^"|"$/g, ''); // Strip outer quotes
            if (value.startsWith("{") && value.endsWith("}")) {
                // Convert a JSON object to a string with escaped quotes
                formattedCredentials[key] = `{${value.slice(1, -1)}}`;
            } else {
                // A regular string with outer quotes
                formattedCredentials[key] = `"${value}"`;
            }
        }
    }

    return formattedCredentials;
}

async function setItem(page, key, value) {
    await page.evaluate((key, value) => {
        localStorage.setItem(key, value);
    }, key, value);
}

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to Telegram Web
    await page.goto('https://web.telegram.org/');

    // Wait for user login and save tokens
    console.log('After logging into Telegram, press Enter to save tokens...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    const credentials = await getCredentialTokens(page);
    saveCredentials(credentials);
    console.log('Tokens are saved in the tokens.json file');

    // Uncomment the following lines to load and apply tokens from the saved file
    /*
    await page.evaluate(() => localStorage.clear());
    const result = loadAndFormatCredentials('tokens.json');
    for (const [key, value] of Object.entries(result)) {
        console.log(`${key}: ${value}`);
        await setItem(page, key, value);
    }
    await page.reload();
    console.log('Tokens have been downloaded and applied.');
    */

    await browser.close();
})();