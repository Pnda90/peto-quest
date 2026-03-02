import Phaser from 'phaser';
import { CONSTS } from '../consts';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(CONSTS.SCENES.PRELOAD);
  }

  preload() {
    this.createLoadingBar();

    // Load generated assets
    this.load.setPath('generated/');

    // Atlas
    this.load.atlas('player', 'player.png', 'player.json');

    // Images (obs_trap, item_invincibility, item_magnet are procedural — created in BootScene)
    this.load.image('obs_spike', 'obs_spike.png');
    this.load.image('item_coin', 'item_coin.png');
    this.load.image('bg_layer_1', 'bg_layer_1.png');
    this.load.image('bg_layer_2', 'bg_layer_2.png');
    this.load.image('particle_puff', 'particle_puff.png');
  }

  create() {
    this.createAnimations();
    this.scene.start(CONSTS.SCENES.MENU);
  }

  private createAnimations() {
    this.anims.create({
      key: 'player_run',
      frames: [
        { key: 'player', frame: 'run_0' },
        { key: 'player', frame: 'run_1' },
        { key: 'player', frame: 'run_2' },
        { key: 'player', frame: 'run_3' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player', frame: 'jump' }],
      frameRate: 1
    });

    this.anims.create({
      key: 'player_slide',
      frames: [{ key: 'player', frame: 'slide' }],
      frameRate: 1
    });

    this.anims.create({
      key: 'player_dead',
      frames: [{ key: 'player', frame: 'dead' }],
      frameRate: 1
    });
  }

  private createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x1a0a2e);
    bg.fillRect(0, 0, width, height);

    // Title
    const title = this.add.text(width / 2, height / 2 - 120, 'PETO QUEST', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '56px',
      color: CONSTS.COLORS.TITLE,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 - 65, "L'Avventura Gassosa", {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#a855f7',
      fontStyle: '600'
    });
    subtitle.setOrigin(0.5);

    // Loading bar container with rounded corners
    const barWidth = 320;
    const barHeight = 24;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 20;

    const prgBox = this.add.graphics();
    prgBox.fillStyle(0x1a1a2e, 0.9);
    prgBox.fillRoundedRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8, 16);
    prgBox.lineStyle(2, 0x7c3aed, 0.6);
    prgBox.strokeRoundedRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8, 16);

    const prgBar = this.add.graphics();

    // Percentage text
    const percentText = this.add.text(width / 2, barY + barHeight + 30, '0%', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '18px',
      color: '#a855f7',
      fontStyle: '600'
    });
    percentText.setOrigin(0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, barY + barHeight + 60, 'Preparando i gas...', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '14px',
      color: '#666688'
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      prgBar.clear();
      // Gradient bar effect
      prgBar.fillStyle(0x7c3aed, 1);
      prgBar.fillRoundedRect(barX, barY, barWidth * value, barHeight, 12);
      // Bright overlay stripe
      prgBar.fillStyle(0xa855f7, 0.5);
      prgBar.fillRoundedRect(barX, barY, barWidth * value, barHeight / 2, { tl: 12, tr: 12, bl: 0, br: 0 });

      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      prgBar.destroy();
      prgBox.destroy();
      percentText.destroy();
      loadingText.destroy();
    });
  }
}
