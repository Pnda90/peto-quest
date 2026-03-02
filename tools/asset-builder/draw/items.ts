import { GeneratedAsset } from '../assetBuilder';

export function drawItems(): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];

    const createSingleAsset = (id: string, drawFn: (ctx: CanvasRenderingContext2D) => void, width = 64, height = 64): GeneratedAsset => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        drawFn(ctx);
        return { id, canvas, type: 'image' };
    };

    // 1. Coin (Fagiolo / Bean)
    assets.push(createSingleAsset('item_coin', (ctx) => {
        ctx.translate(32, 32);

        // Bean base
        ctx.fillStyle = '#964B00'; // Brown
        ctx.strokeStyle = '#3E1F00';
        ctx.lineWidth = 3;

        ctx.beginPath();
        // Draw a kidney bean shape
        ctx.bezierCurveTo(-15, -20, 15, -20, 20, 0);
        ctx.bezierCurveTo(25, 20, 0, 25, -15, 15);
        ctx.bezierCurveTo(-25, 5, -20, -10, -15, -20);
        ctx.fill();
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(5, -5, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Shadow/Detail line
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-5, 5, 8, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
    }));

    // 2. Power-up Invincibility (Star/Shield)
    assets.push(createSingleAsset('item_invincibility', (ctx) => {
        ctx.translate(32, 32);

        // Glowing aura
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();

        // Star shape
        ctx.fillStyle = '#FFF500';
        ctx.strokeStyle = '#FFB800';
        ctx.lineWidth = 2;

        const spikes = 5;
        const outerRadius = 20;
        const innerRadius = 10;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI * i) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }));

    // 3. Power-up Magnet (Horseshoe Magnet)
    assets.push(createSingleAsset('item_magnet', (ctx) => {
        ctx.translate(32, 32);

        // Magnet body
        ctx.fillStyle = '#E32636'; // Red
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(0, 0, 20, Math.PI, 0); // top half ring
        ctx.lineTo(20, 15);
        ctx.lineTo(10, 15);
        ctx.lineTo(10, 0);
        ctx.arc(0, 0, 10, 0, Math.PI, true); // inner half ring
        ctx.lineTo(-10, 15);
        ctx.lineTo(-20, 15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Magnet poles (Silver/Grey)
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle = '#696969';

        // Left pole
        ctx.fillRect(-20, 15, 10, 8);
        ctx.strokeRect(-20, 15, 10, 8);

        // Right pole
        ctx.fillRect(10, 15, 10, 8);
        ctx.strokeRect(10, 15, 10, 8);

    }));

    return assets;
}
