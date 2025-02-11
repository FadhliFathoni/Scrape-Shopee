# Shopee Scraper

## Chrome Setup
1. Add the following option to Chrome properties:
   ```
   --remote-debugging-port=9222
   ```
   example: C:\Users\user\AppData\Local\Google\Chrome\Application\chrome.exe --remote-debugging-port=9222
2. Open Chrome using the default profile.
3. Make sure you are logged into your Shopee account.

## Installation and Running the Server
1. Install dependencies:
   ```sh
   npm install express playwright
   ```
2. Start the server:
   ```sh
   node main.js
   ```

## Example Request
**Endpoint:**
```
http://localhost:3000/scrape
```

**Payload:**
```json
{
    "url": "https://shopee.co.id/product/--i.574569274.28754672975"
}
```