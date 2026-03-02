import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';
import { MissionManager } from '../systems/MissionManager';
import { AudioSystem } from '../systems/AudioSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(CONSTS.SCENES.MENU);
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const w = this.scale.width;
    const h = this.scale.height;
    const saveData = SaveManager.getSaveData();

    // --- Animated Background ---
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x2d1054);
    bg.fillRect(0, 0, w, h);

    // Floating particles
    this.add.particles(0, 0, 'menu_particle', {
      x: { min: 0, max: w },
      y: { min: 0, max: h },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 4000,
      frequency: 200,
      tint: [0xa855f7, 0x7c3aed, 0xfbbf24, 0x22c55e],
      speed: { min: 10, max: 40 },
      gravityY: -20
    });

    // --- Stats Bar (top) ---
    const statsBar = this.add.graphics();
    statsBar.fillStyle(0x000000, 0.5);
    statsBar.fillRoundedRect(15, 15, w - 30, 50, 14);

    this.add.text(30, 28, `🏆 ${saveData.highScore}`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: '700'
    });

    const beansText = this.add.text(w - 30, 28, `🫘 ${saveData.coins}`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#fbbf24',
      fontStyle: '700'
    }).setOrigin(1, 0);

    // --- Title ---
    const title = this.add.text(w / 2, h / 3 - 20, 'PETO QUEST', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '68px',
      color: CONSTS.COLORS.TITLE,
      fontStyle: '900',
      stroke: '#000000',
      strokeThickness: 8,
      shadow: { color: '#ff8800', blur: 30, fill: true, stroke: true, offsetX: 0, offsetY: 0 }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 15,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(w / 2, h / 3 + 45, "L'Avventura Gassosa Definitiva", {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '18px',
      color: '#a855f7',
      fontStyle: '600'
    }).setOrigin(0.5);

    // --- Buttons ---
    const btnY = h / 2 + 80;

    // Play button
    this.createPremiumButton(w / 2, btnY, 'GIOCA ORA', '🎮', 320, 80, 0x7c3aed, 0x9333ea, () => {
      AudioSystem.getInstance().resume();
      this.scene.start(CONSTS.SCENES.SELECTION);
    });

    // Shop button
    this.createPremiumButton(w / 2, btnY + 100, 'NEGOZIO', '🛒', 260, 64, 0xd97706, 0xf59e0b, () => {
      AudioSystem.getInstance().resume();
      this.scene.start('ShopScene');
    });

    // Leaderboard button
    this.createPremiumButton(w / 2, btnY + 180, 'CLASSIFICA', '🏅', 260, 64, 0x0369a1, 0x0ea5e9, () => {
      AudioSystem.getInstance().resume();
      this.scene.start(CONSTS.SCENES.LEADERBOARD);
    });

    // --- Active Mission (Bottom) ---
    const activeMissions = MissionManager.getActiveMissions();
    if (activeMissions.length > 0) {
      const mission = activeMissions[0];
      const progress = SaveManager.getMissionProgress(mission.id);
      const progressPct = Math.min(progress / mission.goal, 1);

      const missionY = h - 250;
      const missionW = 460;

      const missionBg = this.add.graphics();
      missionBg.fillStyle(0x000000, 0.6);
      missionBg.fillRoundedRect(w / 2 - missionW / 2, missionY, missionW, 90, 14);
      missionBg.lineStyle(2, 0xfbbf24, 0.5);
      missionBg.strokeRoundedRect(w / 2 - missionW / 2, missionY, missionW, 90, 14);

      this.add.text(w / 2, missionY + 14, '⭐ MISSIONE ATTIVA', {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '12px',
        color: '#fbbf24',
        fontStyle: '700'
      }).setOrigin(0.5);

      this.add.text(w / 2, missionY + 34, `${mission.description}`, {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '13px',
        color: '#ffffff',
        wordWrap: { width: missionW - 60 },
        align: 'center'
      }).setOrigin(0.5);

      // Progress bar + text inside
      const barW = missionW - 60;
      const barX = w / 2 - barW / 2;
      const barY2 = missionY + 60;
      missionBg.fillStyle(0x1a1a2e, 1);
      missionBg.fillRoundedRect(barX, barY2, barW, 12, 6);
      missionBg.fillStyle(0xfbbf24, 1);
      missionBg.fillRoundedRect(barX, barY2, barW * progressPct, 12, 6);

      this.add.text(w / 2, barY2 + 6, `${progress} / ${mission.goal}`, {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '10px',
        color: '#ffffff',
        fontStyle: '700'
      }).setOrigin(0.5);
    }

    // --- Settings ---
    const settingsBtn = this.add.text(w / 2, h - 140, '⚙️ Impostazioni', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#555577'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    settingsBtn.on('pointerup', () => this.scene.start('SettingsScene'));
    settingsBtn.on('pointerover', () => settingsBtn.setColor('#a855f7'));
    settingsBtn.on('pointerout', () => settingsBtn.setColor('#555577'));

    // --- Instructions ---
    this.add.text(w / 2, h - 90, '⬅️ ➡️ Swipe o Frecce | ⬆️ Salta | ⬇️ Scivola', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '14px',
      color: '#444466',
      align: 'center'
    }).setOrigin(0.5);
  }

  private createPremiumButton(
    x: number, y: number, text: string, icon: string,
    w: number, h: number, color: number, hoverColor: number,
    callback: () => void
  ) {
    const container = this.add.container(x, y);

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 18);
    container.add(shadow);

    // Button background
    const bg = this.add.graphics();
    const drawBg = (c: number) => {
      bg.clear();
      bg.fillStyle(c, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      // Top highlight
      bg.fillStyle(0xffffff, 0.1);
      bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 2, w - 8, h / 3, { tl: 14, tr: 14, bl: 0, br: 0 });
      // Border
      bg.lineStyle(2, 0xffffff, 0.15);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);
    };
    drawBg(color);
    container.add(bg);

    // Text with icon
    const btnText = this.add.text(0, 0, `${icon}  ${text}`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: h > 70 ? '28px' : '22px',
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(btnText);

    // Interactivity
    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 120, ease: 'Cubic.easeOut' });
      drawBg(hoverColor);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120, ease: 'Cubic.easeIn' });
      drawBg(color);
    });

    container.on('pointerup', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.92, scaleY: 0.92,
        duration: 80, yoyo: true,
        onComplete: () => callback()
      });
    });
  }
}
