// Tests for product-stuck.service — TRACKING-ONLY contract verification
// Focus: privacy contract (no email/phone fields) + threshold constant + empty fallback

import assert from 'node:assert/strict';
import test from 'node:test';

import { getProductStuck, STUCK_THRESHOLD_DAYS } from './product-stuck.service';

test('STUCK_THRESHOLD_DAYS = 7 (per audit verdict)', () => {
  assert.equal(STUCK_THRESHOLD_DAYS, 7);
});

test('getProductStuck returns empty fallback when CRM not configured', async () => {
  const orig = process.env.CRM_DATABASE_URL;
  delete process.env.CRM_DATABASE_URL;
  try {
    const result = await getProductStuck();
    assert.equal(result.thresholdDays, 7);
    assert.equal(result.totalCount, 0);
    assert.deepEqual(result.items, []);
  } finally {
    if (orig !== undefined) process.env.CRM_DATABASE_URL = orig;
  }
});

test('StuckBusiness shape contains no PII fields', async () => {
  // Privacy contract: response items must NEVER include email/phone
  const result = await getProductStuck();
  for (const item of result.items) {
    const keys = Object.keys(item);
    assert.equal(keys.includes('email'), false, 'must not expose email');
    assert.equal(keys.includes('phone'), false, 'must not expose phone');
    assert.equal(keys.includes('contactInfo'), false, 'must not expose contact info');
    // Required fields only
    assert.equal(typeof item.businessId, 'string');
    assert.equal(typeof item.daysStuck, 'number');
    assert.equal(typeof item.signupAt, 'string');
  }
});
