export type IsotopeDatum = {
  symbol: string;
  name: string;
  koreanName: string;
  stableMass: number;
  stableNeutrons: number;
  halfLifeSeconds: number;
  stabilityRank: number;
  baseLifetimeSeconds: number;
};

export type ScoreEntry = {
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
  guestId: string;
  createdAt: Date;
};

export type ScorePayload = Omit<ScoreEntry, "createdAt">;

export type SessionEntry = {
  guestId: string;
  status: "playing" | "idle";
  updatedAt: Date;
  lastIsotope?: string;
};

export type GameStatus = "idle" | "running" | "decayed";

export type GameResult = {
  survivalTime: number;
  score: number;
  message: string;
  status: GameStatus;
};
