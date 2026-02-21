import Phaser from 'phaser';
import { CONSTS } from '../consts';
import { LaneIndex, PlayerState } from '../types';
import { InputSystem } from '../systems/InputSystem';
import { SaveManager } from '../systems/SaveManager';
import { AudioSystem } from '../systems/AudioSystem';
import { MissionManager } from '../systems/MissionManager';

export class GameScene extends Phaser.Scene {
    private inputSystem!: InputSystem;
    private audioSystem!: AudioSystem;
    private selectedFoodId: string = 'beans';

    // Player
    private player!: Phaser.Physics.Arcade.Sprite;
    private currentLane: LaneIndex = 1; // Start in center (0=left, 1=center, 2=right)
    private playerState: PlayerState = PlayerState.RUNNING;
    private isSwitchingLane = false;
    private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    // Env
    private bg1!: Phaser.GameObjects.TileSprite;
    private bg2!: Phaser.GameObjects.TileSprite;
    private obstacles!: Phaser.Physics.Arcade.Group;
    private coins!: Phaser.Physics.Arcade.Group;
    private powerups!: Phaser.Physics.Arcade.Group;
    private laneLines: Phaser.GameObjects.TileSprite[] = [];

    // State
    private currentSpeed: number = CONSTS.BASE_SPEED;
    private distance = 0;
    private score = 0;
    private coinsCollected = 0;
    private scoreMultiplier = 1;
    private comboTimer = 0;
    private isGameOver = false;

    // Gassy Rush (Turbo)
    private gasGauge = 0;
    private maxGas = 100;
    private isTurbo = false;
    private turboDuration = 5000; // 5 seconds of glory
    private normalSpeedBeforeTurbo = 0;

    // Biomes
    private currentBiomeIndex = 0;
    private lastBiomeDistance = 0;

    // Powerup states
    private isInvincible = false;
    private isMagnet = false;
    private invincibleGlow!: Phaser.GameObjects.Image;

    // Timers
    private obstacleSpawnTimer = 0;
    private itemSpawnTimer = 0;

    // UI
    private scoreText!: Phaser.GameObjects.Text;
    private distanceText!: Phaser.GameObjects.Text;
    private coinsText!: Phaser.GameObjects.Text;
    private multiplierText!: Phaser.GameObjects.Text;
    private gasBarBg!: Phaser.GameObjects.Rectangle;
    private gasBar!: Phaser.GameObjects.Rectangle;
    private gasText!: Phaser.GameObjects.Text;
    private vignette!: Phaser.GameObjects.Graphics;

    constructor() {
        super(CONSTS.SCENES.GAME);
    }

    init(data: { selectedFood?: string }) {
        this.selectedFoodId = data.selectedFood || 'beans';
    }

