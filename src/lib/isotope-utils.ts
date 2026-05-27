import { isotopeData } from "@/data/isotopes";

const SCORE_MAX_VALUE = 1_000_000_000;
const SCORE_REFERENCE_SECONDS = 20;
const SCORE_CURVE_EXPONENT = 3;
const POISSON_NOISE_LAMBDA = 400;

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
  stableNeutrons: number[],
  preferredStableNeutrons: number
) => {
  const referenceNeutrons =
    stableNeutrons.length > 0 ? stableNeutrons : [preferredStableNeutrons];

  if (referenceNeutrons.includes(neutrons)) {
    return 1;
  }

  const delta = Math.min(
    ...referenceNeutrons.map((stableNeutron) => Math.abs(neutrons - stableNeutron))
  );
  return Math.pow(3, delta);
};

const samplePoisson = (lambda: number) => {
  if (!Number.isFinite(lambda) || lambda <= 0) return 0;

  const threshold = Math.exp(-lambda);
  let product = 1;
  let count = 0;

  do {
    count += 1;
    product *= Math.random();
  } while (product > threshold);

  return count - 1;
};

const poissonNoise = (stdDev: number) => {
  const sample = samplePoisson(POISSON_NOISE_LAMBDA);
  const normalized = (sample - POISSON_NOISE_LAMBDA) / Math.sqrt(POISSON_NOISE_LAMBDA);
  return normalized * stdDev;
};

export const calculateFinalLifetime = (
  baseLifetimeSeconds: number,
  instabilityMultiplier: number
) => {
  const noise = poissonNoise(0.05);
  const adjusted = baseLifetimeSeconds / Math.max(instabilityMultiplier, 1);
  return Math.max(0, adjusted * (1 + noise));
};

export const formatIsotopeLabel = (label: string) => label.split("-")[0].trim();

export const formatChargedAtomLabel = (
  label: string,
  proton: number,
  electron: number
) => (electron === proton ? label : `${label}?`);

export const calculateScore = (survivalSeconds: number) => {
  if (!Number.isFinite(survivalSeconds) || survivalSeconds <= 0) return 0;

  const progress = survivalSeconds / SCORE_REFERENCE_SECONDS;
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
