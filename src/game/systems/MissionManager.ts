import { SaveManager } from './SaveManager';

export interface Mission {
  id: string;
  description: string;
  goal: number;
  reward: number;
}

export const MISSIONS: Mission[] = [
  {
    id: 'collect_beans_total',
    description: 'Raccogli 1000 fagioli totali',
    goal: 1000,
    reward: 500
  },
  { id: 'reach_stomach', description: 'Raggiungi lo Stomaco', goal: 1, reward: 200 },
  { id: 'reach_intestine_c', description: "Raggiungi l'Intestino Crasso", goal: 1, reward: 1000 }
];

export class MissionManager {
  static checkMissionCompletion(missionId: string, currentProgress: number): boolean {
    const mission = MISSIONS.find((m) => m.id === missionId);
    if (!mission) return false;

    const oldProgress = SaveManager.getMissionProgress(missionId);

    // If already completed (using -1 or specific flag)
    if (oldProgress >= mission.goal) return false;

    if (currentProgress >= mission.goal) {
      // Reward the player
      SaveManager.addCoins(mission.reward);
      return true;
    }
    return false;
  }

  static getActiveMissions() {
    return MISSIONS.filter((m) => SaveManager.getMissionProgress(m.id) < m.goal);
  }
}
