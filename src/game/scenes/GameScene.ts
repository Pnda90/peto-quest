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
  private currentLane: LaneIndex = 1;
  private playerState: PlayerState = PlayerState.RUNNING;
  private isSwitchingLane = false;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

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

  // Biomes
  private currentBiomeIndex = 0;
  private lastBiomeDistance = 0;

  // Powerup states
  private isInvincible = false;
  private isMagnet = false;
  private invincibleGlow!: Phaser.GameObjects.Image;

  // Speed lines
  private speedLineEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Audience
  private nextCheerTime = 0;

  // Dynamic Missions
  private activeChallenge: { type: string; goal: number; progress: number; description: string } | null = null;
  private challengeText!: Phaser.GameObjects.Text;
  private challengeContainer!: Phaser.GameObjects.Container;

  // Timers
  private obstacleSpawnTimer = 0;
  private itemSpawnTimer = 0;

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private multiplierText!: Phaser.GameObjects.Text;

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
    this.currentLane = 1;
    this.playerState = PlayerState.RUNNING;
    this.isSwitchingLane = false;
    this.isInvincible = false;
    this.isMagnet = false;
    this.laneLines = [];

    // Apply Food Bonuses
    if (this.selectedFoodId === 'beans') {
      this.currentSpeed = CONSTS.BASE_SPEED * 1.2;
    }

    this.audioSystem = AudioSystem.getInstance();
    this.audioSystem.resume();
    this.audioSystem.startBGM();

    // Backgrounds (Parallax)
    const w = this.scale.width;
    const h = this.scale.height;
    this.bg1 = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_1').setDepth(-2);
    this.bg2 = this.add.tileSprite(w / 2, h / 2, w, h, 'bg_layer_2').setDepth(-1);

    // Draw Lane Lines with glow
    const centerX = this.scale.width / 2;
    for (let i = -1; i <= 1; i++) {
      if (i !== 0) {
        const lineX = centerX + (i * CONSTS.LANE_WIDTH) / 2;
        const line = this.add.tileSprite(
          lineX,
          this.scale.height / 2,
          12,
          this.scale.height,
          'lane_glow'
        );
        line.setAlpha(0.6);
        line.setDepth(0);
        this.laneLines.push(line);
      }
    }

    // Player trail emitter
    this.trailEmitter = this.add.particles(0, 0, 'trail_particle', {
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 500,
      frequency: 50,
      tint: [0x55ff88, 0xaaffcc, 0x22c55e]
    }).setDepth(8);

    // Dust
    this.dustEmitter = this.add.particles(0, 0, 'particle_puff', {
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 400,
      gravityY: 0,
      frequency: -1
    });

    // Speed lines emitter (starts inactive, activates at high speed)
    this.speedLineEmitter = this.add.particles(0, 0, 'speed_line', {
      x: { min: 0, max: w },
      y: -50,
      speedY: { min: 800, max: 1500 },
      scale: { start: 1, end: 0.5 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 600,
      frequency: -1, // Manual
      angle: { min: 170, max: 190 }
    }).setDepth(50);

    this.createBeanBadgeTexture();

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

    // Invincible Glow
    this.invincibleGlow = this.add.image(0, 0, 'glow');
    this.invincibleGlow.setTint(0xffff00);
    this.invincibleGlow.setAlpha(0.4);
    this.invincibleGlow.setDepth(9);
    this.invincibleGlow.setVisible(false);

    this.player.setScale(0.8);
    this.player.setSize(80, 80);
    this.player.setOffset(24, 48);

    this.dustEmitter.startFollow(this.player, 0, 40);
    this.trailEmitter.startFollow(this.player, 0, 20);

    // Entities
    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.powerups = this.physics.add.group();

    // Inputs
    this.inputSystem = new InputSystem(this);
    this.setupInputListeners();

    // Premium HUD
    this.createHUD(w);

    // Collisions
    this.physics.add.overlap(this.player, this.obstacles, this.hitObstacle, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.powerups, this.collectPowerup, undefined, this);

    // Dynamic Missions Setup
    this.createChallengeUI();
    this.spawnNewChallenge();
  }

  private createHUD(w: number) {
    // Top HUD bar
    const hudBar = this.add.graphics().setDepth(100).setScrollFactor(0);
    hudBar.fillStyle(0x000000, 0.6);
    hudBar.fillRoundedRect(10, 10, w - 20, 52, 14);

    this.scoreText = this.add.text(25, 24, '0', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: '700'
    }).setDepth(101);

    this.multiplierText = this.add.text(25, 46, '', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '14px',
      color: '#f59e0b',
      fontStyle: '700'
    }).setDepth(101).setVisible(false);

    this.coinsText = this.add.text(w - 25, 24, '🫘 0', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '20px',
      color: '#fbbf24',
      fontStyle: '700'
    }).setOrigin(1, 0).setDepth(101);

    this.distanceText = this.add.text(w - 25, 44, '0m', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '14px',
      color: '#888899'
    }).setOrigin(1, 0).setDepth(101);
  }

  private createBeanBadgeTexture() {
    const key = 'bean_badge';
    if (this.textures.exists(key)) this.textures.remove(key);

    const g = this.add.graphics();
    const mainColor = 0x8B4513;
    const darkColor = 0x3b1f0f;
    const lightColor = 0xd7a36a;
    const size = 64;
    const cx = size / 2;
    const cy = size / 2;

    g.clear();
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(cx + 2, cy + 3, 28);
    g.fillStyle(darkColor, 1);
    g.fillCircle(cx, cy, 27);
    g.fillStyle(mainColor, 1);
    g.fillCircle(cx, cy, 25);
    g.lineStyle(2, 0xffffff, 0.18);
    g.strokeCircle(cx, cy, 23);
    g.fillStyle(0x000000, 0.35);
    g.fillEllipse(cx + 1, cy + 7, 26, 16);
    g.fillStyle(mainColor, 1);
    g.fillEllipse(cx, cy + 2, 26, 16);
    g.fillEllipse(cx + 6, cy - 1, 20, 14);
    g.fillStyle(darkColor, 0.55);
    g.fillEllipse(cx + 6, cy + 1, 14, 10);
    g.lineStyle(2, 0x000000, 0.25);
    g.strokeEllipse(cx, cy + 2, 26, 16);
    g.fillStyle(lightColor, 0.6);
    g.fillEllipse(cx - 4, cy - 1, 10, 6);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private setupInputListeners() {
    this.events.on('input-left', () => {
      if (this.isGameOver || this.isSwitchingLane) return;
      if (this.currentLane > 0) {
        this.switchLane((this.currentLane - 1) as LaneIndex);
      }
    });

    this.events.on('input-right', () => {
      if (this.isGameOver || this.isSwitchingLane) return;
      if (this.currentLane < 2) {
        this.switchLane((this.currentLane + 1) as LaneIndex);
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
          this.player.y = startY;
          this.player.setScale(0.8);
          this.dustEmitter.start();
          this.progressChallenge('jump');
        }
      }
    });
  }

  private slide() {
    this.playerState = PlayerState.SLIDING;
    this.audioSystem.playSlide();
    this.player.play('player_slide');
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
      const obs = obstacleObj as Phaser.Physics.Arcade.Sprite;
      obs.destroy();
      this.audioSystem.playHit();
      this.cameras.main.shake(100, 0.01);
      return;
    }

    const obs = obstacleObj as Phaser.Physics.Arcade.Sprite;
    if (this.playerState === PlayerState.JUMPING && obs.texture.key === 'obs_trap') {
      return;
    }
    if (this.playerState === PlayerState.SLIDING && obs.texture.key === 'obs_spike') {
      return;
    }

    this.gameOver();
  }

  private spawnItem() {
    const lane = Phaser.Math.Between(0, 2) as LaneIndex;
    const x = this.scale.width / 2 + CONSTS.LANE_POSITIONS[lane];
    const y = -100;

    const isPowerup = Math.random() < 0.1;

    if (isPowerup) {
      const isMagnet = Math.random() < 0.5;
      const key = isMagnet ? CONSTS.KEYS.PWR_MAGNET : CONSTS.KEYS.PWR_INVINCIBLE;
      const pwr = this.powerups.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
      pwr.setVelocityY(this.currentSpeed);
      pwr.setData('type', isMagnet ? 'magnet' : 'invincibility');
      this.tweens.add({
        targets: pwr,
        scaleX: 1.2,
        scaleY: 1.2,
        yoyo: true,
        repeat: -1,
        duration: 500
      });
    } else {
      for (let i = 0; i < 3; i++) {
        const coin = this.coins.create(x, y - i * 80, 'bean_badge') as Phaser.Physics.Arcade.Sprite;
        coin.setVelocityY(this.currentSpeed);
        coin.setScale(0.9);
        this.tweens.add({
          targets: coin,
          angle: 360,
          duration: 2000,
          repeat: -1
        });
      }
    }
  }

  private collectCoin(playerObj: any, coinObj: any) {
    if (this.isGameOver) return;
    const coin = coinObj as Phaser.Physics.Arcade.Sprite;

    // Spark burst on collect
    this.add.particles(coin.x, coin.y, 'spark', {
      speed: { min: 80, max: 200 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      quantity: 8,
      tint: [0xfbbf24, 0xffdd00, 0xffffff]
    }).setDepth(100);

    // Auto-destroy burst after emission
    this.time.delayedCall(500, () => {
      // Particles auto-cleanup
    });

    coin.destroy();
    this.audioSystem.playCoin();

    const bonus = this.selectedFoodId === 'chili' ? 2 : 1;
    this.coinsCollected += CONSTS.COIN_VALUE * bonus;
    this.score += 10 * this.scoreMultiplier * bonus;

    SaveManager.updateMissionProgress('collect_beans_total', 1);
    if (
      MissionManager.checkMissionCompletion(
        'collect_beans_total',
        SaveManager.getMissionProgress('collect_beans_total')
      )
    ) {
      this.showMissionComplete('Maestro dei Fagioli! (+500)');
    }

    this.scoreMultiplier = Math.min(this.scoreMultiplier + 1, 10);
    this.comboTimer = 2000;
    this.progressChallenge('collect');

    this.coinsText.setText(`🫘 ${this.coinsCollected}`);
    this.multiplierText.setText(`⚡ x${this.scoreMultiplier}`);
    this.multiplierText.setVisible(this.scoreMultiplier > 1);

    this.add.tween({
      targets: this.coinsText,
      scaleX: 1.4, scaleY: 1.4,
      yoyo: true, duration: 80
    });

    if (this.scoreMultiplier > 1) {
      this.add.tween({
        targets: this.multiplierText,
        scaleX: 1.4, scaleY: 1.4,
        yoyo: true, duration: 80
      });
    }

    this.createScorePopup(coin.x, coin.y, `+${10 * this.scoreMultiplier}`);
  }

  private createScorePopup(x: number, y: number, text: string) {
    const popup = this.add.text(x, y, text, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '22px',
      color: '#fbbf24',
      fontStyle: '700',
      stroke: '#000',
      strokeThickness: 3
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

    // Spark burst
    this.add.particles(pwr.x, pwr.y, 'spark', {
      speed: { min: 100, max: 250 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 12,
      tint: type === 'invincibility' ? [0xfbbf24, 0xffdd00] : [0x3b82f6, 0x60a5fa]
    }).setDepth(100);

    pwr.destroy();
    this.audioSystem.playPowerup();

    if (type === 'invincibility') {
      this.isInvincible = true;
      this.invincibleGlow.setVisible(true);

      const upgrades = SaveManager.getSaveData().upgrades || {};
      const duration = CONSTS.POWERUP_DURATION + (upgrades.invincibilityLevel || 0) * 2000;

      this.time.delayedCall(duration, () => {
        this.isInvincible = false;
        this.invincibleGlow.setVisible(false);
      });
    } else if (type === 'magnet') {
      this.isMagnet = true;

      const upgrades = SaveManager.getSaveData().upgrades || {};
      const duration = CONSTS.POWERUP_DURATION + (upgrades.magnetLevel || 0) * 2000;

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
    this.trailEmitter.stop();
    this.speedLineEmitter.stop();

    this.cameras.main.shake(500, 0.03);
    this.cameras.main.flash(500, 255, 0, 0);

    this.time.delayedCall(1500, () => {
      this.scene.start(CONSTS.SCENES.GAMEOVER, {
        score: Math.floor(this.score),
        distance: Math.floor(this.distance),
        coins: this.coinsCollected
      });
    });

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

    // Lane line scrolling
    this.laneLines.forEach((line) => {
      line.tilePositionY -= (this.currentSpeed * 0.8 * delta) / 1000;
    });

    // Increase speed
    if (this.currentSpeed < CONSTS.MAX_SPEED) {
      this.currentSpeed += CONSTS.SPEED_INCREMENT * (delta / 1000);
    }

    // BGM tempo
    const speedRatio = this.currentSpeed / CONSTS.BASE_SPEED;
    this.audioSystem.setBGMTempo(speedRatio);

    // Speed lines at high speed
    if (this.currentSpeed > CONSTS.BASE_SPEED * 1.5) {
      this.speedLineEmitter.emitParticle(1);
    }

    // Stage Transition check
    if (this.distance - this.lastBiomeDistance >= 1000) {
      this.transitionToNextStage();
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
    this.score += 10 * this.scoreMultiplier * (delta / 1000);

    this.distanceText.setText(`${Math.floor(this.distance)}m`);
    this.scoreText.setText(`${Math.floor(this.score)}`);

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
      this.obstacleSpawnTimer = Phaser.Math.Between(800, 1500) * (CONSTS.BASE_SPEED / this.currentSpeed);
    }

    // Magnet logic
    if (this.isMagnet && !this.isGameOver) {
      this.coins.getChildren().forEach((child) => {
        const coin = child as Phaser.Physics.Arcade.Sprite;
        const distY = this.player.y - coin.y;
        const distX = this.player.x - coin.x;
        const magnetRange = this.selectedFoodId === 'onion' ? 600 : 400;

        if (Math.abs(distY) < magnetRange) {
          coin.x += distX * 0.1;
          coin.y += distY * 0.1;
          coin.setVelocityY(0);
        }
      });
    }

    // Cleanup offscreen objects
    const cleanupGroup = (group: Phaser.Physics.Arcade.Group, checkBonus: boolean = false) => {
      group.getChildren().forEach((child) => {
        const obj = child as Phaser.Physics.Arcade.Sprite;
        if (obj.y > this.scale.height + 100) {
          obj.destroy();
          if (checkBonus) {
            this.score += 50;
            this.progressChallenge('dodge');
          }
        } else {
          if (!(group === this.coins && this.isMagnet)) {
            obj.setVelocityY(this.currentSpeed);
          }
        }
      });
    };

    cleanupGroup(this.obstacles, true);
    cleanupGroup(this.coins);
    cleanupGroup(this.powerups);
  }

  private showMissionComplete(text: string) {
    const w = this.scale.width;
    const container = this.add.container(w / 2, -100).setDepth(1000).setScrollFactor(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x22c55e, 0.9);
    bg.fillRoundedRect(-160, 0, 320, 60, 14);
    bg.lineStyle(2, 0xffffff, 0.3);
    bg.strokeRoundedRect(-160, 0, 320, 60, 14);

    const txt = this.add.text(0, 30, `🎯 ${text}`, {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: '700',
      align: 'center'
    }).setOrigin(0.5);

    container.add([bg, txt]);

    this.tweens.add({
      targets: container,
      y: 90,
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
        this.showMissionComplete('Stomaco Raggiunto! (+200)');
      }
    } else if (stage.name === 'Intestino Crasso') {
      if (MissionManager.checkMissionCompletion('reach_intestine_c', 1)) {
        this.showMissionComplete('Intestino Crasso! (+1000)');
      }
    }

    // Stage name popup
    const text = this.add.text(this.scale.width / 2, 200, stage.name.toUpperCase(), {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '42px',
      color: '#fff',
      fontStyle: '900',
      stroke: '#000',
      strokeThickness: 6,
      shadow: { color: '#a855f7', blur: 20, fill: true, stroke: true }
    }).setOrigin(0.5).setAlpha(0).setDepth(200);

    this.tweens.add({
      targets: text,
      alpha: 1, y: 250,
      duration: 800, yoyo: true, hold: 1000,
      onComplete: () => text.destroy()
    });

    // Camera flash
    this.cameras.main.flash(300, 168, 85, 247);

    this.bg1.setTint(stage.bg1);
    this.bg2.setTint(stage.bg2);
    this.laneLines.forEach((line) => line.setTint(stage.lanes));
  }

  // --- Dynamic Challenge Methods ---

  private createChallengeUI() {
    const w = this.scale.width;
    this.challengeContainer = this.add.container(w / 2, 80).setDepth(200);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-180, 0, 360, 55, 28);
    bg.lineStyle(2, 0x22c55e, 0.7);
    bg.strokeRoundedRect(-180, 0, 360, 55, 28);

    this.challengeContainer.add(bg);

    this.challengeText = this.add.text(0, 28, 'MISSIONE...', {
      fontFamily: CONSTS.FONT_FAMILY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: '700',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.challengeContainer.add(this.challengeText);

    this.challengeContainer.setY(-100);
  }

  private spawnNewChallenge() {
    const types = [
      { type: 'collect', goal: 20, desc: '🫘 Raccogli 20 fagioli' },
      { type: 'dodge', goal: 10, desc: '💨 Schiva 10 ostacoli' },
      { type: 'jump', goal: 5, desc: '🦘 Salta 5 volte' }
    ];
    const pick = types[Phaser.Math.Between(0, types.length - 1)];
    this.activeChallenge = { ...pick, progress: 0, description: pick.desc };
    this.updateChallengeUI();

    this.tweens.add({
      targets: this.challengeContainer,
      y: 80,
      duration: 600,
      ease: 'Back.easeOut'
    });
  }

  private updateChallengeUI() {
    if (!this.activeChallenge) return;
    this.challengeText.setText(`${this.activeChallenge.description.toUpperCase()}\n[ ${this.activeChallenge.progress} / ${this.activeChallenge.goal} ]`);
  }

  private progressChallenge(type: string, amount: number = 1) {
    if (!this.activeChallenge || this.activeChallenge.type !== type) return;
    this.activeChallenge.progress += amount;
    this.updateChallengeUI();

    if (this.activeChallenge.progress >= this.activeChallenge.goal) {
      this.completeChallenge();
    }
  }

  private completeChallenge() {
    this.audioSystem.playPowerup();
    this.score += 500;
    this.createScorePopup(this.scale.width / 2, 200, '🎯 +500 MISSIONE!');

    this.cameras.main.shake(300, 0.01);
    this.cameras.main.flash(400, 0, 255, 0, true);

    this.tweens.add({
      targets: this.challengeContainer,
      y: -100,
      duration: 500,
      ease: 'Back.easeIn'
    });

    this.activeChallenge = null;
    this.time.delayedCall(4000, () => this.spawnNewChallenge());
  }
}
