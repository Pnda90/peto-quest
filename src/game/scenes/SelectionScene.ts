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
        this.audioSystem = new AudioSystem();
        const w = this.scale.width;
        const h = this.scale.height;

        // Background
        this.add.rectangle(0, 0, w, h, 0x111111).setOrigin(0, 0);

        // Title
        this.add.text(w / 2, 80, 'COSA MANGIAMO?', {
            fontSize: '48px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(w / 2, 130, 'Scegli il tuo destino (e il tuo peto)', {
            fontSize: '20px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Render Food Options
        let startY = 280;
        CONSTS.FOODS.forEach((food, index) => {
            this.createFoodItem(w / 2, startY + (index * 180), food);
        });

        // Back Button
        const backBtn = this.add.text(w / 2, h - 80, '< INDIETRO', {
            fontSize: '24px',
            color: '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#888888'));
    }

    private createFoodItem(x: number, y: number, food: any) {
        const container = this.add.container(x, y);

        // Card Bg
        const bg = this.add.graphics();
        bg.fillStyle(0x222222, 1);
        bg.lineStyle(2, 0x444444, 1);
        bg.fillRoundedRect(-250, -70, 500, 140, 15);
        bg.strokeRoundedRect(-250, -70, 500, 140, 15);
        container.add(bg);

        // Food Name
        const nameText = this.add.text(-120, -40, food.name, {
            fontSize: '28px',
            color: food.color,
            fontStyle: 'bold'
        });
        container.add(nameText);

        // Bonus Tag
        const bonusText = this.add.text(120, -35, food.bonus, {
            fontSize: '18px',
            color: '#000',
            backgroundColor: food.color,
            padding: { x: 5, y: 2 }
        }).setOrigin(0, 0);
        container.add(bonusText);

        // Description
        const descText = this.add.text(-120, 5, food.description, {
            fontSize: '16px',
            color: '#cccccc',
            wordWrap: { width: 350 }
        });
        container.add(descText);

        // Interaction
        container.setSize(500, 140);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
            bg.clear();
            bg.fillStyle(0x333333, 1);
            bg.lineStyle(2, food.color, 1);
            bg.fillRoundedRect(-250, -70, 500, 140, 15);
            bg.strokeRoundedRect(-250, -70, 500, 140, 15);
        });

        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
            bg.clear();
            bg.fillStyle(0x222222, 1);
            bg.lineStyle(2, 0x444444, 1);
            bg.fillRoundedRect(-250, -70, 500, 140, 15);
            bg.strokeRoundedRect(-250, -70, 500, 140, 15);
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
