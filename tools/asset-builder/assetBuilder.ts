import { drawPlayerAtlas } from './draw/player';
import { drawObstacles } from './draw/obstacles';
import { drawBackgrounds } from './draw/backgrounds';
import { drawUI } from './draw/ui';
import { drawItems } from './draw/items';
import { downloadAsset } from './export/exporter';

export interface GeneratedAsset {
    id: string;
    canvas: HTMLCanvasElement;
    type: 'image' | 'spritesheet';
    json?: any; // For atlas data
}

const assets: GeneratedAsset[] = [];

function log(msg: string) {
    const c = document.getElementById('log-container');
    if (c) {
        c.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        c.scrollTop = c.scrollHeight;
    }
}

async function generateAll() {
    log('Starting asset generation...');
    assets.length = 0; // Clear
    const container = document.getElementById('preview-container');
    if (container) container.innerHTML = '';

    // 1. Player (Gassy)
    log('Generating Player Atlas...');
    const playerAssets = drawPlayerAtlas();
    assets.push(...playerAssets);

    // 2. Obstacles
    log('Generating Obstacles...');
    const obstacleAssets = drawObstacles();
    assets.push(...obstacleAssets);

    // 3. Backgrounds
    log('Generating Backgrounds...');
    const bgAssets = drawBackgrounds();
    assets.push(...bgAssets);

    // 4. Items (Coins, Powerups)
    log('Generating Items...');
    const itemAssets = drawItems();
    assets.push(...itemAssets);

    // 5. UI / Particles
    log('Generating UI & Particles...');
    const uiAssets = drawUI();
    assets.push(...uiAssets);

    // Display Previews
    assets.forEach(asset => {
        const card = document.createElement('div');
        card.className = 'asset-card';
        card.innerHTML = `<h3>${asset.id}</h3>`;

        // Clone canvas for display
        const viewCtx = asset.canvas.getContext('2d');
        if (viewCtx) {
            // Create a visual copy that's scaled properly if huge (like backgrounds)
            const previewCanvas = document.createElement('canvas');
            const maxW = 300;
            let ratio = 1;
            if (asset.canvas.width > maxW) {
                ratio = maxW / asset.canvas.width;
            }
            previewCanvas.width = asset.canvas.width * ratio;
            previewCanvas.height = asset.canvas.height * ratio;
            const pctx = previewCanvas.getContext('2d');
            if (pctx) {
                pctx.scale(ratio, ratio);
                pctx.drawImage(asset.canvas, 0, 0);
            }
            card.appendChild(previewCanvas);
        }
        container?.appendChild(card);
    });

    // Expose to window for headless extraction
    (window as any).__GENERATED_ASSETS__ = assets.map(a => ({
        id: a.id,
        dataUrl: a.canvas.toDataURL('image/png'),
        json: a.json
    }));

    log('Generation complete.');
    const btnDownload = document.getElementById('btn-download') as HTMLButtonElement;
    if (btnDownload) btnDownload.disabled = false;
}

function downloadAll() {
    log('Downloading assets... Place them manually in public/generated/ if browser prompts individually, or use a script.');
    // For browser security, downloading many files at once might be blocked. 
    // We trigger them sequentially with a small delay.

    assets.forEach((asset, idx) => {
        setTimeout(() => {
            log(`Downloading ${asset.id}.png...`);
            downloadAsset(asset.canvas, `${asset.id}.png`);

            // If it's a spritesheet with JSON, download the JSON too
            if (asset.json) {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(asset.json, null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = `${asset.id}.json`;
                a.click();
            }
        }, idx * 500); // 500ms delay between downloads
    });
}

// Bind events
document.getElementById('btn-generate')?.addEventListener('click', generateAll);
document.getElementById('btn-download')?.addEventListener('click', downloadAll);
log('Asset Builder initialized. Click Generate to start.');
