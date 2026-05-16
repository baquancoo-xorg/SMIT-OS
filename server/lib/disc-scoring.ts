/**
 * DISC scoring — Natural style only (no Adapted overlay).
 * Algorithm: each item user picks 1 Most + 1 Least word.
 *   Most +1 for that letter (D/I/S/C). Least −1.
 *   Raw range per letter: −24 ... +24. Normalize to 0-100.
 * Primary = highest. Secondary = 2nd highest (only if within 30% of primary).
 */

import items from '../data/disc-vi.json';
import descriptions from '../data/disc-descriptions-vi.json';

export type DiscType = 'D' | 'I' | 'S' | 'C';

export interface DiscAnswer {
  itemId: number;
  most: DiscType;
  least: DiscType;
}

export interface DiscResults {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DiscSummary {
  primary: DiscType;
  secondary: DiscType | null;
  primaryName: string;
  primaryShortLabel: string;
  primaryStyle: string;
  secondaryName: string | null;
}

const TOTAL_ITEMS = 24;
const RAW_RANGE = TOTAL_ITEMS * 2; // -24 → +24 = 48 span

function normalize(raw: number): number {
  // Map -24..+24 to 0..100
  return Math.round(((raw + TOTAL_ITEMS) / RAW_RANGE) * 100);
}

export function scoreDisc(answers: DiscAnswer[]): { results: DiscResults; summary: DiscSummary } {
  if (answers.length !== TOTAL_ITEMS) {
    throw new Error(`DISC requires ${TOTAL_ITEMS} answers, got ${answers.length}`);
  }
  const validTypes = new Set<DiscType>(['D', 'I', 'S', 'C']);
  const raw: DiscResults = { D: 0, I: 0, S: 0, C: 0 };

  for (const a of answers) {
    if (!validTypes.has(a.most) || !validTypes.has(a.least)) {
      throw new Error(`Item ${a.itemId} has invalid type`);
    }
    if (a.most === a.least) {
      throw new Error(`Item ${a.itemId}: most and least cannot be the same`);
    }
    // Validate that most/least types exist in this item's word list
    const item = items.items.find((i) => i.id === a.itemId);
    if (!item) throw new Error(`Unknown itemId ${a.itemId}`);
    const types = new Set(item.words.map((w) => w.type));
    if (!types.has(a.most) || !types.has(a.least)) {
      throw new Error(`Item ${a.itemId}: most/least type not in word list`);
    }
    raw[a.most] += 1;
    raw[a.least] -= 1;
  }

  const results: DiscResults = {
    D: normalize(raw.D),
    I: normalize(raw.I),
    S: normalize(raw.S),
    C: normalize(raw.C),
  };

  const sorted = (Object.entries(results) as Array<[DiscType, number]>).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const primaryScore = sorted[0][1];
  const secondaryScore = sorted[1][1];
  // Secondary chỉ khi gap ≤ 15 điểm (~30% of 50 mid-point)
  const secondary = primaryScore - secondaryScore <= 15 ? sorted[1][0] : null;

  const types = descriptions.types as Record<string, { name: string; shortLabel: string; style: string }>;
  return {
    results,
    summary: {
      primary,
      secondary,
      primaryName: types[primary].name,
      primaryShortLabel: types[primary].shortLabel,
      primaryStyle: types[primary].style,
      secondaryName: secondary ? types[secondary].name : null,
    },
  };
}
