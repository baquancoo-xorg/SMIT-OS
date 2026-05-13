import assert from 'node:assert/strict';
import test from 'node:test';
import { V5_DENSITY_STORAGE_KEY, V5_THEME_STORAGE_KEY, v5DensityTokens, v5ThemeTokens } from './tokens';

test('v5 theme tokens define dark and light command-center palettes', () => {
  assert.equal(V5_THEME_STORAGE_KEY, 'smit-theme');
  assert.equal(v5ThemeTokens.dark.background, '#0d0d0d');
  assert.equal(v5ThemeTokens.dark.accent, '#ff6d29');
  assert.equal(v5ThemeTokens.light.accent, '#d95716');
});

test('v5 density tokens define comfortable and compact row contracts', () => {
  assert.equal(V5_DENSITY_STORAGE_KEY, 'smit-density');
  assert.equal(v5DensityTokens.comfortable.rowMin, '48px');
  assert.equal(v5DensityTokens.compact.rowMin, '40px');
});
