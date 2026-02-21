import Phaser from 'phaser';
import { CONSTS } from '../consts';

export class BootScene extends Phaser.Scene {
    constructor() {
        super(CONSTS.SCENES.BOOT);
    }

    create() {
        // Create a glow texture for powerups to avoid redraws in update loop
        const graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(64, 64, 64);
        graphics.generateTexture('glow', 128, 128);
        graphics.destroy();

        // Basic setup before preloading (e.g., background color if not set in config)
        this.cameras.main.setBackgroundColor(CONSTS.COLORS.BACKGROUND);

        // Jump to preload immediately
        this.scene.start(CONSTS.SCENES.PRELOAD);
    }
}
