import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';

export class ShopScene extends Phaser.Scene {
  private beansText!: Phaser.GameObjects.Text;

  private skins = [
    { id: 'default', name: 'Gassoso Classico', price: 0, color: 0xffffff, emoji: '💨' },
    { id: 'toxic', name: 'Verde Tossico', price: 100, color: 0xaa22ff, emoji: '☠️' },
    { id: 'golden', name: "Vento D'Oro", price: 500, color: 0xffdd00, emoji: '✨' }
  ];

  private upgrades: {
    id: 'invincibilityLevel' | 'magnetLevel';
    name: string;
    basePrice: number;
    maxLevel: number;
    icon: string;
    emoji: string;
  }[] = [
      {
        id: 'invincibilityLevel',
        name: 'Durata Invincibilità',
        basePrice: 200,
        maxLevel: 5,
        icon: CONSTS.KEYS.PWR_INVINCIBLE,
        emoji: '⭐'
      },
      {
        id: 'magnetLevel',
        name: 'Durata Magnete',
        basePrice: 200,
        maxLevel: 5,
        icon: CONSTS.KEYS.PWR_MAGNET,
        emoji: '🧲'
      }
    ];

  constructor() {
    super(CONSTS.SCENES.SHOP);
  }

  create() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const w = this.scale.width;
    const h = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a1a0a, 0x2d1054);
    bg.fillRect(0, 0, w, h * 3);

    // Title
    this.add.text(w / 2, 70, '🛒 IL NEGOZIO', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '44px',
      color: '#fbbf24',
      fontStyle: '800',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Beans balance
    this.beansText = this.add.text(w / 2, 125, `🫘 ${SaveManager.getSaveData().coins} Fagioli`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: '600'
    }).setOrigin(0.5);

    // Section: Skins
    this.add.text(w / 2, 185, 'SKIN', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#a855f7',
      fontStyle: '700'
    }).setOrigin(0.5);

    let startY = 230;
    this.skins.forEach((skin, index) => {
      this.createShopItem(w / 2, startY + index * 110, skin);
    });

    // Section: Upgrades
    const upgradeTitleY = startY + this.skins.length * 110 + 20;
    this.add.text(w / 2, upgradeTitleY, 'POTENZIAMENTI', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#a855f7',
      fontStyle: '700'
    }).setOrigin(0.5);

    let upgradeStartY = upgradeTitleY + 50;
    this.upgrades.forEach((upgrade, index) => {
      this.createUpgradeItem(w / 2, upgradeStartY + index * 110, upgrade);
    });

    // Camera scroll bounds
    const contentHeight = upgradeStartY + this.upgrades.length * 110 + 100;
    this.cameras.main.setBounds(0, 0, w, Math.max(h, contentHeight));

    // Drag scroll
    let isDragging = false;
    let startDragY = 0;
    let scrollY = 0;

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      isDragging = true;
      startDragY = pointer.y;
      scrollY = this.cameras.main.scrollY;
    });
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        this.cameras.main.scrollY = scrollY - (pointer.y - startDragY);
      }
    });
    this.input.on('pointerup', () => { isDragging = false; });

    // Back button
    const backBtn = this.add.text(w / 2, h - 60, '← TORNA AL MENU', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#555577',
      fontStyle: '700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

    backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
    backBtn.on('pointerover', () => backBtn.setColor('#a855f7'));
    backBtn.on('pointerout', () => backBtn.setColor('#555577'));
  }

  private createShopItem(x: number, y: number, skin: { id: string; name: string; price: number; color: number; emoji: string }) {
    const container = this.add.container(x, y);
    const cardW = 540;
    const cardH = 90;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x141428, 0.9);
    cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
    cardBg.lineStyle(2, 0x333355, 0.5);
    cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
    container.add(cardBg);

    // Emoji icon
    this.add.text(-cardW / 2 + 25, 0, skin.emoji, { fontSize: '32px' }).setOrigin(0, 0.5);
    container.add(container.last!);

    // Icon (tinted player)
    const icon = this.add.sprite(-cardW / 2 + 75, 0, 'player', 'run_0').setScale(0.4);
    if (skin.color !== 0xffffff) icon.setTint(skin.color);
    container.add(icon);

    // Name
    container.add(this.add.text(-cardW / 2 + 110, -16, skin.name, {
      fontFamily: CONSTS.FONT_FAMILY, fontSize: '18px', color: '#ffffff', fontStyle: '700'
    }));

    const saveData = SaveManager.getSaveData();
    const isUnlocked = saveData.unlockedSkins.includes(skin.id);
    const isEquipped = saveData.equippedSkin === skin.id;

    let statusStr = '';
    let statusColor = '#888';
    if (isEquipped) { statusStr = '✅ Equipaggiato'; statusColor = '#22c55e'; }
    else if (isUnlocked) { statusStr = 'Sbloccato — Clicca'; statusColor = '#a855f7'; }
    else { statusStr = `🫘 ${skin.price}`; statusColor = '#fbbf24'; }

    container.add(this.add.text(-cardW / 2 + 110, 8, statusStr, {
      fontFamily: CONSTS.FONT_FAMILY, fontSize: '14px', color: statusColor
    }));

    container.setSize(cardW, cardH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scale: 1.02, duration: 100 });
    });
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on('pointerup', () => {
      if (isUnlocked && !isEquipped) {
        SaveManager.equipSkin(skin.id);
        this.scene.restart();
      } else if (!isUnlocked) {
        if (SaveManager.spendCoins(skin.price)) {
          SaveManager.unlockSkin(skin.id);
          SaveManager.equipSkin(skin.id);
          this.cameras.main.flash(300, 255, 255, 255);
          this.scene.restart();
        } else {
          this.tweens.add({ targets: container, x: container.x + 8, duration: 50, yoyo: true, repeat: 3 });
        }
      }
    });
  }

  private createUpgradeItem(
    x: number, y: number,
    upgrade: { id: 'invincibilityLevel' | 'magnetLevel'; name: string; basePrice: number; maxLevel: number; icon: string; emoji: string }
  ) {
    const container = this.add.container(x, y);
    const cardW = 540;
    const cardH = 90;

    const cardBg = this.add.graphics();
    cardBg.fillStyle(0x141428, 0.9);
    cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
    cardBg.lineStyle(2, 0x333355, 0.5);
    cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 14);
    container.add(cardBg);

    // Emoji
    container.add(this.add.text(-cardW / 2 + 25, 0, upgrade.emoji, { fontSize: '32px' }).setOrigin(0, 0.5));

    // Icon sprite
    const icon = this.add.sprite(-cardW / 2 + 75, 0, upgrade.icon).setScale(0.55);
    container.add(icon);

    const currentLevel = SaveManager.getUpgradeLevel(upgrade.id);
    const isMaxed = currentLevel >= upgrade.maxLevel;
    const currentPrice = upgrade.basePrice * (currentLevel + 1);

    // Name + level
    container.add(this.add.text(-cardW / 2 + 110, -16, `${upgrade.name}`, {
      fontFamily: CONSTS.FONT_FAMILY, fontSize: '16px', color: '#ffffff', fontStyle: '700'
    }));

    // Level dots
    let levelStr = '';
    for (let i = 0; i < upgrade.maxLevel; i++) {
      levelStr += i < currentLevel ? '●' : '○';
    }
    container.add(this.add.text(-cardW / 2 + 110, 8, levelStr, {
      fontFamily: CONSTS.FONT_FAMILY, fontSize: '15px', color: isMaxed ? '#22c55e' : '#a855f7'
    }));

    // Price/status
    const statusStr = isMaxed ? '🏆 MAX' : `🫘 ${currentPrice}`;
    const statusColor = isMaxed ? '#22c55e' : '#fbbf24';
    container.add(this.add.text(cardW / 2 - 40, 0, statusStr, {
      fontFamily: CONSTS.FONT_FAMILY, fontSize: '16px', color: statusColor, fontStyle: '700'
    }).setOrigin(1, 0.5));

    container.setSize(cardW, cardH);
    if (!isMaxed) container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      if (!isMaxed) this.tweens.add({ targets: container, scale: 1.02, duration: 100 });
    });
    container.on('pointerout', () => {
      if (!isMaxed) this.tweens.add({ targets: container, scale: 1, duration: 100 });
    });
    container.on('pointerup', () => {
      if (!isMaxed) {
        if (SaveManager.purchaseUpgrade(upgrade.id, currentPrice)) {
          this.cameras.main.flash(300, 255, 255, 0);
          this.scene.restart();
        } else {
          this.tweens.add({ targets: container, x: container.x + 8, duration: 50, yoyo: true, repeat: 3 });
        }
      }
    });
  }
}
