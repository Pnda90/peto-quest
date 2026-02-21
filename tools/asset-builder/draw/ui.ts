import { GeneratedAsset } from '../assetBuilder';

export function drawUI(): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];

    const createCanvas = (id: string, w: number, h: number, drawFn: (ctx: CanvasRenderingContext2D) => void) => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        drawFn(ctx);
        assets.push({ id, canvas, type: 'image' });
    };

    // Particle: Small puff
    createCanvas('particle_puff', 32, 32, (ctx) => {
        ctx.fillStyle = 'rgba(150, 255, 150, 0.8)';
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();
    });

    return assets;
}
