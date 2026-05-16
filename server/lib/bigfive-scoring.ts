/**
 * Big Five (OCEAN) scoring engine.
 * Algorithm: reverse-key negative items (5→1, 4→2 ...), sum per dimension,
 * normalize to 0-100 (10 items × max 5 = 50 raw per dim).
 */

import items from '../data/bigfive-vi.json';
import descriptions from '../data/bigfive-descriptions-vi.json';

export type BigFiveDimension = 'O' | 'C' | 'E' | 'A' | 'N';

export interface BigFiveAnswer {
  itemId: number;
  value: number; // 1-5
}

export interface BigFiveResults {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
}

export interface BigFiveSummary {
  highest: BigFiveDimension;
  lowest: BigFiveDimension;
  highName: string;
  lowName: string;
  highDescription: string;
  lowDescription: string;
}

const TOTAL_ITEMS = 50;
const ITEMS_PER_DIM = 10;
const MAX_RAW_PER_DIM = ITEMS_PER_DIM * 5;

function reverseKey(value: number): number {
  return 6 - value;
}

export function scoreBigFive(answers: BigFiveAnswer[]): { results: BigFiveResults; summary: BigFiveSummary } {
  if (answers.length !== TOTAL_ITEMS) {
    throw new Error(`Big Five requires ${TOTAL_ITEMS} answers, got ${answers.length}`);
  }
  const byId = new Map<number, BigFiveAnswer>();
  for (const a of answers) {
    if (a.value < 1 || a.value > 5) throw new Error(`Answer ${a.itemId} value out of range`);
    byId.set(a.itemId, a);
  }

  const raw: BigFiveResults = { O: 0, C: 0, E: 0, A: 0, N: 0 };
  for (const item of items.items) {
    const answer = byId.get(item.id);
    if (!answer) throw new Error(`Missing answer for item ${item.id}`);
    const value = item.keyed === '+' ? answer.value : reverseKey(answer.value);
    raw[item.dimension as BigFiveDimension] += value;
  }

  const results: BigFiveResults = {
    O: Math.round((raw.O / MAX_RAW_PER_DIM) * 100),
    C: Math.round((raw.C / MAX_RAW_PER_DIM) * 100),
    E: Math.round((raw.E / MAX_RAW_PER_DIM) * 100),
    A: Math.round((raw.A / MAX_RAW_PER_DIM) * 100),
    N: Math.round((raw.N / MAX_RAW_PER_DIM) * 100),
  };

  const entries = Object.entries(results) as Array<[BigFiveDimension, number]>;
  entries.sort((a, b) => b[1] - a[1]);
  const highest = entries[0][0];
  const lowest = entries[entries.length - 1][0];
  const dims = descriptions.dimensions as Record<string, { name: string; high: string; low: string }>;

  return {
    results,
    summary: {
      highest,
      lowest,
      highName: dims[highest].name,
      lowName: dims[lowest].name,
      highDescription: dims[highest].high,
      lowDescription: dims[lowest].low,
    },
  };
}