    create() {
        this.isGameOver = false;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.currentSpeed = CONSTS.BASE_SPEED;
        this.distance = 0;
        this.score = 0;
        this.coinsCollected = 0;
        this.scoreMultiplier = 1;
        this.comboTimer = 0;
        this.gasGauge = 0;
        this.isTurbo = false;
        this.currentLane = 1;
        this.playerState = PlayerState.RUNNING;
        this.isSwitchingLane = false;
        this.isInvincible = false;
        this.isMagnet = false;
        this.normalSpeedBeforeTurbo = 0;
        this.laneLines = [];

        // Apply Food Bonuses
        if (this.selectedFoodId === 'beans') {
            this.currentSpeed = CONSTS.BASE_SPEED * 1.2;
        } else if (this.selectedFoodId === 'chili') {
            this.turboDuration = 8000; // Longer turbo
        }
        // onion bonus is handled in magnet logic below

        this.audioSystem = AudioSystem.getInstance();
        this.audioSystem.resume();
        this.audioSystem.startBGM();

        // Backgrounds (Parallax)
        const w = this.scale.width;
        const h = this.scale.height;
        this.bg1 = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_1');
        this.bg2 = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_2');

        // Draw Lane Lines
        const centerX = this.scale.width / 2;
        for (let i = -1; i <= 1; i++) {
            if (i !== 0) { // borders
                const lineX = centerX + (i * CONSTS.LANE_WIDTH / 2);
                const line = this.add.tileSprite(lineX, this.scale.height / 2, 10, this.scale.height, 'lane_line');
                line.setAlpha(0.2);
                this.laneLines.push(line);
            }
        }

        // Particles
        this.dustEmitter = this.add.particles(0, 0, 'particle_puff', {
            lifespan: 400,
            scale: { start: 1, end: 0 },
            alpha: { start: 0.5, end: 0 },
            speed: { min: 50, max: 150 },
            angle: { min: -120, max: -60 },
            gravityY: -200,
            quantity: 1,
            frequency: this.scale.width < 600 ? 100 : 50 // Less frequent particles on mobile
        });

        // Player setup
        const playerX = centerX + CONSTS.LANE_POSITIONS[this.currentLane];
        const playerY = this.scale.height - 250;
        this.player = this.physics.add.sprite(playerX, playerY, 'player');
        this.player.play('player_run');
        this.player.setDepth(10);

        // Apply Skin
        const equippedSkin = SaveManager.getSaveData().equippedSkin;
        if (equippedSkin === 'toxic') {
            this.player.setTint(0xaa22ff);
        } else if (equippedSkin === 'golden') {
            this.player.setTint(0xffdd00);
        }

        // Invincible Glow - Use static texture
        this.invincibleGlow = this.add.image(0, 0, 'glow');
        this.invincibleGlow.setTint(0xffff00);
        this.invincibleGlow.setAlpha(0.4);
        this.invincibleGlow.setDepth(9);
        this.invincibleGlow.setVisible(false);

        // Scale down slightly as the asset is 128x128
        this.player.setScale(0.8);
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        this.player.setSize(80, 80); // Hitbox
        this.player.setOffset(24, 48); // Center hitbox

        this.dustEmitter.startFollow(this.player, 0, 40);

        // Entities
        this.obstacles = this.physics.add.group();
        this.coins = this.physics.add.group();
        this.powerups = this.physics.add.group();

        // Inputs
        this.inputSystem = new InputSystem(this);
        this.setupInputListeners();

        // UI
        this.scoreText = this.add.text(20, 20, 'Score: 0', { fontSize: '20px', color: '#fff' }).setDepth(100);
        this.multiplierText = this.add.text(20, 45, 'x1', { fontSize: '18px', color: '#ff8800' }).setDepth(100);
        this.coinsText = this.add.text(w - 20, 50, 'Beans: 0', { fontSize: '20px', color: '#ffcc00' }).setOrigin(1, 0).setDepth(100);
        this.distanceText = this.add.text(w - 20, 20, 'Dist: 0m', { fontSize: '20px', color: '#fff' }).setOrigin(1, 0).setDepth(100);

        // Gas Bar UI - Use Rectangles instead of Graphics to avoid redraws
        this.gasBarBg = this.add.rectangle(w / 2, 30, 200, 20, 0x000000, 0.5).setDepth(101);
        this.gasBar = this.add.rectangle(w / 2 - 100, 30, 0, 20, 0x00ff00).setOrigin(0, 0.5).setDepth(102);

        this.gasText = this.add.text(w / 2, 45, 'GAS GAUGE', {
            fontSize: '14px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(103);

        // Graphics for static UI elements like vignette
        this.vignette = this.add.graphics().setDepth(1000).setScrollFactor(0);
        this.vignette.clear();
        this.vignette.fillStyle(0x000000, 0.5);

        // Draw a large rectangle with a hole in the middle (vignette effect)
        // In Phaser we can use a mask or just draw a custom shape.
        // For simplicity, we'll draw 4 rectangles around the edges.
        const vSize = 150;
        this.vignette.fillRect(0, 0, w, vSize); // Top
        this.vignette.fillRect(0, h - vSize, w, vSize); // Bottom
        this.vignette.fillRect(0, vSize, vSize, h - (vSize * 2)); // Left
        this.vignette.fillRect(w - vSize, vSize, vSize, h - (vSize * 2)); // Right

        this.vignette.setVisible(false);

        // Collisions
        this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, undefined, this);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, undefined, this);
    }

