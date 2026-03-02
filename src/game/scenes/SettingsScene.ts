import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';

export class SettingsScene extends Phaser.Scene {
  private audioSystem!: AudioSystem;

  constructor() {
    super('SettingsScene');
  }

  create() {
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.audioSystem = AudioSystem.getInstance();
    this.audioSystem.resume();
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x2d1054);
    bg.fillRect(0, 0, w, h);

    // Title
    this.add.text(w / 2, 100, '⚙️ IMPOSTAZIONI', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '42px',
      color: '#a855f7',
      fontStyle: '800',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Sound Toggle
    const initData = SaveManager.getSaveData();
    let isAudioOn = initData.audioEnabled;

    const toggleContainer = this.add.container(w / 2, h / 2 - 50);

    // Toggle background card
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x141428, 0.9);
    cardBg.fillRoundedRect(-200, -40, 400, 80, 16);
    cardBg.lineStyle(2, 0x333355, 0.5);
    cardBg.strokeRoundedRect(-200, -40, 400, 80, 16);
    toggleContainer.add(cardBg);

    // Label
    const label = this.add.text(-160, 0, '🔊 Audio', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: '700'
    }).setOrigin(0, 0.5);
    toggleContainer.add(label);

    // Toggle switch
    const switchW = 70;
    const switchH = 34;
    const switchX = 130;

    const switchBg = this.add.graphics();
    const switchKnob = this.add.graphics();

    const drawToggle = (on: boolean) => {
      switchBg.clear();
      switchBg.fillStyle(on ? 0x22c55e : 0x374151, 1);
      switchBg.fillRoundedRect(switchX - switchW / 2, -switchH / 2, switchW, switchH, switchH / 2);

      switchKnob.clear();
      const knobX = on ? switchX + switchW / 2 - 19 : switchX - switchW / 2 + 5;
      switchKnob.fillStyle(0xffffff, 1);
      switchKnob.fillCircle(knobX + 7, 0, 12);
    };
    drawToggle(isAudioOn);
    toggleContainer.add(switchBg);
    toggleContainer.add(switchKnob);

    // Status text
    const statusText = this.add.text(switchX, 30, isAudioOn ? 'Attivo' : 'Disattivato', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '13px',
      color: isAudioOn ? '#22c55e' : '#666688'
    }).setOrigin(0.5);
    toggleContainer.add(statusText);

    // Make toggle interactive
    toggleContainer.setSize(400, 80);
    toggleContainer.setInteractive({ useHandCursor: true });

    toggleContainer.on('pointerup', () => {
      const isMuted = this.audioSystem.toggleMute();
      isAudioOn = !isMuted;
      drawToggle(isAudioOn);
      statusText.setText(isAudioOn ? 'Attivo' : 'Disattivato');
      statusText.setColor(isAudioOn ? '#22c55e' : '#666688');
      if (isAudioOn) this.audioSystem.playCoin();
    });

    toggleContainer.on('pointerover', () => {
      this.tweens.add({ targets: toggleContainer, scale: 1.02, duration: 100 });
    });
    toggleContainer.on('pointerout', () => {
      this.tweens.add({ targets: toggleContainer, scale: 1, duration: 100 });
    });

    // Back button
    const backBtn = this.add.text(w / 2, h - 100, '← TORNA AL MENU', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#555577',
      fontStyle: '700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
    backBtn.on('pointerover', () => backBtn.setColor('#a855f7'));
    backBtn.on('pointerout', () => backBtn.setColor('#555577'));
  }
}
