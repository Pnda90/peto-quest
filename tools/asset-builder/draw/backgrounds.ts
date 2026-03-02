import { GeneratedAsset } from '../assetBuilder';

export function drawBackgrounds(): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];
    const W = 800;
    const H = 400; // A tileable repeating segment

    const createLayer = (id: string, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d')!;
        drawFn(ctx);
        assets.push({ id, canvas, type: 'image' });
    };

    // Layer 1: Far background (Intestine walls)
    createLayer('bg_layer_1', (ctx) => {
        // Fleshy pink gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#ff99aa');
        grad.addColorStop(1, '#cc4466');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Subtle veins
        ctx.strokeStyle = 'rgba(200, 50, 80, 0.2)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            ctx.moveTo(Math.random() * W, 0);
            ctx.bezierCurveTo(
                Math.random() * W, H / 3,
                Math.random() * W, H * 0.66,
                Math.random() * W, H
            );
        }
        ctx.stroke();
    });

    // Layer 2: Midground details (Acid pools / folds)
    createLayer('bg_layer_2', (ctx) => {
        ctx.fillStyle = '#ff6688';
        ctx.strokeStyle = '#bb2244';
        ctx.lineWidth = 4;

        // Draw repeating organic shapes on the sides
        const drawFold = (x: number, y: number, w: number, h: number) => {
            ctx.beginPath();
            ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        };

        drawFold(50, 100, 80, 150);
        drawFold(750, 250, 90, 200);
        drawFold(W / 2, -50, 150, 100);
    });

    // We will tile this vertically in Phaser
    return assets;
}
