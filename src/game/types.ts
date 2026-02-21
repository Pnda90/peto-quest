export type LaneIndex = 0 | 1 | 2; // Left, Center, Right

export enum PlayerState {
    RUNNING,
    JUMPING,
    SLIDING,
    DEAD
}

export interface GameSettings {
    audioEnabled: boolean;
    quality: 0 | 1 | 2; // Low, Med, High
    swipeSensitivity: number;
}

export enum PowerUpType {
    INVINCIBILITY = 'invincibility',
    MAGNET = 'magnet'
}

