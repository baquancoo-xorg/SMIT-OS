// Tests for product-channel.service normalize helpers
// Per audit: CRM utm_source dirty (Home/Homepage, fb/Facebook/facebook/Faceboookads) needs consolidation

import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSource, normalizePostHogDomain } from './product-channel.service';

test('normalizeSource consolidates Home/Homepage variants → home', () => {
  assert.equal(normalizeSource('Home'), 'home');
  assert.equal(normalizeSource('Homepage'), 'home');
  assert.equal(normalizeSource('HOME'), 'home');
  assert.equal(normalizeSource('  home  '), 'home');
  assert.equal(normalizeSource('homepage_v2'), 'home');
});

test('normalizeSource consolidates Facebook variants → facebook', () => {
  assert.equal(normalizeSource('fb'), 'facebook');
  assert.equal(normalizeSource('Facebook'), 'facebook');
  assert.equal(normalizeSource('facebook'), 'facebook');
  assert.equal(normalizeSource('Faceboookads'), 'facebook');
  assert.equal(normalizeSource('facebook_ad'), 'facebook');
});

test('normalizeSource consolidates Google + Zalo + adscheck variants', () => {
  assert.equal(normalizeSource('google'), 'google');
  assert.equal(normalizeSource('Google Ads'), 'google');
  assert.equal(normalizeSource('zalo'), 'zalo');
  assert.equal(normalizeSource('Zalo OA'), 'zalo');
  assert.equal(normalizeSource('Adscheck'), 'adscheck');
  assert.equal(normalizeSource('adscheck_v2'), 'adscheck');
});

test('normalizeSource preserves unknown sources lower-cased', () => {
  assert.equal(normalizeSource('Newsletter'), 'newsletter');
  assert.equal(normalizeSource('CustomCampaign'), 'customcampaign');
});

test('normalizePostHogDomain folds variants', () => {
  assert.equal(normalizePostHogDomain('m.facebook.com'), 'facebook');
  assert.equal(normalizePostHogDomain('www.google.com'), 'google');
  assert.equal(normalizePostHogDomain('Instagram.com'), 'instagram');
  assert.equal(normalizePostHogDomain('zalo.me'), 'zalo');
  assert.equal(normalizePostHogDomain('zalo.com'), 'zalo');
  assert.equal(normalizePostHogDomain('bing.com'), 'other-search');
  assert.equal(normalizePostHogDomain('yahoo.com'), 'other-search');
});

test('normalizePostHogDomain preserves unknown domain lower-cased', () => {
  assert.equal(normalizePostHogDomain('Reddit.com'), 'reddit.com');
  assert.equal(normalizePostHogDomain('  custom.example.com  '), 'custom.example.com');
});
