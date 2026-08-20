import { chromium } from 'playwright';
import { spawn } from 'child_process';

(async () => {
  const server = spawn('node', ['node_modules/vite/bin/vite.js'], { stdio: 'pipe', shell: true });
  const errors = [];
  const consoleMessages = [];

  server.stdout.on('data', (data) => {
    const msg = data.toString();
    if (msg.includes('Local:')) console.log('[VITE]', msg.trim());
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      errors.push(text);
      console.log('[CONSOLE ERROR]', text);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(err.message);
    console.log('[PAGE ERROR]', err.message);
  });

  try {
    console.log('Navigating to http://localhost:5174...');
    await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log('Looking for the hall chip...');
    const hallChip = await page.$('button:has-text("$ hall")');
    
    if (hallChip) {
      console.log('Found hall chip, clicking it...');
      await hallChip.click();
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      console.log('Hall chip not found, trying to type "hall" command...');
      const input = await page.$('input[type="text"]');
      if (input) {
        await input.type('hall');
        await input.press('Enter');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        console.log('Input not found either!');
      }
    }

    console.log('\n=== Console errors:', errors.length);
    errors.forEach((e, i) => console.log(`  ${i+1}. ${e}`));

    console.log('\n=== All console messages:');
    consoleMessages.forEach((m, i) => console.log(`  ${i+1}. [${m.type}] ${m.text}`));

    // Check what's rendered
    const stageContent = await page.$eval('.ascii-world-stage', (el) => {
      const canvas = el.querySelector('canvas');
      return {
        hasStage: !!el,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        canvasDisplay: canvas ? window.getComputedStyle(canvas).display : 'no canvas',
        canvasVisibility: canvas ? window.getComputedStyle(canvas).visibility : 'no canvas',
      };
    }).catch(() => ({ error: 'no stage found' }));

    console.log('\n=== Stage content:', JSON.stringify(stageContent, null, 2));

    // Screenshot
    await page.screenshot({ path: 'hall-test.png', fullPage: true });

    // Also check if there's an overlay still showing
    const overlayVisible = await page.$('.ascii-world-overlay') !== null;
    console.log('\n=== Overlay visible:', overlayVisible);

    // Check HUD elements
    const hudTR = await page.$('.ascii-world-hud-tr');
    const hudTRText = hudTR ? await page.evaluate(el => el.textContent, hudTR) : 'null';
    console.log('=== HUD TR text:', hudTRText);

    const hudBL = await page.$('.ascii-world-hud-bl');
    const hudBLText = hudBL ? await page.evaluate(el => el.textContent, hudBL) : 'null';
    console.log('=== HUD BL text:', hudBLText);

  } catch (err) {
    console.log('[ERROR]', err.message);
  } finally {
    await browser.close();
    server.kill();
  }
})();
