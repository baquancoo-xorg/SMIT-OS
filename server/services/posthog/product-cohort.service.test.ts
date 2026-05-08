// Tests for product-cohort.service — HIGH RISK service (HogQL aggregation + timeout fallback)
// Focus: pure aggregation logic + env-disabled fallback behavior

import assert from 'node:assert/strict';
import test from 'node:test';

import { aggregateCohorts, getProductCohort } from './product-cohort.service';

test('aggregateCohorts maps rows to cohort retention with %', () => {
  // [cohort, size, daysSince, activeCount]
  const rows: Array<[string, number, number, number]> = [
    ['2026-W18', 100, 0, 100],
    ['2026-W18', 100, 1, 80],
    ['2026-W18', 100, 7, 50],
    ['2026-W18', 100, 14, 30],
    ['2026-W18', 100, 30, 10],
    ['2026-W17', 50, 0, 50],
    ['2026-W17', 50, 7, 25],
  ];
  const result = aggregateCohorts(rows);

  assert.equal(result.length, 2);
  // Sorted DESC by cohort label
  assert.equal(result[0].cohort, '2026-W18');
  assert.equal(result[0].size, 100);
  assert.deepEqual(result[0].retention, { d0: 100, d1: 80, d7: 50, d14: 30, d30: 10 });

  assert.equal(result[1].cohort, '2026-W17');
  assert.equal(result[1].size, 50);
  // Missing buckets default to 0
  assert.equal(result[1].retention.d0, 100);
  assert.equal(result[1].retention.d1, 0);
  assert.equal(result[1].retention.d7, 50);
  assert.equal(result[1].retention.d14, 0);
});

test('aggregateCohorts handles empty input', () => {
  assert.deepEqual(aggregateCohorts([]), []);
});

test('aggregateCohorts caps to top 8 most recent cohorts', () => {
  const rows: Array<[string, number, number, number]> = [];
  for (let w = 1; w <= 12; w++) {
    rows.push([`2026-W${w.toString().padStart(2, '0')}`, 10, 0, 10]);
  }
  const result = aggregateCohorts(rows);
  assert.equal(result.length, 8);
  // Top 8 most recent = W12 .. W05
  assert.equal(result[0].cohort, '2026-W12');
  assert.equal(result[7].cohort, '2026-W05');
});

test('aggregateCohorts pct rounds correctly (33.3% → 33)', () => {
  const rows: Array<[string, number, number, number]> = [
    ['2026-W18', 3, 0, 1], // 33.33% → 33
    ['2026-W18', 3, 7, 2], // 66.67% → 67
  ];
  const result = aggregateCohorts(rows);
  assert.equal(result[0].retention.d0, 33);
  assert.equal(result[0].retention.d7, 67);
});

test('getProductCohort returns empty + message when PostHog not configured', async () => {
  const orig = process.env.POSTHOG_HOST;
  delete process.env.POSTHOG_HOST;
  try {
    // Force re-eval — but module-level isPostHogConfigured() uses captured env at import.
    // This test verifies fallback contract; if POSTHOG_HOST exists in env, we skip.
    if (!orig) {
      const result = await getProductCohort('2026-04-01T00:00:00Z', '2026-05-01T00:00:00Z');
      assert.equal(result.cohorts.length, 0);
      assert.equal(typeof result.message, 'string');
    }
  } finally {
    if (orig !== undefined) process.env.POSTHOG_HOST = orig;
  }
});
