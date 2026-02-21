import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';

export class ShopScene extends Phaser.Scene {
    private beansText!: Phaser.GameObjects.Text;

    private skins = [
        { id: 'default', name: 'Classic Gassy', price: 0, color: 0xffffff },
        { id: 'toxic', name: 'Toxic Green', price: 100, color: 0xaa22ff }, // Using a different tint to simulate custom
        { id: 'golden', name: 'Golden Wind', price: 500, color: 0xffdd00 }
    ];

    private upgrades: { id: 'invincibilityLevel' | 'magnetLevel', name: string, basePrice: number, maxLevel: number, icon: string }[] = [
        { id: 'invincibilityLevel', name: 'Invincibility Duration', basePrice: 200, maxLevel: 5, icon: CONSTS.KEYS.PWR_INVINCIBLE },
        { id: 'magnetLevel', name: 'Magnet Duration', basePrice: 200, maxLevel: 5, icon: CONSTS.KEYS.PWR_MAGNET }
    ];

    constructor() {
        super(CONSTS.SCENES.SHOP);
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.scale.width;
        const h = this.scale.height;

        // Background
        this.add.rectangle(0, 0, w, h, 0x111111).setOrigin(0, 0);

        // Title
        this.add.text(w / 2, 80, 'THE BEAN SHOP', {
            fontSize: '48px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Current Beans
        this.beansText = this.add.text(w / 2, 140, `Beans: ${SaveManager.getSaveData().coins}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Render Shop Items
        let startY = 250;
        this.skins.forEach((skin, index) => {
            this.createShopItem(w / 2, startY + (index * 120), skin);
        });

        const upgradeTitleY = startY + (this.skins.length * 120) + 40;
        this.add.text(w / 2, upgradeTitleY, 'UPGRADES', {
            fontSize: '32px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        let upgradeStartY = upgradeTitleY + 80;
        this.upgrades.forEach((upgrade, index) => {
            this.createUpgradeItem(w / 2, upgradeStartY + (index * 120), upgrade);
        });

        // Set camera bounds to allow scrolling if needed
        const contentHeight = upgradeStartY + (this.upgrades.length * 120) + 100;
        this.cameras.main.setBounds(0, 0, w, Math.max(h, contentHeight));

        // Simple drag scroll
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
                const dy = pointer.y - startDragY;
                this.cameras.main.scrollY = scrollY - dy;
            }
        });

        this.input.on('pointerup', () => {
            isDragging = false;
        });

        // Back Button (fixed position using ScrollFactor)
        const backBtn = this.add.text(w / 2, h - 80, '< BACK TO MENU', {
            fontSize: '32px',
            color: '#aaaaaa',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0);

        backBtn.on('pointerup', () => {
            this.scene.start(CONSTS.SCENES.MENU);
        });
        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    }

    private createShopItem(x: number, y: number, skin: { id: string, name: string, price: number, color: number }) {
        const container = this.add.container(x, y);

        // Bg
        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 1);
        bg.lineStyle(2, 0x444444, 1);
        bg.fillRoundedRect(-250, -50, 500, 100, 12);
        bg.strokeRoundedRect(-250, -50, 500, 100, 12);
        container.add(bg);

        // Icon (Just tinted player)
        const icon = this.add.sprite(-190, 0, 'player', 'run_0');
        icon.setScale(0.5);
        if (skin.color !== 0xffffff) {
            icon.setTint(skin.color);
        }
        container.add(icon);

        // Name
        const nameText = this.add.text(-120, -20, skin.name, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        container.add(nameText);

        const saveData = SaveManager.getSaveData();
        const isUnlocked = saveData.unlockedSkins.includes(skin.id);
        const isEquipped = saveData.equippedSkin === skin.id;

        // Status / Price
        let statusTextStr = '';
        let statusColor = '#aaaaaa';

        if (isEquipped) {
            statusTextStr = 'EQUIPPED';
            statusColor = '#00ff00';
        } else if (isUnlocked) {
            statusTextStr = 'UNLOCKED - CLICK TO EQUIP';
            statusColor = '#ffffff';
        } else {
            statusTextStr = `Price: ${skin.price} Beans`;
            statusColor = '#ffcc00';
        }

        const statusText = this.add.text(-120, 10, statusTextStr, {
            fontSize: '18px',
            color: statusColor
        });
        container.add(statusText);

        // Interaction
        container.setSize(500, 100);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerup', () => {
            if (isUnlocked) {
                if (!isEquipped) {
                    SaveManager.equipSkin(skin.id);
                    this.scene.restart(); // Refresh UI
                }
            } else {
                if (SaveManager.spendCoins(skin.price)) {
                    SaveManager.unlockSkin(skin.id);
                    SaveManager.equipSkin(skin.id);
                    // Flash effect
                    this.cameras.main.flash(300, 255, 255, 255);
                    this.scene.restart();
                } else {
                    // Shake if not enough coins
                    this.tweens.add({
                        targets: container,
                        x: container.x + 10,
                        duration: 50,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        });

        container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        });
        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });
    }

    private createUpgradeItem(x: number, y: number, upgrade: { id: 'invincibilityLevel' | 'magnetLevel', name: string, basePrice: number, maxLevel: number, icon: string }) {
        const container = this.add.container(x, y);

        // Bg
        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 1);
        bg.lineStyle(2, 0x444444, 1);
        bg.fillRoundedRect(-250, -50, 500, 100, 12);
        bg.strokeRoundedRect(-250, -50, 500, 100, 12);
        container.add(bg);

        // Icon
        const icon = this.add.sprite(-190, 0, upgrade.icon);
        icon.setScale(0.8);
        container.add(icon);

        const currentLevel = SaveManager.getUpgradeLevel(upgrade.id);
        const isMaxed = currentLevel >= upgrade.maxLevel;
        const currentPrice = upgrade.basePrice * (currentLevel + 1);

        // Name and Level
        const nameText = this.add.text(-120, -20, `${upgrade.name} (Lvl ${currentLevel}/${upgrade.maxLevel})`, {
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        container.add(nameText);

        // Status / Price
        let statusTextStr = isMaxed ? 'MAX LEVEL' : `Upgrade: ${currentPrice} Beans`;
        let statusColor = isMaxed ? '#00ff00' : '#ffcc00';

        const statusText = this.add.text(-120, 10, statusTextStr, {
            fontSize: '18px',
            color: statusColor
        });
        container.add(statusText);

        // Interaction
        container.setSize(500, 100);
        if (!isMaxed) {
            container.setInteractive({ useHandCursor: true });
        }

        container.on('pointerup', () => {
            if (!isMaxed) {
                if (SaveManager.purchaseUpgrade(upgrade.id, currentPrice)) {
                    // Flash effect
                    this.cameras.main.flash(300, 255, 255, 0);
                    this.scene.restart();
                } else {
                    // Shake if not enough coins
                    this.tweens.add({
                        targets: container,
                        x: container.x + 10,
                        duration: 50,
                        yoyo: true,
                        repeat: 3
                    });
                }
            }
        });

        container.on('pointerover', () => {
            if (!isMaxed) this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        });
        container.on('pointerout', () => {
            if (!isMaxed) this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });
    }
}
