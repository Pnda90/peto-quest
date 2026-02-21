export interface SaveData {
  highScore: number;
  coins: number;
  unlockedSkins: string[];
  equippedSkin: string;
  audioEnabled: boolean;
  upgrades: {
    invincibilityLevel: number;
    magnetLevel: number;
  };
  leaderboard: { score: number; distance: number; date: string }[];
  missions: { [key: string]: number }; // missionId -> progress (or completion status)
}

const SAVE_KEY = 'fart_quest_save_v1';

const DEFAULT_SAVE: SaveData = {
  highScore: 0,
  coins: 0,
  unlockedSkins: ['default'],
  equippedSkin: 'default',
  audioEnabled: true,
  upgrades: {
    invincibilityLevel: 0,
    magnetLevel: 0
  },
  leaderboard: [],
  missions: {}
};

export class SaveManager {
  static getSaveData(): SaveData {
    try {
      const dataStr = localStorage.getItem(SAVE_KEY);
      if (dataStr) {
        const loadedData = JSON.parse(dataStr);
        // Merge with default to ensure new properties exist
        return {
          ...DEFAULT_SAVE,
          ...loadedData,
          upgrades: {
            ...DEFAULT_SAVE.upgrades,
            ...(loadedData.upgrades || {})
          },
          leaderboard: loadedData.leaderboard || [],
          missions: loadedData.missions || {}
        };
      }
    } catch (e) {
      console.warn('Could not read save data', e);
    }
    return { ...DEFAULT_SAVE };
  }

  static save(data: SaveData) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save data', e);
    }
  }

  static updateHighScore(score: number): boolean {
    const data = this.getSaveData();
    if (score > data.highScore) {
      data.highScore = score;
      this.save(data);
      return true; // New high score
    }
    return false;
  }

  static addCoins(amount: number) {
    const data = this.getSaveData();
    data.coins += amount;
    this.save(data);
  }

  static spendCoins(amount: number): boolean {
    const data = this.getSaveData();
    if (data.coins >= amount) {
      data.coins -= amount;
      this.save(data);
      return true;
    }
    return false;
  }

  static unlockSkin(skinId: string) {
    const data = this.getSaveData();
    if (!data.unlockedSkins.includes(skinId)) {
      data.unlockedSkins.push(skinId);
      this.save(data);
    }
  }

  static equipSkin(skinId: string) {
    const data = this.getSaveData();
    if (data.unlockedSkins.includes(skinId)) {
      data.equippedSkin = skinId;
      this.save(data);
    }
  }

  static getUpgradeLevel(upgradeId: 'invincibilityLevel' | 'magnetLevel'): number {
    const data = this.getSaveData();
    return data.upgrades[upgradeId] || 0;
  }

  static purchaseUpgrade(upgradeId: 'invincibilityLevel' | 'magnetLevel', cost: number): boolean {
    const data = this.getSaveData();
    if (data.coins >= cost) {
      data.coins -= cost;
      // Initialize if it doesn't exist
      if (!data.upgrades) {
        data.upgrades = { invincibilityLevel: 0, magnetLevel: 0 };
      }
      data.upgrades[upgradeId] = (data.upgrades[upgradeId] || 0) + 1;
      this.save(data);
      return true;
    }
    return false;
  }
  static getLeaderboard() {
    return this.getSaveData().leaderboard;
  }

  static addLeaderboardEntry(score: number, distance: number) {
    const data = this.getSaveData();
    const entry = {
      score,
      distance,
      date: new Date().toLocaleDateString()
    };
    data.leaderboard.push(entry);
    // Sort descending and keep top 10
    data.leaderboard.sort((a, b) => b.score - a.score);
    data.leaderboard = data.leaderboard.slice(0, 10);
    this.save(data);
  }

  static getMissionProgress(missionId: string): number {
    return this.getSaveData().missions[missionId] || 0;
  }

  static updateMissionProgress(missionId: string, amount: number) {
    const data = this.getSaveData();
    if (!data.missions) data.missions = {};
    data.missions[missionId] = (data.missions[missionId] || 0) + amount;
    this.save(data);
  }
}
