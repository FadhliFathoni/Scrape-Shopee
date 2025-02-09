const { chromium } = require('playwright');
const fs = require('fs');

async function getCookies(page) {
    const cookies = await page.context().cookies();
    return cookies;
}

function saveCookies(cookies) {
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
}

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to the target website
    await page.goto('https://shopee.co.id/337-Sliver-Pisau-Cutter-Kater-Kecil-Besi-30-60-Derajat-Degrees-Stainless-Samoyed-Knife-Pisau-Steel-Pemotong-Kertas-Packing-i.1112772825.26201646655?sp_atk=f89bd17b-9571-4e79-92e1-ea17626a8731&xptdk=f89bd17b-9571-4e79-92e1-ea17626a8731&is_from_login=true&is_from_login=true&is_from_login=true');

    // Wait for user login and save cookies
    console.log('After logging into Telegram, press Enter to save cookies...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    const cookies = await getCookies(page);
    saveCookies(cookies);
    console.log('Cookies are saved in the cookies.json file');

    await browser.close();
})();
