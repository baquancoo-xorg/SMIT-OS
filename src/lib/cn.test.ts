import assert from 'node:assert/strict';
import test from 'node:test';
import { cn } from './cn';

test('cn joins strings, arrays, and truthy object keys', () => {
  assert.equal(
    cn('base', ['nested', false, ['deep']], { active: true, disabled: false }, null, undefined),
    'base nested deep active',
  );
});

test('cn keeps numeric classes and skips falsy values', () => {
  assert.equal(cn('grid', 12, 0, '', { hidden: null, shown: true }), 'grid 12 shown');
});
