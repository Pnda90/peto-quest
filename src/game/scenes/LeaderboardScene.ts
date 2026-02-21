import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { SaveManager } from '../systems/SaveManager';

export class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super('LeaderboardScene'); // I should add this to CONSTS too
    }

    create() {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        const w = this.scale.width;
        const h = this.scale.height;

        this.add.rectangle(0, 0, w, h, 0x111111).setOrigin(0, 0);

        this.add.text(w / 2, 80, 'TOP SCALATORI', {
            fontSize: '48px',
            color: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const leaderboard = SaveManager.getLeaderboard();

        if (leaderboard.length === 0) {
            this.add.text(w / 2, h / 2, 'Nessun record ancora...\nInizia a scalare!', {
                fontSize: '24px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
        } else {
            leaderboard.forEach((entry, index) => {
                const y = 180 + (index * 50);
                const color = index === 0 ? '#ffcc00' : (index < 3 ? '#ffffff' : '#888888');

                this.add.text(w / 2 - 180, y, `${index + 1}.`, { fontSize: '24px', color }).setOrigin(0, 0.5);
                this.add.text(w / 2 - 120, y, `${entry.score}`, { fontSize: '24px', color, fontStyle: 'bold' }).setOrigin(0, 0.5);
                this.add.text(w / 2 + 50, y, `${entry.distance}m`, { fontSize: '20px', color: '#aaaaaa' }).setOrigin(0, 0.5);
                this.add.text(w - 50, y, entry.date, { fontSize: '18px', color: '#666666' }).setOrigin(1, 0.5);
            });
        }

        const backBtn = this.add.text(w / 2, h - 80, '< INDIETRO', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backBtn.on('pointerup', () => this.scene.start(CONSTS.SCENES.MENU));
        backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
        backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    }
}
