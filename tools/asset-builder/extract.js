import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
    console.log('Starting headless browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    const url = 'http://localhost:3000/tools/asset-builder/';
    console.log('Opening:', url);
    await page.goto(url, { waitUntil: 'networkidle0' });

    console.log('Generating assets via browser context...');

    await page.waitForSelector('#btn-generate');
    await page.click('#btn-generate');

    // Wait to generate explicitly
    await page.waitForFunction(() => {
        return window.__GENERATED_ASSETS__ !== undefined;
    }, { timeout: 10000 });

    // Extract from window
    const assets = await page.evaluate(() => {
        return window.__GENERATED_ASSETS__ || [];
    });

    console.log(`Found ${assets.length} assets. Saving to public/generated...`);

    const outDir = path.resolve(process.cwd(), './public/generated');
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const asset of assets) {
        if (!asset.dataUrl) continue;

        // Convert data:image/png;base64,... back to binary
        const base64Data = asset.dataUrl.replace(/^data:image\/png;base64,/, "");
        const imgPath = path.join(outDir, `${asset.id}.png`);
        fs.writeFileSync(imgPath, base64Data, 'base64');
        console.log(`Saved ${imgPath}`);

        if (asset.json) {
            const jsonPath = path.join(outDir, `${asset.id}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(asset.json, null, 2));
            console.log(`Saved ${jsonPath}`);
        }
    }

    await browser.close();
    console.log('Done!');
}

run().catch(console.error);
