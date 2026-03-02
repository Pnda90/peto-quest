import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { AudioSystem } from '../systems/AudioSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(CONSTS.SCENES.BOOT);
  }

  create() {
    // Initialize AudioSystem Singleton
    const audio = AudioSystem.getInstance();
    audio.init();

    // Create a glow texture for powerups
    const glow = this.add.graphics();
    glow.fillStyle(0xffffff, 1);
    glow.fillCircle(64, 64, 64);
    glow.generateTexture('glow', 128, 128);
    glow.destroy();

    // --- Invincibility Star (golden 5-point star) ---
    const starSize = 64;
    const starG = this.add.graphics();
    // Outer glow
    starG.fillStyle(0xffaa00, 0.25);
    starG.fillCircle(starSize / 2, starSize / 2, 30);
    // Star shape
    const cx = starSize / 2;
    const cy = starSize / 2;
    const outerR = 22;
    const innerR = 10;
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
      const r = i % 2 === 0 ? outerR : innerR;
      points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    starG.fillStyle(0xfbbf24, 1);
    starG.beginPath();
    starG.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      starG.lineTo(points[i].x, points[i].y);
    }
    starG.closePath();
    starG.fillPath();
    // Inner highlight
    starG.fillStyle(0xfff176, 0.7);
    const innerPoints: { x: number; y: number }[] = [];
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 2) * -1 + (Math.PI / 5) * i;
      const r = i % 2 === 0 ? outerR * 0.6 : innerR * 0.6;
      innerPoints.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    starG.beginPath();
    starG.moveTo(innerPoints[0].x, innerPoints[0].y);
    for (let i = 1; i < innerPoints.length; i++) {
      starG.lineTo(innerPoints[i].x, innerPoints[i].y);
    }
    starG.closePath();
    starG.fillPath();
    // Center dot
    starG.fillStyle(0xffffff, 0.5);
    starG.fillCircle(cx, cy - 2, 4);
    starG.generateTexture('item_invincibility', starSize, starSize);
    starG.destroy();

    // --- Magnet (horseshoe shape) ---
    const magSize = 64;
    const magG = this.add.graphics();
    // Blue glow
    magG.fillStyle(0x3b82f6, 0.2);
    magG.fillCircle(magSize / 2, magSize / 2, 30);
    // Horseshoe body (red arc)
    magG.lineStyle(10, 0xef4444, 1);
    magG.beginPath();
    magG.arc(magSize / 2, magSize / 2 - 2, 16, Math.PI, 0, false);
    magG.strokePath();
    // Left leg
    magG.fillStyle(0xef4444, 1);
    magG.fillRect(magSize / 2 - 24, magSize / 2 - 4, 10, 18);
    // Right leg
    magG.fillRect(magSize / 2 + 14, magSize / 2 - 4, 10, 18);
    // Tips (silver)
    magG.fillStyle(0xc0c0c0, 1);
    magG.fillRect(magSize / 2 - 24, magSize / 2 + 12, 10, 8);
    magG.fillRect(magSize / 2 + 14, magSize / 2 + 12, 10, 8);
    // Tip highlights
    magG.fillStyle(0xe8e8e8, 0.8);
    magG.fillRect(magSize / 2 - 22, magSize / 2 + 13, 4, 3);
    magG.fillRect(magSize / 2 + 16, magSize / 2 + 13, 4, 3);
    // Lightning sparks
    magG.lineStyle(2, 0xfbbf24, 0.9);
    magG.lineBetween(magSize / 2 - 28, magSize / 2, magSize / 2 - 32, magSize / 2 - 6);
    magG.lineBetween(magSize / 2 + 28, magSize / 2, magSize / 2 + 32, magSize / 2 - 6);
    magG.generateTexture('item_magnet', magSize, magSize);
    magG.destroy();

    // --- Acid Trap (bubbling green pool, wide) ---
    const trapW = 128;
    const trapH = 64;
    const trapG = this.add.graphics();
    // Main pool ellipse
    trapG.fillStyle(0x1a5c1a, 1);
    trapG.fillEllipse(trapW / 2, trapH / 2 + 8, 110, 36);
    // Acid surface
    trapG.fillStyle(0x22c55e, 0.9);
    trapG.fillEllipse(trapW / 2, trapH / 2 + 6, 100, 28);
    // Lighter center
    trapG.fillStyle(0x86efac, 0.5);
    trapG.fillEllipse(trapW / 2, trapH / 2 + 4, 60, 16);
    // Glow rim
    trapG.lineStyle(2, 0x4ade80, 0.8);
    trapG.strokeEllipse(trapW / 2, trapH / 2 + 6, 104, 32);
    // Bubbles
    const bubblePositions = [
      { x: trapW / 2 - 20, y: trapH / 2 - 2, r: 5 },
      { x: trapW / 2 + 15, y: trapH / 2, r: 4 },
      { x: trapW / 2 - 5, y: trapH / 2 + 3, r: 3 },
      { x: trapW / 2 + 30, y: trapH / 2 + 2, r: 3 },
      { x: trapW / 2 - 30, y: trapH / 2 + 5, r: 2 },
    ];
    for (const b of bubblePositions) {
      trapG.fillStyle(0x86efac, 0.7);
      trapG.fillCircle(b.x, b.y, b.r);
      trapG.fillStyle(0xffffff, 0.3);
      trapG.fillCircle(b.x - 1, b.y - 1, b.r * 0.4);
    }
    trapG.generateTexture('obs_trap', trapW, trapH);
    trapG.destroy();

    // Lane glow texture — soft gradient line
    const laneGlow = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const alpha = 0.5 - (i / 20) * 0.5;
      laneGlow.fillStyle(0x8844ff, alpha);
      laneGlow.fillRect(0, i, 12, 1);
      laneGlow.fillRect(0, 39 - i, 12, 1);
    }
    laneGlow.fillStyle(0xcc66ff, 0.8);
    laneGlow.fillRect(4, 18, 4, 4);
    laneGlow.generateTexture('lane_glow', 12, 40);
    laneGlow.destroy();

    // Speed line texture — thin diagonal streak
    const speedLine = this.add.graphics();
    speedLine.fillStyle(0xffffff, 0.6);
    speedLine.fillRect(0, 0, 3, 80);
    speedLine.generateTexture('speed_line', 3, 80);
    speedLine.destroy();

    // Spark texture — small bright circle for coin collect
    const spark = this.add.graphics();
    spark.fillStyle(0xffdd00, 1);
    spark.fillCircle(8, 8, 8);
    spark.fillStyle(0xffffff, 0.8);
    spark.fillCircle(8, 8, 4);
    spark.generateTexture('spark', 16, 16);
    spark.destroy();

    // Trail particle texture — soft colored circle
    const trail = this.add.graphics();
    trail.fillStyle(0x55ff88, 0.6);
    trail.fillCircle(12, 12, 12);
    trail.fillStyle(0xaaffcc, 0.3);
    trail.fillCircle(12, 12, 8);
    trail.generateTexture('trail_particle', 24, 24);
    trail.destroy();

    // Menu particle — small floating dot for background effects
    const menuParticle = this.add.graphics();
    menuParticle.fillStyle(0xffffff, 0.8);
    menuParticle.fillCircle(4, 4, 4);
    menuParticle.generateTexture('menu_particle', 8, 8);
    menuParticle.destroy();

    this.cameras.main.setBackgroundColor(CONSTS.COLORS.BACKGROUND);
    this.scene.start(CONSTS.SCENES.PRELOAD);
  }
}
