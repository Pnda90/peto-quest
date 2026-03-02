import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x0a1a2e, 0x2d1054);
    bg.fillRect(0, 0, w, h);

    // Floating particles
    this.add.particles(0, 0, 'menu_particle', {
      x: { min: 0, max: w },
      y: { min: 0, max: h },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.15, end: 0 },
      lifespan: 5000,
      frequency: 400,
      tint: [0xfbbf24, 0xa855f7],
      speed: { min: 5, max: 15 },
      gravityY: -10
    });

    // Title
    this.add.text(w / 2, 70, '🏅 TOP SCALATORI', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '42px',
      color: '#fbbf24',
      fontStyle: '800',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const leaderboard = SaveManager.getLeaderboard();

    if (leaderboard.length === 0) {
      this.add.text(w / 2, h / 2, 'Nessun record ancora...\nInizia a scalare! 💨', {
        fontFamily: CONSTS.FONT_FAMILY,
        fontSize: '22px',
        color: '#555577',
        align: 'center'
      }).setOrigin(0.5);
    } else {
      const medals = ['🥇', '🥈', '🥉'];
      const medalColors = ['#fbbf24', '#c0c0c0', '#cd7f32'];

      leaderboard.forEach((entry, index) => {
        const y = 150 + index * 60;
        const isTop3 = index < 3;

        // Row background
        const rowBg = this.add.graphics();
        rowBg.fillStyle(isTop3 ? 0x1a1a2e : 0x0f0f1e, isTop3 ? 0.8 : 0.6);
        rowBg.fillRoundedRect(w / 2 - 280, y - 20, 560, 48, 12);
        if (isTop3) {
          rowBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(medalColors[index]).color, 0.4);
          rowBg.strokeRoundedRect(w / 2 - 280, y - 20, 560, 48, 12);
        }

        // Rank
        const rankText = isTop3 ? medals[index] : `${index + 1}.`;
        this.add.text(w / 2 - 250, y + 4, rankText, {
          fontFamily: CONSTS.FONT_FAMILY,
          fontSize: isTop3 ? '26px' : '18px',
          color: isTop3 ? medalColors[index] : '#555577',
          fontStyle: '700'
        }).setOrigin(0, 0.5);

        // Score
        this.add.text(w / 2 - 160, y + 4, `${entry.score}`, {
          fontFamily: CONSTS.FONT_FAMILY,
          fontSize: '20px',
          color: isTop3 ? '#ffffff' : '#888888',
          fontStyle: '700'
        }).setOrigin(0, 0.5);

        // Distance
        this.add.text(w / 2 + 40, y + 4, `${entry.distance}m`, {
          fontFamily: CONSTS.FONT_FAMILY,
          fontSize: '16px',
          color: '#666688'
        }).setOrigin(0, 0.5);

        // Date
        this.add.text(w / 2 + 250, y + 4, entry.date, {
          fontFamily: CONSTS.FONT_FAMILY,
          fontSize: '13px',
          color: '#444466'
        }).setOrigin(1, 0.5);
      });
    }

    // Back button
    const backBtn = this.add.text(w / 2, h - 80, '← INDIETRO', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#555577',
      fontStyle: '600'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
    backBtn.on('pointerover', () => backBtn.setColor('#a855f7'));
    backBtn.on('pointerout', () => backBtn.setColor('#555577'));
  }
}
