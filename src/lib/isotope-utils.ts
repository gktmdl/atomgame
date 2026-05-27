import { isotopeData } from "@/data/isotopes";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getIsotope = (proton: number) => isotopeData[proton];

export const getStabilityGrade = (rank: number) => {
  if (rank >= 90) return "S";
  if (rank >= 75) return "A";
  if (rank >= 60) return "B";
  if (rank >= 45) return "C";
  return "D";
};

export const calculateInstabilityMultiplier = (
  neutrons: number,
  stableNeutrons: number
) => {
  const delta = Math.abs(neutrons - stableNeutrons);
  return Math.pow(3, delta);
};

const gaussianNoise = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const calculateFinalLifetime = (
  baseLifetimeSeconds: number,
  instabilityMultiplier: number
) => {
  const noise = clamp(gaussianNoise() * 0.02, -0.05, 0.05);
  const adjusted = baseLifetimeSeconds / Math.max(instabilityMultiplier, 1);
  return Math.max(0, adjusted * (1 + noise));
};

export const calculateScore = (survivalTimeSeconds: number) => {
  const t = clamp(survivalTimeSeconds, 0, 90);
  const numerator = Math.exp((5 * t) / 90) - 1;
  const denominator = Math.exp(5) - 1;
  return Math.floor(1_000_000_000 * (numerator / denominator));
};

export const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "무한";
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${minutes}분 ${remainder}초`;
  }
  return `${seconds.toFixed(1)}초`;
};