    private setupInputListeners() {
        this.events.on('input-left', () => {
            if (this.isGameOver || this.isSwitchingLane) return;
            if (this.currentLane > 0) {
                this.switchLane(this.currentLane - 1 as LaneIndex);
            }
        });

        this.events.on('input-right', () => {
            if (this.isGameOver || this.isSwitchingLane) return;
            if (this.currentLane < 2) {
                this.switchLane(this.currentLane + 1 as LaneIndex);
            }
        });

        this.events.on('input-up', () => {
            if (this.isGameOver || this.playerState !== PlayerState.RUNNING) return;
            this.jump();
        });

        this.events.on('input-down', () => {
            if (this.isGameOver || this.playerState !== PlayerState.RUNNING) return;
            this.slide();
        });

        // Turbo Activation (Space or Double Tap - we'll use Space for now or just check gas)
        this.input.keyboard?.on('keydown-SPACE', () => {
            if (this.gasGauge >= this.maxGas) {
                this.activateTurbo();
            }
        });
    }

    private activateTurbo() {
        if (this.isTurbo || this.isGameOver) return;

        this.isTurbo = true;
        this.isInvincible = true;
        this.normalSpeedBeforeTurbo = this.currentSpeed;
        this.currentSpeed *= 2.5; // Massive speedup
        this.gasGauge = 0;

        // Visual effects
        this.vignette.setVisible(true);
        this.invincibleGlow.setVisible(true);
        this.cameras.main.flash(500, 0, 255, 0);
        this.cameras.main.shake(200, 0.02);

        // Enhance particles
        this.dustEmitter.setConfig({
            tint: [0x00ff00, 0xffffff],
            frequency: 10,
            speed: { min: 200, max: 400 }
        });

        // Powerup sound or special turbo sound
        this.audioSystem.playPowerup();

        // Mission tracking
        SaveManager.updateMissionProgress('use_turbo_count', 1);
        if (MissionManager.checkMissionCompletion('use_turbo_count', SaveManager.getMissionProgress('use_turbo_count'))) {
            this.showMissionComplete('Turbo Fan! (+300)');
        }

        this.time.delayedCall(this.turboDuration, () => {
            this.deactivateTurbo();
        });
    }

    private deactivateTurbo() {
        if (!this.isTurbo || this.isGameOver) return;

        this.isTurbo = false;
        this.isInvincible = false;
        this.currentSpeed = this.normalSpeedBeforeTurbo;
        this.vignette.setVisible(false);
        this.invincibleGlow.setVisible(false);

        // Reset particles
        this.player.clearTint();
        // Re-apply skin tint if any
        const equippedSkin = SaveManager.getSaveData().equippedSkin;
        if (equippedSkin === 'toxic') this.player.setTint(0xaa22ff);
        else if (equippedSkin === 'golden') this.player.setTint(0xffdd00);

        this.dustEmitter.setConfig({
            tint: 0xffffff,
            frequency: 50,
            speed: { min: 50, max: 150 }
        });
    }

    private switchLane(newLane: LaneIndex) {
        this.isSwitchingLane = true;
        this.currentLane = newLane;

        const targetX = this.scale.width / 2 + CONSTS.LANE_POSITIONS[this.currentLane];

        this.tweens.add({
            targets: this.player,
            x: targetX,
            duration: CONSTS.LANE_SWITCH_DURATION,
            ease: 'Sine.easeOut',
            onComplete: () => {
                this.isSwitchingLane = false;
            }
        });
    }

