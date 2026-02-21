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

    // Game Over Title
    this.add
      .text(w / 2, h / 3 - 50, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff2222',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    // Stats
    this.add
      .text(w / 2, h / 2 - 80, `Score: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    if (isNewHighScore) {
      const highscoreText = this.add
        .text(w / 2, h / 2 - 40, `NEW HIGH SCORE!`, {
          fontSize: '24px',
          color: '#ffcc00',
          fontStyle: 'bold'
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: highscoreText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.cameras.main.flash(500, 255, 204, 0);
    }

    // Leaderboard check for Top 3
    const leaderboard = SaveManager.getLeaderboard();
    const rankIndex = leaderboard.findIndex(
      (e) => e.score === this.finalScore && e.distance === this.finalDistance
    );
    if (rankIndex >= 0 && rankIndex < 3) {
      const rankText = this.add
        .text(w / 2, 130, `#${rankIndex + 1} NELLA CLASSIFICA!`, {
          fontSize: '32px',
          color: '#ffcc00',
          fontStyle: 'bold',
          stroke: '#000',
          strokeThickness: 6
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: rankText,
        scale: 1.1,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    this.add
      .text(w / 2, h / 2, `Distance: ${this.finalDistance}m`, {
        fontSize: '24px',
        color: '#aaaaaa'
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h / 2 + 40, `Beans Collected: +${this.finalCoins}`, {
        fontSize: '24px',
        color: '#ffcc00'
      })
      .setOrigin(0.5);

    // Play Again Button Group
    const btnContainer = this.add.container(w / 2, h / 2 + 120);

    // Fake button background
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x00aa00, 1);
    btnBg.fillRoundedRect(-150, -40, 300, 80, 16);
    btnBg.lineStyle(4, 0xffffff, 1);
    btnBg.strokeRoundedRect(-150, -40, 300, 80, 16);

    const btnText = this.add
      .text(0, 0, 'PLAY AGAIN', {
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);

    // Make container interactive
    btnContainer.setSize(300, 80);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerup', () => {
      btnContainer.setScale(1);
      this.scene.start(CONSTS.SCENES.SELECTION);
    });

    // SHOP & HOME Buttons
    const createSmallBtn = (x: number, y: number, text: string, scene: string, color: number) => {
      const container = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(-70, -30, 140, 60, 12);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeRoundedRect(-70, -30, 140, 60, 12);

      const txt = this.add
        .text(0, 0, text, {
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#ffffff'
        })
        .setOrigin(0.5);

      container.add([bg, txt]);
      container.setSize(140, 60);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerdown', () => container.setScale(0.95));
      container.on('pointerup', () => {
        container.setScale(1);
        this.scene.start(scene);
      });

      return container;
    };

    createSmallBtn(w / 2 - 80, h / 2 + 220, 'SHOP', CONSTS.SCENES.SHOP, 0xffaa00);
    createSmallBtn(w / 2 + 80, h / 2 + 220, 'HOME', CONSTS.SCENES.MENU, 0x444444);
  }
}
