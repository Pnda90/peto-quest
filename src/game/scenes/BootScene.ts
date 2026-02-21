import Phaser from 'phaser';
import { CONSTS } from '../consts';

export class BootScene extends Phaser.Scene {
    constructor() {
        super(CONSTS.SCENES.BOOT);
    }

    create() {
        // Basic setup before preloading (e.g., background color if not set in config)
        this.cameras.main.setBackgroundColor(CONSTS.COLORS.BACKGROUND);

        // Jump to preload immediately
        this.scene.start(CONSTS.SCENES.PRELOAD);
    }
}
