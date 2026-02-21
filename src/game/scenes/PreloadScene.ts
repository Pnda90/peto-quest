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

    // Images
    this.load.image('obs_trap', 'obs_trap.png');
    this.load.image('obs_spike', 'obs_spike.png');
    this.load.image('item_coin', 'item_coin.png');
    this.load.image('item_invincibility', 'item_invincibility.png');
    this.load.image('item_magnet', 'item_magnet.png');
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

    const prgBox = this.add.graphics();
    const prgBar = this.add.graphics();
    prgBox.fillStyle(0x222222, 0.8);
    prgBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const txt = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      font: '20px monospace',
      color: '#ffffff'
    });
    txt.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      prgBar.clear();
      prgBar.fillStyle(0xffffff, 1);
      prgBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      prgBar.destroy();
      prgBox.destroy();
      txt.destroy();
    });
  }
}