    private jump() {
        this.playerState = PlayerState.JUMPING;
        this.audioSystem.playJump();
        this.player.play('player_jump');
        this.dustEmitter.stop();

        // Simulate fake 3D jump by tweening scale and y slightly, then back down
        const startY = this.player.y;
        this.tweens.add({
            targets: this.player,
            y: startY - 180,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 350,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                if (!this.isGameOver) {
                    this.playerState = PlayerState.RUNNING;
                    this.player.play('player_run');
                    this.player.y = startY; // Ensure exact landing
                    this.player.setScale(0.8);
                    this.dustEmitter.start();
                }
            }
        });
    }

    private slide() {
        this.playerState = PlayerState.SLIDING;
        this.audioSystem.playSlide();
        this.player.play('player_slide');
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        // Shrink hitbox
        this.player.setSize(80, 40);
        this.player.setOffset(24, 88);

        this.time.delayedCall(CONSTS.PLAYER_SLIDE_DURATION, () => {
            if (!this.isGameOver) {
                this.playerState = PlayerState.RUNNING;
                this.player.play('player_run');
                this.player.setSize(80, 80);
                this.player.setOffset(24, 48);
            }
        });
    }

    private spawnObstacle() {
        const lane = Phaser.Math.Between(0, 2) as LaneIndex;
        const x = this.scale.width / 2 + CONSTS.LANE_POSITIONS[lane];
        const y = -100;

        const useTrap = Math.random() > 0.5;
        const key = useTrap ? 'obs_trap' : 'obs_spike';

        const obs = this.obstacles.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
        obs.setVelocityY(this.currentSpeed);

        // Fix hitbox
        if (useTrap) {
            obs.setSize(100, 40);
            obs.setOffset(14, 60);
        } else {
            obs.setSize(60, 100);
            obs.setOffset(34, 14);
        }
    }

    private hitObstacle(playerObj: any, obstacleObj: any) {
        if (this.isInvincible) {
            // Destroy obstacle instead
            const obs = obstacleObj as Phaser.Physics.Arcade.Sprite;
            obs.destroy();
            this.audioSystem.playHit();
            this.cameras.main.shake(100, 0.01);
            return;
        }

        // Basic fake 3D check: if jumping, ignore low obstacles 
        // Usually traps are low. Spikes are high.
        const obs = obstacleObj as Phaser.Physics.Arcade.Sprite;
        if (this.playerState === PlayerState.JUMPING && obs.texture.key === 'obs_trap') {
            return; // Jumped over the trap
        }
        if (this.playerState === PlayerState.SLIDING && obs.texture.key === 'obs_spike') {
            return; // Slid under the spike
        }

        this.gameOver();
    }

    private spawnItem() {
        const lane = Phaser.Math.Between(0, 2) as LaneIndex;
        const x = this.scale.width / 2 + CONSTS.LANE_POSITIONS[lane];
        const y = -100;

        // 10% chance for powerup, 90% for coin
        const isPowerup = Math.random() < 0.1;

        if (isPowerup) {
            const isMagnet = Math.random() < 0.5;
            const key = isMagnet ? CONSTS.KEYS.PWR_MAGNET : CONSTS.KEYS.PWR_INVINCIBLE;
            const pwr = this.powerups.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
            pwr.setVelocityY(this.currentSpeed);
            pwr.setData('type', isMagnet ? 'magnet' : 'invincibility');
            // Tween to rotate and pulse
            this.tweens.add({
                targets: pwr,
                scaleX: 1.2,
                scaleY: 1.2,
                yoyo: true,
                repeat: -1,
                duration: 500
            });
        } else {
            // Spawn a coin pattern (e.g. 3 in a row)
            for (let i = 0; i < 3; i++) {
                const coin = this.coins.create(x, y - (i * 80), CONSTS.KEYS.COIN) as Phaser.Physics.Arcade.Sprite;
                coin.setVelocityY(this.currentSpeed);
            }
        }
    }

    private collectCoin(playerObj: any, coinObj: any) {
        if (this.isGameOver) return;
        const coin = coinObj as Phaser.Physics.Arcade.Sprite;
        coin.destroy();

        this.audioSystem.playCoin();

        this.coinsCollected += CONSTS.COIN_VALUE;
        this.score += 10 * this.scoreMultiplier; // Bonus score for collecting

        // Increase gas gauge
        if (!this.isTurbo) {
            this.gasGauge = Math.min(this.gasGauge + 5, this.maxGas);
        }

        // Mission tracking
        SaveManager.updateMissionProgress('collect_beans_total', 1);
        if (MissionManager.checkMissionCompletion('collect_beans_total', SaveManager.getMissionProgress('collect_beans_total'))) {
            this.showMissionComplete('Bean Master! (+500)');
        }

        // Increase multiplier
        this.scoreMultiplier = Math.min(this.scoreMultiplier + 1, 10);
        this.comboTimer = 2000; // 2 seconds to keep combo

        this.coinsText.setText(`Beans: ${this.coinsCollected}`);
        this.multiplierText.setText(`x${this.scoreMultiplier}`);
        this.multiplierText.setVisible(this.scoreMultiplier > 1);

        // Visual feedback
        this.add.tween({
            targets: this.coinsText,
            scaleX: 1.5,
            scaleY: 1.5,
            yoyo: true,
            duration: 100
        });

        if (this.scoreMultiplier > 1) {
            this.add.tween({
                targets: this.multiplierText,
                scaleX: 1.5,
                scaleY: 1.5,
                yoyo: true,
                duration: 100
            });
        }

        this.createScorePopup(coin.x, coin.y, `+${10 * this.scoreMultiplier}`);
    }

    private createScorePopup(x: number, y: number, text: string) {
        const popup = this.add.text(x, y, text, {
            fontSize: '24px',
            color: '#ffcc00',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: popup,
            y: y - 100,
            alpha: 0,
            duration: 800,
            ease: 'Cubic.easeOut',
            onComplete: () => popup.destroy()
        });
    }

    private collectPowerup(playerObj: any, pwrObj: any) {
        if (this.isGameOver) return;
        const pwr = pwrObj as Phaser.Physics.Arcade.Sprite;
        const type = pwr.getData('type');
        pwr.destroy();

        this.audioSystem.playPowerup();

        if (type === 'invincibility') {
            this.isInvincible = true;
            this.invincibleGlow.setVisible(true);

            const upgrades = SaveManager.getSaveData().upgrades || {};
            const duration = CONSTS.POWERUP_DURATION + ((upgrades.invincibilityLevel || 0) * 2000);

            this.time.delayedCall(duration, () => {
                this.isInvincible = false;
                this.invincibleGlow.setVisible(false);
            });
        } else if (type === 'magnet') {
            this.isMagnet = true;

            const upgrades = SaveManager.getSaveData().upgrades || {};
            const duration = CONSTS.POWERUP_DURATION + ((upgrades.magnetLevel || 0) * 2000);

            this.time.delayedCall(duration, () => {
                this.isMagnet = false;
            });
        }
    }

    private gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.playerState = PlayerState.DEAD;

        this.audioSystem.stopBGM();
        this.physics.pause();
        this.audioSystem.playPeto('gameover');
        this.player.play('player_dead');
        this.dustEmitter.stop();

        // Intense camera shake & flash
        this.cameras.main.shake(500, 0.03);
        this.cameras.main.flash(500, 255, 0, 0);

        this.time.delayedCall(1500, () => {
            this.scene.start(CONSTS.SCENES.GAMEOVER, {
                score: Math.floor(this.score),
                distance: Math.floor(this.distance),
                coins: this.coinsCollected
            });
        });

        // Add to Leaderboard
        SaveManager.addLeaderboardEntry(Math.floor(this.score), Math.floor(this.distance));
    }

    update(time: number, delta: number) {
        if (this.isGameOver) {
            if (this.invincibleGlow) this.invincibleGlow.setVisible(false);
            return;
        }

        // Invincible Glow follows player
        if (this.isInvincible) {
            this.invincibleGlow.setPosition(this.player.x, this.player.y);
        }

        // Scrolling backgrounds
        this.bg1.tilePositionY -= (this.currentSpeed * 0.2 * delta) / 1000;
        this.bg2.tilePositionY -= (this.currentSpeed * 0.5 * delta) / 1000;

        // Increase speed slightly over time
        if (this.currentSpeed < CONSTS.MAX_SPEED) {
            this.currentSpeed += CONSTS.SPEED_INCREMENT * (delta / 1000);
        }

        // Adjust BGM tempo based on speed
        const speedRatio = this.currentSpeed / CONSTS.BASE_SPEED;
        this.audioSystem.setBGMTempo(speedRatio);

        // Stage Transition check
        if (this.distance - this.lastBiomeDistance >= 1000) {
            this.transitionToNextStage();
        }

        // Gas Bar Update
        const gasFill = (this.gasGauge / this.maxGas) * 200;
        this.gasBar.width = gasFill;

        if (this.gasGauge >= this.maxGas) {
            const alpha = 0.5 + Math.sin(time / 100) * 0.5;
            this.gasBar.setFillStyle(0x00ff00, alpha);
            this.gasText.setText('PRESS SPACE FOR TURBO!');
        } else {
            this.gasBar.setFillStyle(0x00ff00, 1);
            this.gasText.setText('GAS GAUGE');
        }

        // Combo Logic
        if (this.comboTimer > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                this.scoreMultiplier = 1;
                this.multiplierText.setVisible(false);
            }
        }

        // Distance and score
        this.distance += (this.currentSpeed * delta) / 10000;
        this.score += 10 * this.scoreMultiplier * (delta / 1000); // 10 pts per second * multiplier

        this.distanceText.setText(`Dist: ${Math.floor(this.distance)}m`);
        this.scoreText.setText(`Score: ${Math.floor(this.score)}`);

        // Spawning logic (items)
        this.itemSpawnTimer -= delta;
        if (this.itemSpawnTimer <= 0) {
            this.spawnItem();
            this.itemSpawnTimer = Phaser.Math.Between(1000, 2000) * (CONSTS.BASE_SPEED / this.currentSpeed);
        }

        // Spawning logic (obstacles)
        this.obstacleSpawnTimer -= delta;
        if (this.obstacleSpawnTimer <= 0) {
            this.spawnObstacle();
            // Next spawn time depends on speed to keep consistent difficulty
            this.obstacleSpawnTimer = Phaser.Math.Between(800, 1500) * (CONSTS.BASE_SPEED / this.currentSpeed);
        }

        // Magnet logic: pull coins towards player if magnet is active
        if (this.isMagnet && !this.isGameOver) {
            this.coins.getChildren().forEach(child => {
                const coin = child as Phaser.Physics.Arcade.Sprite;
                // Magnet math based on onion or powerup
                const distY = this.player.y - coin.y;
                const distX = this.player.x - coin.x;
                const magnetRange = this.selectedFoodId === 'onion' ? 600 : 400;

                if (Math.abs(distY) < magnetRange) {
                    coin.x += distX * 0.1;
                    coin.y += distY * 0.1;
                    // Prevent it from falling out of world normally while magnetized
                    coin.setVelocityY(0);
                }
            });
        }

        // Cleanup offscreen objects
        const cleanupGroup = (group: Phaser.Physics.Arcade.Group, checkBonus: boolean = false) => {
            group.getChildren().forEach(child => {
                const obj = child as Phaser.Physics.Arcade.Sprite;
                if (obj.y > this.scale.height + 100) {
                    obj.destroy();
                    if (checkBonus) this.score += 50; // Bonus score for dodging
                } else {
                    // Adjust velocity in case speed changed and object is not magnetized
                    if (!(group === this.coins && this.isMagnet)) {
                        obj.setVelocityY(this.currentSpeed);
                    }
                }
            });
        };

        cleanupGroup(this.obstacles, true);
        cleanupGroup(this.coins);
        cleanupGroup(this.powerups);

        // Clean up input events properly on scene exit by relying on InputSystem destroy
    }

    private showMissionComplete(text: string) {
        const w = this.scale.width;
        const container = this.add.container(w / 2, -100).setDepth(1000).setScrollFactor(0);

        const bg = this.add.graphics();
        bg.fillStyle(0x00ff00, 0.9);
        bg.fillRoundedRect(-150, 0, 300, 60, 10);
        bg.lineStyle(2, 0xffffff, 1);
        bg.strokeRoundedRect(-150, 0, 300, 60, 10);

        const txt = this.add.text(0, 30, `MISSION COMPIERTA!\n${text}`, {
            fontSize: '18px',
            color: '#000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, txt]);

        this.tweens.add({
            targets: container,
            y: 50,
            duration: 500,
            ease: 'Back.easeOut',
            hold: 2000,
            yoyo: true
        });

        this.audioSystem.playPowerup();
    }

    private transitionToNextStage() {
        this.currentBiomeIndex = (this.currentBiomeIndex + 1) % CONSTS.STAGES.length;
        this.lastBiomeDistance = this.distance;

        const stage = CONSTS.STAGES[this.currentBiomeIndex];
        this.audioSystem.playPeto('end');

        // Mission tracking
        if (stage.name === 'Stomaco') {
            if (MissionManager.checkMissionCompletion('reach_stomach', 1)) {
                this.showMissionComplete('Stomach Reached! (+200)');
            }
        } else if (stage.name === 'Intestino Crasso') {
            if (MissionManager.checkMissionCompletion('reach_intestine_c', 1)) {
                this.showMissionComplete('Large Intestine! (+1000)');
            }
        }

        // Popup stage name
        const text = this.add.text(this.scale.width / 2, 200, stage.name.toUpperCase(), {
            fontSize: '48px',
            color: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setDepth(200);

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: 250,
            duration: 1000,
            yoyo: true,
            hold: 1000,
            onComplete: () => text.destroy()
        });

        this.bg1.setTint(stage.bg1);
        this.bg2.setTint(stage.bg2);
        this.laneLines.forEach(line => line.setTint(stage.lanes));
    }
}
