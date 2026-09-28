const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
    await page.goto('http://localhost:8501', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    // Scroll down 400px to see the cards and the interactive section
    await page.evaluate(() => window.scrollBy(0, 320));
    await page.waitForTimeout(1000);
    const outPath = 'C:/Users/zeeri/.gemini/antigravity-ide/brain/a66f555b-5885-439e-a98f-89aacc2bcf34/streamlit_scroll.png';
    await page.screenshot({ path: outPath, fullPage: false });
    await browser.close();
    console.log('Scroll screenshot saved to:', outPath);
  } catch (err) {
    console.error('Playwright error:', err.message);
  }
})();
