import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { AudioSystem } from '../systems/AudioSystem';

export class SelectionScene extends Phaser.Scene {
  private audioSystem!: AudioSystem;

  constructor() {
    super(CONSTS.SCENES.SELECTION);
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    this.audioSystem = AudioSystem.getInstance();
    this.audioSystem.init(); // Just in case
    this.audioSystem.resume();
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    this.add.rectangle(0, 0, w, h, 0x111111).setOrigin(0, 0);

    // Title
    this.add
      .text(w / 2, 80, 'COSA MANGIAMO?', {
        fontSize: '48px',
        color: '#ffcc00',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, 130, 'Scegli il tuo destino (e il tuo peto)', {
        fontSize: '20px',
        color: '#aaaaaa'
      })
      .setOrigin(0.5);

    // Render Food Options in 3 columns
    const spacing = 260;
    const startX = w / 2 - spacing;
    CONSTS.FOODS.forEach((food, index) => {
      this.createFoodItem(startX + index * spacing, h / 2, food);
    });

    // Back Button
    const backBtn = this.add
      .text(w / 2, h - 80, '< INDIETRO', {
        fontSize: '24px',
        color: '#888888'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#888888'));
  }

  private createFoodItem(x: number, y: number, food: any) {
    const container = this.add.container(x, y);
    const cardW = 240;
    const cardH = 380;

    // Card Bg
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.lineStyle(2, 0x444444, 1);
    bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
    bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
    container.add(bg);

    // Food Icon (Procedural placeholder that looks like an icon)
    const iconBase = this.add.graphics();
    iconBase.fillStyle(0x333333, 1);
    iconBase.fillCircle(0, -100, 60);
    iconBase.lineStyle(3, food.color, 1);
    iconBase.strokeCircle(0, -100, 60);
    container.add(iconBase);

    // Emoji or Symbol for icon
    const emojiMap: { [key: string]: string } = {
      beans: '🫘',
      onion: '🧅',
      chili: '🌶️'
    };
    const iconEmoji = this.add.text(0, -100, emojiMap[food.id] || '❓', {
      fontSize: '64px'
    }).setOrigin(0.5);
    container.add(iconEmoji);

    // Food Name
    const nameText = this.add.text(0, -10, food.name, {
      fontSize: '24px',
      color: food.color,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: cardW - 20 }
    }).setOrigin(0.5, 0);
    container.add(nameText);

    // Bonus Tag
    const bonusText = this.add
      .text(0, 50, food.bonus, {
        fontSize: '16px',
        color: '#000',
        backgroundColor: food.color,
        padding: { x: 8, y: 4 },
        fontStyle: 'bold'
      })
      .setOrigin(0.5, 0);
    container.add(bonusText);

    // Description
    const descText = this.add.text(0, 100, food.description, {
      fontSize: '14px',
      color: '#aaaaaa',
      wordWrap: { width: cardW - 40 },
      align: 'center'
    }).setOrigin(0.5, 0);
    container.add(descText);

    // Interaction
    container.setSize(cardW, cardH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
      bg.clear();
      bg.fillStyle(0x333333, 1);
      bg.lineStyle(2, food.color, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
      bg.clear();
      bg.fillStyle(0x222222, 1);
      bg.lineStyle(2, 0x444444, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 15);
    });

    container.on('pointerup', () => {
      this.audioSystem.playPeto('start');
      this.cameras.main.flash(500, 255, 255, 255);
      this.time.delayedCall(300, () => {
        this.scene.start(CONSTS.SCENES.GAME, { selectedFood: food.id });
      });
    });
  }
}
