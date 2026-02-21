import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SaveManager } from '../game/systems/SaveManager';

describe('SaveManager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return default save data if no data exists', () => {
    const data = SaveManager.getSaveData();
    expect(data.coins).toBe(0);
    expect(data.equippedSkin).toBe('default');
  });

  it('should add coins correctly', () => {
    SaveManager.addCoins(100);
    const data = SaveManager.getSaveData();
    expect(data.coins).toBe(100);
  });

  it('should spend coins correctly if enough balance', () => {
    SaveManager.addCoins(100);
    const success = SaveManager.spendCoins(50);
    expect(success).toBe(true);
    expect(SaveManager.getSaveData().coins).toBe(50);
  });

  it('should not spend coins if insufficient balance', () => {
    SaveManager.addCoins(10);
    const success = SaveManager.spendCoins(50);
    expect(success).toBe(false);
    expect(SaveManager.getSaveData().coins).toBe(10);
  });

  it('should update high score only if higher', () => {
    SaveManager.updateHighScore(100);
    expect(SaveManager.getSaveData().highScore).toBe(100);

    SaveManager.updateHighScore(50);
    expect(SaveManager.getSaveData().highScore).toBe(100);

    SaveManager.updateHighScore(200);
    expect(SaveManager.getSaveData().highScore).toBe(200);
  });
});
