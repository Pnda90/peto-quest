import { GeneratedAsset } from '../assetBuilder';

export function drawPlayerAtlas(): GeneratedAsset[] {
    const assets: GeneratedAsset[] = [];

    // Create a sprite sheet canvas
    // We need frames for: Idle/Run (4 frames), Jump (1 frame), Slide (1 frame), Dead (1 frame)
    // Let's make each frame 128x128
    const frameW = 128;
    const frameH = 128;
    const framesX = 4;
    const framesY = 2; // Row 1: Run(4), Row 2: Jump(1), Slide(1), Dead(1)

    const canvas = document.createElement('canvas');
    canvas.width = frameW * framesX;
    canvas.height = frameH * framesY;
    const ctx = canvas.getContext('2d')!;

    // Drawing helper for Gassy
    const drawGassy = (
        ctx: CanvasRenderingContext2D,
        x: number, y: number,
        squashX: number = 1, squashY: number = 1,
        isSlide: boolean = false, isDead: boolean = false
    ) => {
        ctx.save();
        ctx.translate(x + frameW / 2, y + frameH - 20); // Anchor at bottom center
        ctx.scale(squashX, squashY);

        if (isSlide) {
            ctx.scale(1.2, 0.5);
        }

        // Cloud bubbles
        ctx.fillStyle = isDead ? '#bbbbbb' : '#aaffaa'; // Greenish fart, grey if dead
        ctx.strokeStyle = '#225522';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';

        const path = new Path2D();
        path.arc(0, -40, 35, 0, Math.PI * 2); // Main body
        path.arc(-30, -25, 25, 0, Math.PI * 2); // Left puff
        path.arc(30, -30, 28, 0, Math.PI * 2); // Right puff
        path.arc(-15, -65, 20, 0, Math.PI * 2); // Top left puff
        path.arc(20, -60, 22, 0, Math.PI * 2); // Top right puff

        ctx.stroke(path);
        ctx.fill(path);

        // Inner highlight
        ctx.fillStyle = isDead ? '#cccccc' : '#ccffcc';
        ctx.beginPath();
        ctx.arc(-10, -50, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111111';

        if (isDead) {
            // X eyes
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#111';
            ctx.beginPath();
            ctx.moveTo(-15, -45); ctx.lineTo(-5, -35);
            ctx.moveTo(-5, -45); ctx.lineTo(-15, -35);

            ctx.moveTo(15, -45); ctx.lineTo(5, -35);
            ctx.moveTo(5, -45); ctx.lineTo(15, -35);
            ctx.stroke();
        } else {
            // Normal cute eyes
            ctx.beginPath();
            ctx.ellipse(-10, -40, 5, 8, 0, 0, Math.PI * 2);
            ctx.ellipse(10, -40, 5, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Eye shines
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-12, -43, 2, 0, Math.PI * 2);
            ctx.arc(8, -43, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Mouth
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (isDead) {
            ctx.arc(0, -20, 10, Math.PI, 0); // Frown
        } else if (isSlide) {
            ctx.arc(0, -25, 8, 0, Math.PI); // Open mouth O
        } else {
            ctx.arc(0, -25, 8, 0, Math.PI); // Smile
        }
        ctx.stroke();

        ctx.restore();
    };

    // Run Frames (Row 0, Col 0-3)
    for (let i = 0; i < 4; i++) {
        const squashY = 1 + Math.sin(i * Math.PI) * 0.1; // Bouncing effect
        const squashX = 1 - Math.sin(i * Math.PI) * 0.05;
        drawGassy(ctx, i * frameW, 0, squashX, squashY);
    }

    // Jump Frame (Row 1, Col 0)
    drawGassy(ctx, 0, frameH, 0.9, 1.2); // Stretched vertically

    // Slide Frame (Row 1, Col 1)
    drawGassy(ctx, frameW, frameH, 1, 1, true);

    // Dead Frame (Row 1, Col 2)
    drawGassy(ctx, frameW * 2, frameH, 1.1, 0.9, false, true);

    // Generate JSON Metadata for Phaser Atlas
    const atlasJson = {
        frames: {
            "run_0": { frame: { x: 0, y: 0, w: 128, h: 128 } },
            "run_1": { frame: { x: 128, y: 0, w: 128, h: 128 } },
            "run_2": { frame: { x: 256, y: 0, w: 128, h: 128 } },
            "run_3": { frame: { x: 384, y: 0, w: 128, h: 128 } },
            "jump": { frame: { x: 0, y: 128, w: 128, h: 128 } },
            "slide": { frame: { x: 128, y: 128, w: 128, h: 128 } },
            "dead": { frame: { x: 256, y: 128, w: 128, h: 128 } }
        },
        meta: {
            image: "player.png",
            size: { w: canvas.width, h: canvas.height },
            scale: "1"
        }
    };

    assets.push({
        id: 'player',
        canvas,
        type: 'spritesheet',
        json: atlasJson
    });

    return assets;
}
