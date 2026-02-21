import Phaser from 'phaser';

export class InputSystem {
    private scene: Phaser.Scene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: any;

    // Swipe handling
    private swipeMinDistance = 20; // Lowered for better responsiveness
    private swipeMaxTime = 500; // Swipe must be faster than 500ms
    private touchStartX = 0;
    private touchStartY = 0;
    private touchStartTime = 0;
    private isSwiping = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupInputs();
    }

    private setupInputs(): void {
        if (this.scene.input.keyboard) {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
            this.wasd = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });

            // Map discrete key downs to events
            this.scene.input.keyboard.on('keydown-LEFT', () => this.emitDirection('left'));
            this.scene.input.keyboard.on('keydown-A', () => this.emitDirection('left'));
            this.scene.input.keyboard.on('keydown-RIGHT', () => this.emitDirection('right'));
            this.scene.input.keyboard.on('keydown-D', () => this.emitDirection('right'));
            this.scene.input.keyboard.on('keydown-UP', () => this.emitDirection('up'));
            this.scene.input.keyboard.on('keydown-W', () => this.emitDirection('up'));
            this.scene.input.keyboard.on('keydown-DOWN', () => this.emitDirection('down'));
            this.scene.input.keyboard.on('keydown-S', () => this.emitDirection('down'));
        }

        // Touch / Swipe
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.touchStartX = pointer.x;
            this.touchStartY = pointer.y;
            this.touchStartTime = pointer.time;
            this.isSwiping = true;
        });

        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.isSwiping) return;
            this.isSwiping = false;

            const deltaX = pointer.x - this.touchStartX;
            const deltaY = pointer.y - this.touchStartY;
            const deltaTime = pointer.time - this.touchStartTime;
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (deltaTime < this.swipeMaxTime && Math.max(absX, absY) > this.swipeMinDistance) {
                if (absX > absY) {
                    // Horizontal swipe
                    if (deltaX > 0) this.emitDirection('right');
                    else this.emitDirection('left');
                } else {
                    // Vertical swipe
                    if (deltaY > 0) this.emitDirection('down');
                    else this.emitDirection('up');
                }
            }
        });

        // Reset swipe state on pointer out to avoid sticky touches
        this.scene.input.on('pointerout', () => {
            this.isSwiping = false;
        });
    }

    private emitDirection(dir: 'left' | 'right' | 'up' | 'down') {
        this.scene.events.emit('input-' + dir);
    }

    public destroy(): void {
        if (this.scene.input.keyboard) {
            this.scene.input.keyboard.removeAllListeners();
        }
        this.scene.input.removeAllListeners();
    }
}
