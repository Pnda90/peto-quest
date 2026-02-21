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

        // Top Stats
        this.add.text(20, 20, `High Score: ${saveData.highScore}`, { fontSize: '24px', color: '#ffffff' });
        this.add.text(w - 20, 20, `Beans: ${saveData.coins}`, { fontSize: '24px', color: '#ffcc00' }).setOrigin(1, 0);

        // Title
        const title = this.add.text(w / 2, h / 3, 'PETO QUEST', {
            fontSize: '64px',
            color: CONSTS.COLORS.TITLE,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Bounce tween for title
        this.tweens.add({
            targets: title,
            y: title.y - 20,
            angle: { from: -2, to: 2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Play Button Group
        const btnContainer = this.add.container(w / 2, h / 2 + 100);

        // Fake button background
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0x00aa00, 1);
        btnBg.fillRoundedRect(-150, -40, 300, 80, 16);
        btnBg.lineStyle(4, 0xffffff, 1);
        btnBg.strokeRoundedRect(-150, -40, 300, 80, 16);

        const btnText = this.add.text(0, 0, 'PLAY NOW', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        btnContainer.add([btnBg, btnText]);

        // Make container interactive
        btnContainer.setSize(300, 80);
        btnContainer.setInteractive({ useHandCursor: true });

        // Interaction handlers
        btnContainer.on('pointerover', () => {
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        btnContainer.on('pointerout', () => {
            this.tweens.add({
                targets: btnContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        btnContainer.on('pointerup', () => {
            // Small punch effect
            this.tweens.add({
                targets: btnContainer,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    AudioSystem.getInstance().resume();
                    this.scene.start(CONSTS.SCENES.SELECTION);
                }
            });
        });

        // Shop Button Group
        const shopBtnContainer = this.add.container(w / 2, h / 2 + 200);

        const shopBtnBg = this.add.graphics();
        shopBtnBg.fillStyle(0xaa5500, 1);
        shopBtnBg.fillRoundedRect(-120, -30, 240, 60, 16);
        shopBtnBg.lineStyle(4, 0xffffff, 1);
        shopBtnBg.strokeRoundedRect(-120, -30, 240, 60, 16);

        const shopBtnText = this.add.text(0, 0, 'SHOP', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        shopBtnContainer.add([shopBtnBg, shopBtnText]);
        shopBtnContainer.setSize(240, 60);
        shopBtnContainer.setInteractive({ useHandCursor: true });

        shopBtnContainer.on('pointerover', () => {
            this.tweens.add({
                targets: shopBtnContainer,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        shopBtnContainer.on('pointerout', () => {
            this.tweens.add({
                targets: shopBtnContainer,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        shopBtnContainer.on('pointerup', () => {
            this.tweens.add({
                targets: shopBtnContainer,
                scaleX: 0.9,
                scaleY: 0.9,
                duration: 100,
                yoyo: true,
                onComplete: () => {
                    AudioSystem.getInstance().resume();
                    this.scene.start('ShopScene');
                }
            });
        });

        // Leaderboard Button Group
        const rankingBtnContainer = this.add.container(w / 2, h / 2 + 300);

        const rankingBtnBg = this.add.graphics();
        rankingBtnBg.fillStyle(0x0055aa, 1);
        rankingBtnBg.fillRoundedRect(-120, -30, 240, 60, 16);
        rankingBtnBg.lineStyle(4, 0xffffff, 1);
        rankingBtnBg.strokeRoundedRect(-120, -30, 240, 60, 16);

        const rankingBtnText = this.add.text(0, 0, 'CLASSIFICA', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        rankingBtnContainer.add([rankingBtnBg, rankingBtnText]);
        rankingBtnContainer.setSize(240, 60);
        rankingBtnContainer.setInteractive({ useHandCursor: true });

        rankingBtnContainer.on('pointerup', () => {
            AudioSystem.getInstance().resume();
            this.scene.start(CONSTS.SCENES.LEADERBOARD);
        });

        // Active Mission Display (Bottom)
        const activeMissions = MissionManager.getActiveMissions();
        if (activeMissions.length > 0) {
            const mission = activeMissions[0];
            const progress = SaveManager.getMissionProgress(mission.id);

            const missionBg = this.add.graphics();
            missionBg.fillStyle(0x000000, 0.7);
            missionBg.fillRoundedRect(w / 2 - 180, h - 230, 360, 60, 10);
            missionBg.lineStyle(2, 0xffcc00, 1);
            missionBg.strokeRoundedRect(w / 2 - 180, h - 230, 360, 60, 10);

            this.add.text(w / 2, h - 215, 'MISSIONE ATTIVA', { fontSize: '14px', color: '#ffcc00', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(w / 2, h - 195, `${mission.description}: ${progress}/${mission.goal}`, { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
        }

        // Settings Button 
        const settingsBtn = this.add.text(w / 2, h - 130, '⚙️ Settings', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        settingsBtn.on('pointerup', () => {
            this.scene.start('SettingsScene');
        });
        settingsBtn.on('pointerover', () => settingsBtn.setColor('#ffffff'));
        settingsBtn.on('pointerout', () => settingsBtn.setColor('#aaaaaa'));

        // Instructions
        this.add.text(w / 2, h - 80, 'Arrows / WASD to move & jump\nSwipe on mobile', {
            fontSize: '20px',
            color: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
    }
}
