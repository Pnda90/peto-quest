import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ShopScene } from './scenes/ShopScene';
import { SettingsScene } from './scenes/SettingsScene';
import { SelectionScene } from './scenes/SelectionScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { CONSTS } from './consts';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: CONSTS.GAME_WIDTH,
  height: CONSTS.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: CONSTS.COLORS.BACKGROUND,
  pixelArt: false, // Not using pixel art scaling
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    autoRound: true
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // We'll manage Fake 3D gravity manually
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    GameOverScene,
    ShopScene,
    SettingsScene,
    SelectionScene,
    LeaderboardScene
  ]
};

export class PetoQuestGame extends Phaser.Game {
  constructor() {
    super(config);
  }
}
