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
    this.audioSystem.init();
    this.audioSystem.resume();
    const w = this.scale.width;
    const h = this.scale.height;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2e, 0x2d1054);
    bg.fillRect(0, 0, w, h);

    // Floating particles
    this.add.particles(0, 0, 'menu_particle', {
      x: { min: 0, max: w },
      y: { min: 0, max: h },
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.2, end: 0 },
      lifespan: 5000,
      frequency: 300,
      tint: [0xa855f7, 0x7c3aed],
      speed: { min: 5, max: 20 },
      gravityY: -10
    });

    // Title
    const title = this.add.text(w / 2, 80, 'COSA MANGIAMO?', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '44px',
      color: '#ffcc00',
      fontStyle: '800',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { color: '#ff8800', blur: 20, fill: true, stroke: true }
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: title.y - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(w / 2, 130, 'Scegli il tuo destino (e il tuo peto)', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '16px',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Render Food Options
    const spacing = 260;
    const startX = w / 2 - spacing;
    CONSTS.FOODS.forEach((food, index) => {
      this.createFoodItem(startX + index * spacing, h / 2 + 50, food);
    });

    // Back Button
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

  private createFoodItem(x: number, y: number, food: any) {
    const container = this.add.container(x, y);
    const cardW = 230;
    const cardH = 400;
    const mainColor = Phaser.Display.Color.HexStringToColor(food.color).color;

    // Card shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillRoundedRect(-cardW / 2 + 5, -cardH / 2 + 8, cardW, cardH, 20);
    container.add(shadow);

    // Card body with glassmorphism
    const cardBg = this.add.graphics();
    const drawCard = (hover: boolean) => {
      cardBg.clear();
      cardBg.fillStyle(hover ? 0x1e1e3a : 0x141428, 0.92);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
      // Glow border
      cardBg.lineStyle(hover ? 3 : 2, hover ? mainColor : 0x333355, hover ? 0.8 : 0.5);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 20);
      // Top highlight shimmer
      if (hover) {
        cardBg.fillStyle(0xffffff, 0.04);
        cardBg.fillRoundedRect(-cardW / 2 + 6, -cardH / 2 + 4, cardW - 12, cardH / 3, { tl: 16, tr: 16, bl: 0, br: 0 });
      }
    };
    drawCard(false);
    container.add(cardBg);

    // Food icon
    const iconContainer = this.add.container(0, -110);

    const outerRing = this.add.graphics();
    outerRing.lineStyle(3, mainColor, 0.2);
    outerRing.strokeCircle(0, 0, 75);
    iconContainer.add(outerRing);

    const iconBase = this.add.graphics();
    iconBase.fillStyle(0x000000, 0.8);
    iconBase.fillCircle(0, 0, 60);
    iconBase.lineStyle(2, mainColor, 0.8);
    iconBase.strokeCircle(0, 0, 60);
    iconContainer.add(iconBase);

    const emojiMap: { [key: string]: string } = { beans: '🫘', onion: '🧅', chili: '🌶️' };
    const iconEmoji = this.add.text(0, 0, emojiMap[food.id] || '❓', {
      fontSize: '64px',
      shadow: { color: food.color, blur: 25, fill: true, stroke: true }
    }).setOrigin(0.5);
    iconContainer.add(iconEmoji);
    container.add(iconContainer);

    const iconTween = this.tweens.add({
      targets: iconContainer,
      scale: 1.08,
      duration: 800,
      yoyo: true,
      repeat: -1,
      paused: true
    });

    // Food name
    this.addText(container, 0, 20, food.name.toUpperCase(), '22px', '#ffffff', '800');

    // Description
    const descText = this.add.text(0, 90, food.description, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '13px',
      color: '#777799',
      wordWrap: { width: cardW - 40 },
      align: 'center',
      fontStyle: 'italic'
    }).setOrigin(0.5, 0);
    container.add(descText);

    // Bonus tag
    const bonusContainer = this.add.container(0, cardH / 2 - 50);
    const bonusBg = this.add.graphics();
    bonusBg.fillStyle(mainColor, 1);
    bonusBg.fillRoundedRect(-75, -17, 150, 34, 10);
    bonusContainer.add(bonusBg);

    const bonusText = this.add.text(0, 0, food.bonus, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '14px',
      color: '#000',
      fontStyle: '700'
    }).setOrigin(0.5);
    bonusContainer.add(bonusText);
    container.add(bonusContainer);

    // Interaction
    container.setSize(cardW, cardH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, y: y - 10, scale: 1.03, duration: 200, ease: 'Cubic.easeOut' });
      drawCard(true);
      iconTween.play();
    });

    container.on('pointerout', () => {
      this.tweens.add({ targets: container, y: y, scale: 1, duration: 200, ease: 'Cubic.easeIn' });
      drawCard(false);
      iconTween.pause();
      iconContainer.setScale(1);
    });

    container.on('pointerup', () => {
      this.audioSystem.playPeto('start');
      this.cameras.main.flash(500, 255, 255, 255);
      this.time.delayedCall(300, () => {
        this.scene.start(CONSTS.SCENES.GAME, { selectedFood: food.id });
      });
    });
  }

  private addText(container: Phaser.GameObjects.Container, x: number, y: number, text: string, fontSize: string, color: string, fontStyle: string = '400') {
    const t = this.add.text(x, y, text, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize,
      color,
      fontStyle,
      align: 'center',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);
    container.add(t);
    return t;
  }
}
