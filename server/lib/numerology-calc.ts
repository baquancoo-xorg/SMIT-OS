/**
 * Numerology calculator (Pythagorean system).
 * Self-implemented vì `numeroljs` npm package broken (calculateNumerology returns null,
 * Numeroljs.handle() throws TypeError). Algorithm public domain.
 */

import meanings from '../data/numerology-meanings-vi.json';

const PYTHAGOREAN: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const MASTER_NUMBERS = new Set([11, 22, 33]);

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd');
}

function reduce(n: number): number {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n).split('').reduce((a, c) => a + Number(c), 0);
  }
  return n;
}

function sumLetters(name: string, vowelsOnly: boolean, consonantsOnly = false): number {
  const cleaned = stripDiacritics(name).toLowerCase().replace(/[^a-z]/g, '');
  let total = 0;
  for (const ch of cleaned) {
    const isVowel = VOWELS.has(ch);
    if (vowelsOnly && !isVowel) continue;
    if (consonantsOnly && isVowel) continue;
    total += PYTHAGOREAN[ch] || 0;
  }
  return reduce(total);
}

function digitsSum(s: string): number {
  return s.replace(/\D/g, '').split('').reduce((a, c) => a + Number(c), 0);
}

export interface NumerologyResult {
  lifePath: number;
  expression: number;
  soulUrge: number;
  birthday: number;
  meanings: {
    lifePath: { title: string; description: string };
    expression: { title: string; description: string };
    soulUrge: { title: string; description: string };
    birthday: { title: string; description: string };
  };
}

function getMeaning(n: number): { title: string; description: string } {
  const m = (meanings as Record<string, { title: string; description: string }>)[String(n)];
  return m ?? { title: `Số ${n}`, description: 'Không có mô tả.' };
}

export function computeNumerology(fullName: string, birthDate: Date): NumerologyResult {
  const iso = birthDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const lifePath = reduce(digitsSum(iso));
  const expression = sumLetters(fullName, false);
  const soulUrge = sumLetters(fullName, true);
  const dayNum = birthDate.getUTCDate();
  const birthday = MASTER_NUMBERS.has(dayNum) ? dayNum : reduce(dayNum);

  return {
    lifePath,
    expression,
    soulUrge,
    birthday,
    meanings: {
      lifePath: getMeaning(lifePath),
      expression: getMeaning(expression),
      soulUrge: getMeaning(soulUrge),
      birthday: getMeaning(birthday),
    },
  };
}
