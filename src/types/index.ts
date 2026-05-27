export interface GameState {
  isPlaying: boolean;
  score: number;
  survivalTime: number; // in seconds
  proton: number;
  neutron: number;
  electron: number;
  statusMessage: string;
  isDead: boolean;
}

export interface ScoreEntry {
  id?: string;
  score: number;
  resultType?:
    | "stable"
    | "nuclear_decay"
    | "charge_failure"
    | "invalid_element";
  survivalTime: number;
  proton: number;
  neutron: number;
  electron: number;
  isotope: string;
  elementName: string;
  guestId?: string;
  playerName?: string;
  createdAt: number;
}
