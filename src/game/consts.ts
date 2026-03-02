export const CONSTS = {
  GAME_WIDTH: 800,
  GAME_HEIGHT: 1200, // Portrait orientation is good for mobile infinite runner

  // Lanes
  LANES: 3,
  LANE_WIDTH: 200,
  LANE_POSITIONS: [-200, 0, 200], // X Offsets from center X

  // Player
  PLAYER_SPEED_X: 300,
  LANE_SWITCH_DURATION: 150, // ms
  PLAYER_JUMP_VELOCITY: -800,
  GRAVITY: 2000,
  PLAYER_SLIDE_DURATION: 600, // ms

  // Game Speed
  BASE_SPEED: 600,
  SPEED_INCREMENT: 10,
  MAX_SPEED: 1500,

  // Items
  COIN_VALUE: 1,
  POWERUP_DURATION: 5000, // ms

  // Scene Names
  SCENES: {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    MENU: 'MenuScene',
    SELECTION: 'SelectionScene',
    GAME: 'GameScene',
    GAMEOVER: 'GameOverScene',
    SHOP: 'ShopScene',
    LEADERBOARD: 'LeaderboardScene'
  },

  // Font
  FONT_FAMILY: 'Outfit, sans-serif',

  // Premium Color Palette
  COLORS: {
    BACKGROUND: 0x0a0a1a,
    BACKGROUND_HEX: '#0a0a1a',
    TEXT: '#ffffff',
    TITLE: '#ffcc00',
    TITLE_GLOW: '#ff8800',
    ACCENT: '#a855f7',       // Purple accent
    ACCENT_HEX: '#a855f7',
    SUCCESS: '#22c55e',
    DANGER: '#ef4444',
    WARNING: '#f59e0b',
    GOLD: '#fbbf24',
    LANE_LINES: 0x8844ff,
    PLAYER: 0x55ff55,
    OBSTACLE: 0xff5555,
    UI_BG: 0x000000,
    UI_BG_ALPHA: 0.7,
    // Button colors
    BTN_PRIMARY: 0x7c3aed,     // Vivid purple
    BTN_PRIMARY_HOVER: 0x9333ea,
    BTN_SECONDARY: 0xd97706,   // Amber
    BTN_DANGER: 0xdc2626,
    BTN_NEUTRAL: 0x374151,
    // Gradient pairs
    GRAD_PURPLE: [0x7c3aed, 0xa855f7],
    GRAD_GOLD: [0xf59e0b, 0xfbbf24],
    GRAD_GREEN: [0x059669, 0x22c55e],
    GRAD_RED: [0xdc2626, 0xef4444],
  },

  // Digestive Stages (replacing biomes)
  STAGES: [
    { name: 'Esofago', bg1: 0xffaaaa, bg2: 0xff8888, lanes: 0xaa4444 },
    { name: 'Stomaco', bg1: 0xff88aa, bg2: 0xff6688, lanes: 0xaa2266 },
    { name: 'Intestino Tenue', bg1: 0xeeaa88, bg2: 0xcc8866, lanes: 0x884422 },
    { name: 'Intestino Crasso', bg1: 0x886644, bg2: 0x664422, lanes: 0x442211 }
  ],

  // Food Selection Data
  FOODS: [
    {
      id: 'beans',
      name: 'Fagioli Magici',
      bonus: 'Velocità +',
      color: '#8B4513',
      description: 'Digestione rapida per massima velocità.'
    },
    {
      id: 'onion',
      name: 'Cipolla',
      bonus: 'Magnete ++',
      color: '#ffffff',
      description: 'Un odore così forte che attrae tutto.'
    },
    {
      id: 'chili',
      name: 'Peperoncino',
      bonus: 'Moltiplicatore X2',
      color: '#ff4400',
      description: 'Piccantezza estrema per punti doppi.'
    }
  ],
  // Entity Keys
  KEYS: {
    COIN: 'item_coin',
    PWR_INVINCIBLE: 'item_invincibility',
    PWR_MAGNET: 'item_magnet'
  }
} as const;
