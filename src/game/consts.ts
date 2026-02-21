export const CONSTS = {
    GAME_WIDTH: 800,
    GAME_HEIGHT: 1200, // Portrait orientation is good for mobile infinite runner

    // Lanes
    LANES: 3,
    LANE_WIDTH: 200,
    LANE_POSITIONS: [-200, 0, 200], // X Offsets from center X

    // Player
    PLAYER_SPEED_X: 300,        // Speed of lane switching (tween duration could also be used)
    LANE_SWITCH_DURATION: 150,  // ms
    PLAYER_JUMP_VELOCITY: -800,
    GRAVITY: 2000,
    PLAYER_SLIDE_DURATION: 600, // ms

    // Game Speed
    BASE_SPEED: 600,            // Pixels per second downward (simulating forward movement)
    SPEED_INCREMENT: 10,        // How much speed increases over time
    MAX_SPEED: 1500,

    // Items
    COIN_VALUE: 1,
    POWERUP_DURATION: 5000,     // ms


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

    // Colors
    COLORS: {
        BACKGROUND: 0x222222,
        TEXT: '#ffffff',
        TITLE: '#ffcc00',
        LANE_LINES: 0x444444,
        PLAYER: 0x55ff55,
        OBSTACLE: 0xff5555,
        UI_BG: 0x000000
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
        { id: 'beans', name: 'Fagioli Magici', bonus: 'Velocità +', color: '#00ff00', description: 'Digestione rapida per massima velocità.' },
        { id: 'chili', name: 'Peperoncino', bonus: 'Turbo ++', color: '#ff4400', description: 'Poderose fiamme per un turbo duraturo.' },
        { id: 'onion', name: 'Cipolla', bonus: 'Magnete ++', color: '#ffffff', description: 'Un odore così forte che attrae tutto.' }
    ],

    // Entity Keys
    KEYS: {
        COIN: 'item_coin',
        PWR_INVINCIBLE: 'item_invincibility',
        PWR_MAGNET: 'item_magnet'
    }
} as const;
