import { isotopeData } from "@/data/isotopes";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const SCORE_MAX_VALUE = 1_000_000_000;
const SCORE_REFERENCE_SECONDS = 30;
const SCORE_CURVE_EXPONENT = 3;

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
  return Math.pow(2, delta);
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

export const formatIsotopeLabel = (label: string) => label.split("-")[0].trim();

export const calculateScore = (survivalSeconds: number) => {
  if (!Number.isFinite(survivalSeconds) || survivalSeconds <= 0) return 0;

  const progress = clamp(survivalSeconds / SCORE_REFERENCE_SECONDS, 0, 1);
  const shaped = Math.pow(progress, SCORE_CURVE_EXPONENT);
  return Math.round(SCORE_MAX_VALUE * shaped);
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
