import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;
  private finalDistance = 0;
  private finalCoins = 0;

  constructor() {
    super(CONSTS.SCENES.GAMEOVER);
  }

  init(data: { score: number; distance: number; coins: number }) {
    this.finalScore = data.score || 0;
    this.finalDistance = data.distance || 0;
    this.finalCoins = data.coins || 0;
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const w = this.scale.width;
    const h = this.scale.height;

    // Save progress
    SaveManager.addCoins(this.finalCoins);
    const isNewHighScore = SaveManager.updateHighScore(this.finalScore);

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a0a, 0x1a0a0a, 0x2e0a0a, 0x0a0a1a);
    bg.fillRect(0, 0, w, h);

    // Floating particles
    this.add.particles(0, 0, 'menu_particle', {
      x: { min: 0, max: w },
      y: { min: 0, max: h },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.15, end: 0 },
      lifespan: 5000,
      frequency: 400,
      tint: [0xef4444, 0xdc2626, 0xa855f7],
      speed: { min: 5, max: 15 },
      gravityY: -10
    });

    // Game Over Title
    const title = this.add.text(w / 2, h / 4 - 30, 'PARTITA FINITA', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '56px',
      color: '#ef4444',
      fontStyle: '900',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { color: '#ff0000', blur: 20, fill: true, stroke: true }
    }).setOrigin(0.5);

    // New Record effect
    if (isNewHighScore) {
      const highscoreText = this.add.text(w / 2, h / 4 + 30, '⭐ NUOVO RECORD! ⭐', {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '26px',
        color: '#fbbf24',
        fontStyle: '800',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.tweens.add({
        targets: highscoreText,
        scaleX: 1.15, scaleY: 1.15,
        duration: 600, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.cameras.main.flash(500, 251, 191, 36);

      // Gold particles
      this.add.particles(w / 2, h / 4 + 30, 'spark', {
        speed: { min: 50, max: 150 },
        scale: { start: 1, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 2000,
        quantity: 3,
        frequency: 100,
        tint: [0xfbbf24, 0xffdd00, 0xffffff]
      });
    }

    // Leaderboard check for Top 3
    const leaderboard = SaveManager.getLeaderboard();
    const rankIndex = leaderboard.findIndex(
      (e) => e.score === this.finalScore && e.distance === this.finalDistance
    );
    if (rankIndex >= 0 && rankIndex < 3) {
      const medals = ['🥇', '🥈', '🥉'];
      this.add.text(w / 2, 130, `${medals[rankIndex]} #${rankIndex + 1} NELLA CLASSIFICA!`, {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '28px',
        color: '#fbbf24',
        fontStyle: '800',
        stroke: '#000',
        strokeThickness: 5
      }).setOrigin(0.5);
    }

    // Stats cards
    const statsY = h / 2 - 60;
    const cardW = 360;

    const statsBg = this.add.graphics();
    statsBg.fillStyle(0x000000, 0.5);
    statsBg.fillRoundedRect(w / 2 - cardW / 2, statsY, cardW, 180, 16);
    statsBg.lineStyle(2, 0x333355, 0.5);
    statsBg.strokeRoundedRect(w / 2 - cardW / 2, statsY, cardW, 180, 16);

    // Animated score counter
    const scoreVal = { val: 0 };
    const scoreText = this.add.text(w / 2, statsY + 30, 'Punteggio: 0', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '30px',
      color: '#ffffff',
      fontStyle: '700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: scoreVal,
      val: this.finalScore,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onUpdate: () => scoreText.setText(`Punteggio: ${Math.floor(scoreVal.val)}`)
    });

    // Distance
    const distVal = { val: 0 };
    const distText = this.add.text(w / 2, statsY + 80, 'Distanza: 0m', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#8888aa'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: distVal,
      val: this.finalDistance,
      duration: 1200,
      delay: 300,
      ease: 'Cubic.easeOut',
      onUpdate: () => distText.setText(`Distanza: ${Math.floor(distVal.val)}m`)
    });

    // Coins
    const coinVal = { val: 0 };
    const coinText = this.add.text(w / 2, statsY + 120, '🫘 +0', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '24px',
      color: '#fbbf24',
      fontStyle: '700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: coinVal,
      val: this.finalCoins,
      duration: 1000,
      delay: 600,
      ease: 'Cubic.easeOut',
      onUpdate: () => coinText.setText(`🫘 +${Math.floor(coinVal.val)}`)
    });

    // Buttons
    const btnY = h / 2 + 170;

    this.createBtn(w / 2, btnY, 'GIOCA ANCORA', '🎮', 300, 70, 0x7c3aed, () => {
      this.scene.start(CONSTS.SCENES.SELECTION);
    });

    this.createBtn(w / 2 - 85, btnY + 90, 'NEGOZIO', '🛒', 150, 55, 0xd97706, () => {
      this.scene.start(CONSTS.SCENES.SHOP);
    });

    this.createBtn(w / 2 + 85, btnY + 90, 'INIZIO', '🏠', 150, 55, 0x374151, () => {
      this.scene.start(CONSTS.SCENES.MENU);
    });
  }

  private createBtn(x: number, y: number, text: string, icon: string, w: number, h: number, color: number, callback: () => void) {
    const container = this.add.container(x, y);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(-w / 2 + 3, -h / 2 + 4, w, h, 14);
    container.add(shadow);

    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
    bg.fillStyle(0xffffff, 0.08);
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 2, w - 6, h / 3, { tl: 12, tr: 12, bl: 0, br: 0 });
    bg.lineStyle(1, 0xffffff, 0.1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    container.add(bg);

    const btnText = this.add.text(0, 0, `${icon}  ${text}`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: h > 60 ? '24px' : '18px',
      fontStyle: '700',
      color: '#ffffff'
    }).setOrigin(0.5);
    container.add(btnText);

    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });
    container.on('pointerup', () => {
      this.tweens.add({
        targets: container, scaleX: 0.93, scaleY: 0.93, duration: 80, yoyo: true,
        onComplete: () => callback()
      });
    });
  }
}
