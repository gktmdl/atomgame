import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { ELEMENTS } from "./element-metadata";

type RawNuclide = {
  z: number;
  n: number;
  mass: number;
  halfLifeRaw: string;
  halfLifeSeconds: number;
  abundance?: number;
};

const SOURCE_URL =
  "https://raw.githubusercontent.com/GustavLindberg99/NuclideChart/main/data.csv";
const LOCAL_PATH = join(process.cwd(), "scripts", "data", "nuclides.csv");
const OUTPUT_PATH = join(process.cwd(), "src", "data", "isotopes.ts");
const YEAR_SECONDS = 365.25 * 24 * 60 * 60;

const UNIT_SECONDS: Record<string, number> = {
  ys: 1e-24,
  zs: 1e-21,
  as: 1e-18,
  fs: 1e-15,
  ps: 1e-12,
  ns: 1e-9,
  us: 1e-6,
  "µs": 1e-6,
  ms: 1e-3,
  s: 1,
  m: 60,
  min: 60,
  h: 3600,
  d: 86400,
  y: YEAR_SECONDS,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const parseNumber = (value: string) => {
  const normalized = value.replace(/,/g, "");
  const match = normalized.match(/[+-]?\d+(?:\.\d+)?(?:E[+-]?\d+)?/i);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseAbundance = (raw: string) => {
  const parsed = parseNumber(raw);
  return parsed === null ? undefined : parsed;
};

const parseHalfLifeToSeconds = (raw: string) => {
  const cleaned = raw.trim();
  if (!cleaned) return 0;
  if (/stable/i.test(cleaned)) return Number.POSITIVE_INFINITY;

  const normalized = cleaned
    .replace(/[<>~]/g, "")
    .replace(/μs/g, "us")
    .replace(/\s+/g, " ")
    .trim();
  const numberPart = parseNumber(normalized);
  if (numberPart === null) return 0;

  const unitMatch = normalized.match(
    /(ys|zs|as|fs|ps|ns|us|ms|min|m|h|d|y|s)\b/i
  );
  const unit = unitMatch?.[1].toLowerCase() ?? "s";
  const multiplier = UNIT_SECONDS[unit] ?? 1;
  return numberPart * multiplier;
};

const loadCsv = async () => {
  if (existsSync(LOCAL_PATH)) {
    return readFile(LOCAL_PATH, "utf-8");
  }
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch nuclide data: ${response.status}`);
  }
  const csv = await response.text();
  await mkdir(dirname(LOCAL_PATH), { recursive: true });
  await writeFile(LOCAL_PATH, csv, "utf-8");
  return csv;
};

const parseCsv = (csv: string) => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  lines.shift();
  const rows: RawNuclide[] = [];
  let buffer = "";

  for (const line of lines) {
    const next = buffer ? `${buffer}${line}` : line;
    const parts = next.split(";");
    if (parts.length < 9) {
      buffer = next;
      continue;
    }
    buffer = "";
    const [nuclide, zRaw, nRaw, , , , halfLifeRaw, , abundanceRaw] = parts;
    const z = Number(zRaw);
    const n = Number(nRaw);
    if (!Number.isFinite(z) || !Number.isFinite(n)) continue;
    const halfLifeSeconds = parseHalfLifeToSeconds(halfLifeRaw);
    const abundance = parseAbundance(abundanceRaw ?? "");

    rows.push({
      z,
      n,
      mass: z + n,
      halfLifeRaw: halfLifeRaw?.trim() ?? "",
      halfLifeSeconds,
      abundance,
    });
  }
  return rows;
};

const calculateStabilityRank = (halfLifeSeconds: number, maxHalfLife: number) => {
  if (!Number.isFinite(halfLifeSeconds)) return 100;
  const rank =
    (100 * Math.log10(halfLifeSeconds + 10)) /
    Math.log10(maxHalfLife + 10);
  return Math.round(clamp(rank, 1, 100));
};

const calculateBaseLifetime = (
  halfLifeSeconds: number,
  maxHalfLife: number
) => {
  if (!Number.isFinite(halfLifeSeconds)) return 30;
  if (halfLifeSeconds <= 0) return 0;
  const normalized =
    Math.log10(halfLifeSeconds + 1) / Math.log10(maxHalfLife + 1);
  const scaled =
    (Math.exp(3 * normalized) - 1) / (Math.exp(3) - 1);
  return Number((30 * scaled).toFixed(3));
};

const isStableNuclide = (row: RawNuclide) =>
  /stable/i.test(row.halfLifeRaw) || !Number.isFinite(row.halfLifeSeconds);

const pickPreferredNuclide = (rows: RawNuclide[]) => {
  const stable = rows.filter(isStableNuclide);
  if (stable.length > 0) {
    return stable
      .slice()
      .sort((a, b) => {
        const aAb = a.abundance ?? -1;
        const bAb = b.abundance ?? -1;
        if (bAb !== aAb) return bAb - aAb;
        return a.mass - b.mass;
      })[0];
  }
  return rows.reduce((best, current) =>
    current.halfLifeSeconds > best.halfLifeSeconds ? current : best
  );
};

const uniqueSorted = (values: number[]) =>
  Array.from(new Set(values)).sort((left, right) => left - right);

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return "Number.POSITIVE_INFINITY";
  return Number.isInteger(value) ? value.toString() : value.toString();
};

const formatNumberArray = (values: number[]) =>
  values.length === 0 ? "[]" : `[${values.join(", ")}]`;

const generateIsotopes = async () => {
  const csv = await loadCsv();
  const rows = parseCsv(csv);
  const finiteHalfLives = rows
    .map((row) => row.halfLifeSeconds)
    .filter((value) => Number.isFinite(value) && value > 0) as number[];
  const maxHalfLifeSeconds = Math.max(...finiteHalfLives, 1);

  const entries = ELEMENTS.map((element) => {
    const elementRows = rows.filter((row) => row.z === element.z);
    if (elementRows.length === 0) {
      return {
        z: element.z,
        symbol: element.symbol,
        englishName: element.name,
        koreanName: element.koreanName,
        stableMass: element.z,
        stableNeutrons: [],
        preferredStableNeutrons: 0,
        halfLifeSeconds: 0,
        stabilityRank: 1,
        baseLifetimeSeconds: 0,
      };
    }

    const stableRows = elementRows.filter(isStableNuclide);
    const choice = pickPreferredNuclide(elementRows);
    const stabilityRank = calculateStabilityRank(
      choice.halfLifeSeconds,
      maxHalfLifeSeconds
    );
    const baseLifetimeSeconds = calculateBaseLifetime(
      choice.halfLifeSeconds,
      maxHalfLifeSeconds
    );

    return {
      z: element.z,
      symbol: element.symbol,
      englishName: element.name,
      koreanName: element.koreanName,
      stableMass: choice.mass,
      stableNeutrons: uniqueSorted(stableRows.map((row) => row.n)),
      preferredStableNeutrons: choice.n,
      halfLifeSeconds: choice.halfLifeSeconds,
      stabilityRank,
      baseLifetimeSeconds,
    };
  });

  const lines = [
    "/* eslint-disable */",
    "// This file is auto-generated by scripts/generate-isotope-data.ts",
    "// Source: NuclideChart data.csv (MIT License)",
    "// https://github.com/GustavLindberg99/NuclideChart",
    "",
    `export const maxHalfLifeSeconds = ${formatNumber(maxHalfLifeSeconds)};`,
    "",
    "export const isotopeData: Record<number, {",
    "  symbol: string;",
    "  englishName: string;",
    "  koreanName: string;",
    "  stableMass: number;",
    "  stableNeutrons: number[];",
    "  preferredStableNeutrons: number;",
    "  halfLifeSeconds: number;",
    "  stabilityRank: number;",
    "  baseLifetimeSeconds: number;",
    "}> = {",
  ];

  for (const entry of entries) {
    lines.push(`  ${entry.z}: {`);
    lines.push(`    symbol: "${entry.symbol}",`);
    lines.push(`    englishName: "${entry.englishName}",`);
    lines.push(`    koreanName: "${entry.koreanName}",`);
    lines.push(`    stableMass: ${entry.stableMass},`);
    lines.push(`    stableNeutrons: ${formatNumberArray(entry.stableNeutrons)},`);
    lines.push(`    preferredStableNeutrons: ${entry.preferredStableNeutrons},`);
    lines.push(`    halfLifeSeconds: ${formatNumber(entry.halfLifeSeconds)},`);
    lines.push(`    stabilityRank: ${entry.stabilityRank},`);
    lines.push(`    baseLifetimeSeconds: ${entry.baseLifetimeSeconds},`);
    lines.push("  },");
  }

  lines.push("};");
  lines.push("");

  await writeFile(OUTPUT_PATH, lines.join("\n"), "utf-8");
  return { count: entries.length, maxHalfLifeSeconds };
};

generateIsotopes()
  .then(({ count }) => {
    console.log(`Generated isotope data for ${count} elements.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
