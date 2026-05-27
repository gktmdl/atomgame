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
  survivalTime: number;
  proton: number;
  neutron: number;
  electron: number;
  isotope: string;
  elementName: string;
  guestId: string;
  createdAt: number;
}
