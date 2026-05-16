import assert from 'node:assert/strict';
import test from 'node:test';
import { DENSITY_STORAGE_KEY, THEME_STORAGE_KEY, v5DensityTokens, themeTokens } from './tokens';

test('v5 theme tokens define dark and light command-center palettes', () => {
  assert.equal(THEME_STORAGE_KEY, 'smit-theme');
  assert.equal(themeTokens.dark.background, '#0d0d0d');
  assert.equal(themeTokens.dark.accent, '#ff6d29');
  assert.equal(themeTokens.light.accent, '#d95716');
});

test('v5 density tokens define comfortable and compact row contracts', () => {
  assert.equal(DENSITY_STORAGE_KEY, 'smit-density');
  assert.equal(v5DensityTokens.comfortable.rowMin, '48px');
  assert.equal(v5DensityTokens.compact.rowMin, '40px');
});
