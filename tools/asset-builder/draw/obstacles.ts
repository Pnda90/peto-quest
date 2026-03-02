import { GeneratedAsset } from '../assetBuilder';

export function drawObstacles(): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];

    const createSingleAsset = (id: string, drawFn: (ctx: CanvasRenderingContext2D) => void, width = 128, height = 128): GeneratedAsset => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        drawFn(ctx);
        return { id, canvas, type: 'image' };
    };

    // 1. Toot Trap (Bear trap style, but funny)
    assets.push(createSingleAsset('obs_trap', (ctx) => {
        ctx.translate(64, 100);
        // Base
        ctx.fillStyle = '#555';
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 50, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Teeth
        ctx.fillStyle = '#ccc';
        for (let i = -40; i <= 40; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, -10);
            ctx.lineTo(i + 5, -30);
            ctx.lineTo(i + 15, -10);
            ctx.fill();
            ctx.stroke();
        }
    }));

    // 2. Spike Bush (Organic stomach acid thorn)
    assets.push(createSingleAsset('obs_spike', (ctx) => {
        ctx.translate(64, 100);

        // Roots
        ctx.fillStyle = '#990033'; // Deep organic red
        ctx.strokeStyle = '#330000';
        ctx.lineWidth = 5;
        ctx.lineJoin = 'round';

        const drawSpike = (x: number, y: number, angle: number, scale: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.lineTo(0, -80);
            ctx.lineTo(15, 0);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        drawSpike(-20, 0, -0.3, 0.8);
        drawSpike(20, 0, 0.3, 0.8);
        drawSpike(0, 5, 0, 1.1);

    }));

    return assets;
}
