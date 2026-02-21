import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';

export class SettingsScene extends Phaser.Scene {
  private audioSystem!: AudioSystem;
  private soundBtnText!: Phaser.GameObjects.Text;

  constructor() {
    super('SettingsScene');
  }

  create() {
    this.audioSystem = AudioSystem.getInstance();
    this.audioSystem.resume();
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    this.add.rectangle(0, 0, w, h, 0x111111).setOrigin(0, 0);

    // Title
    this.add
      .text(w / 2, 100, 'SETTINGS', {
        fontSize: '48px',
        color: '#ffcc00',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    // Sound Toggle Button
    const initData = SaveManager.getSaveData();
    const soundLabel = initData.audioEnabled ? 'Sound: ON' : 'Sound: OFF';
    const soundColor = initData.audioEnabled ? '#00ff00' : '#ff2222';

    this.soundBtnText = this.add
      .text(w / 2, h / 2 - 50, soundLabel, {
        fontSize: '32px',
        color: soundColor,
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.soundBtnText.on('pointerup', () => {
      const isMuted = this.audioSystem.toggleMute();

      this.soundBtnText.setText(isMuted ? 'Sound: OFF' : 'Sound: ON');
      this.soundBtnText.setColor(isMuted ? '#ff2222' : '#00ff00');

      if (!isMuted) {
        this.audioSystem.playCoin(); // test sound
      }
    });

    // Back Button
    const backBtn = this.add
      .text(w / 2, h - 100, '< BACK TO MENU', {
        fontSize: '32px',
        color: '#aaaaaa',
        fontStyle: 'bold'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => {
      this.scene.start(CONSTS.SCENES.MENU);
    });
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
  }
}
