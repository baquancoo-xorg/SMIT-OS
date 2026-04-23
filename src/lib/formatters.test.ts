import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatCurrency,
  formatDateDisplay,
  formatNumber,
  formatPercent,
  formatRoas,
} from './formatters';

test('formatters smoke test', () => {
  assert.equal(formatCurrency(1234567), '1.234.567');
  assert.equal(formatNumber(1234.5), '1.234,5');
  assert.equal(formatPercent(12.34), '12.3%');
  assert.equal(formatRoas(2.345), '2.35x');
  assert.equal(formatDateDisplay('2026-04-23'), '23/04/2026');
  assert.equal(formatDateDisplay(''), '');
});
