const { chromium } = require('playwright');
const fs = require('fs');
const UserAgent = require('user-agents');

// Function to save tokens to a JSON file
function saveTokens(tokens) {
  fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
}

// Function to load tokens from a JSON file
function loadTokens() {
  if (fs.existsSync('tokens.json')) {
    return JSON.parse(fs.readFileSync('tokens.json', 'utf-8'));
  }
  return {};
}

// Utility function to wait for user input
function waitForUserInput() {
  return new Promise((resolve) => {
    const onKeyPress = () => {
      process.stdin.off('data', onKeyPress); // Remove the listener after it's triggered
      resolve();
    };
    process.stdin.on('data', onKeyPress);
  });
}

(async () => {
  const userDataDir = './user-data'; // Change this path if needed

  // Check if tokens.json exists, if not, we will save tokens after login
  const tokens = loadTokens();
  const shouldSaveTokens = Object.keys(tokens).length === 0;

  try {
    const randomUA = new UserAgent().toString();
    // Launch chromium with a persistent context
    console.log(randomUA)
    const browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false, // Set to true if you want to run in headless mode
      // http://VdJQrDDJCCH2:ANzcbOqOLlX4_country-tw@superproxy.zenrows.com:1337
      userAgent: randomUA,
      proxy: {
        server: "http://superproxy.zenrows.com:1337",
        username: "2PdkzxPXKkWT",
        password: "WQ8n2kCDSdm0_country-tw"
      }
    });

    // Access the first page in the persistent context
    const page = browser.pages()[0] || (await browser.newPage());

    // If no tokens are loaded, wait for user login and save tokens
    if (shouldSaveTokens) {
      console.log('Please log in manually...');
      await page.goto('https://web.telegram.org/');
      console.log('After logging into Telegram, press Enter to save tokens...');
      await waitForUserInput(); // Wait for user input

      // Retrieve tokens from localStorage
      const credentials = await page.evaluate(() => {
        const tokens = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          tokens[key] = localStorage.getItem(key);
        }
        return tokens;
      });

      // Save tokens to tokens.json
      saveTokens(credentials);
      console.log('Tokens have been saved to tokens.json');
    } else {
      // If tokens are already saved, set them in localStorage
      await page.addInitScript((tokens) => {
        for (const [key, value] of Object.entries(tokens)) {
          localStorage.setItem(key, value);
        }
      }, tokens);

      // Set referer sebelum membuka halaman
      await page.setExtraHTTPHeaders({
        'Referer': 'https://web.telegram.org/a/#777000',
        'User-Agent': randomUA
      });

      await page.goto('https://web.telegram.org/a/#777000');

      // Verify that localStorage was set correctly
      const storedValue = await page.evaluate(() => localStorage.getItem('user_auth'));
      console.log('Stored user_auth:', storedValue);
    }

    // Close the browser after some time or manually
    // await browser.close();

  } catch (error) {
    console.error('An error occurred:', error);
  }
})();