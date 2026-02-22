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

    // Render Food Options in 3 columns - Expert Layout
    const spacing = 260;
    const startX = w / 2 - spacing;
    CONSTS.FOODS.forEach((food, index) => {
      this.createFoodItem(startX + index * spacing, h / 2 + 50, food);
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
    const cardH = 420;

    // Card Background Layer 1: Outer Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 10, cardW, cardH, 20);
    container.add(shadow);

    // Card Background Layer 2: Main Body (Glass)
    const bg = this.add.graphics();
    const mainColor = Phaser.Display.Color.HexStringToColor(food.color).color;

    const drawCard = (hover: boolean) => {
      bg.clear();
      // Subtle gradient effect simulated with multiple fills or just a base
      bg.fillStyle(hover ? 0x2a2a2a : 0x1a1a1a, 0.9);
      bg.lineStyle(2, hover ? mainColor : 0x333333, 1);
      bg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
      bg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);

      // Top Highlight
      bg.lineStyle(1, 0xffffff, 0.1);
      bg.strokeRoundedRect(-cardW / 2 + 5, -cardH / 2 + 5, cardW - 10, cardH / 2, 15);
    };
    drawCard(false);
    container.add(bg);

    // Food Icon (Expert Procedural Badge)
    const iconContainer = this.add.container(0, -110);

    // 1. Outer Glow Ring
    const outerRing = this.add.graphics();
    outerRing.lineStyle(4, mainColor, 0.2);
    outerRing.strokeCircle(0, 0, 80);
    iconContainer.add(outerRing);

    // 2. Main Circle with Gradient-like feel
    const iconBase = this.add.graphics();
    iconBase.fillStyle(0x000000, 1);
    iconBase.fillCircle(0, 0, 65);
    iconBase.lineStyle(3, mainColor, 1);
    iconBase.strokeCircle(0, 0, 65);

    // 3. Inner Glow
    iconBase.lineStyle(1, 0xffffff, 0.2);
    iconBase.strokeCircle(0, 0, 58);
    iconContainer.add(iconBase);

    // 4. Emoji with Dynamic Shadow
    const emojiMap: { [key: string]: string } = {
      beans: '🫘',
      onion: '🧅',
      chili: '🌶️'
    };
    const iconEmoji = this.add.text(0, 0, emojiMap[food.id] || '❓', {
      fontSize: '72px',
      shadow: { color: food.color, blur: 20, fill: true, stroke: true }
    }).setOrigin(0.5);
    iconContainer.add(iconEmoji);

    container.add(iconContainer);

    // Pulsing animation for the icon on hover (assigned later)
    const iconTween = this.tweens.add({
      targets: iconContainer,
      scale: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      paused: true
    });

    // Food Name
    const nameText = this.add.text(0, 20, food.name.toUpperCase(), {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: cardW - 20 },
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5, 0);
    container.add(nameText);

    // Description
    const descText = this.add.text(0, 100, food.description, {
      fontSize: '15px',
      color: '#888888',
      wordWrap: { width: cardW - 40 },
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5, 0);
    container.add(descText);

    // Bonus Tag (Modern Badge Style)
    const bonusContainer = this.add.container(0, 220);
    const bonusBg = this.add.graphics();
    bonusBg.fillStyle(mainColor, 1);
    bonusBg.fillRoundedRect(-80, -20, 160, 40, 10);
    bonusContainer.add(bonusBg);

    const bonusText = this.add.text(0, 0, food.bonus, {
      fontSize: '16px',
      color: '#000',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    bonusContainer.add(bonusText);
    container.add(bonusContainer);

    // Interaction
    container.setSize(cardW, cardH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, y: y - 10, scale: 1.02, duration: 200, ease: 'Cubic.easeOut' });
      drawCard(true);
      iconTween.play();
      outerRing.alpha = 0.8;
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, y: y, scale: 1, duration: 200, ease: 'Cubic.easeIn' });
      drawCard(false);
      iconTween.pause();
      iconContainer.setScale(1);
      outerRing.alpha = 1;
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
