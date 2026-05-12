/**
 * API key auth tests — real PG (Docker port 5435), no mocks.
 * Covers: helpers (pure functions) + middleware (in-process) + requireAuth.
 *
 * Run: npm test -- api-key-auth
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import type { Request, Response, NextFunction } from 'express';

import { generateApiKey, extractPrefix, isValidKeyFormat, compareKey } from '../lib/api-key-helpers';
import { createApiKeyAuthMiddleware } from '../middleware/api-key-auth';
import { requireAuth } from '../middleware/require-auth';

// ---- helpers ----------------------------------------------------------------

const prisma = new PrismaClient();

// Admin user that exists in the DB — seeded by db:setup
const ADMIN_USER_ID = 'bcf275bb-9eb2-4968-9ccc-ebdbc3bbd75e';

// Track created API key ids for cleanup
const createdKeyIds: string[] = [];

/** Build a minimal mock Express req */
function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

/** Build a minimal mock Express res */
function mockRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) { this.statusCode = code; return this; },
    json(body: unknown) { this.body = body; return this; },
  };
  return res;
}

// ---- setup / teardown -------------------------------------------------------

let testKeyRaw: string;
let testKeyId: string;
let revokedKeyRaw: string;
let revokedKeyId: string;

before(async () => {
  // Create a normal active key with read:reports scope
  const generated = await generateApiKey();
  testKeyRaw = generated.raw;

  const key = await prisma.apiKey.create({
    data: {
      name: 'test-key-active',
      keyHash: generated.hash,
      prefix: generated.prefix,
      scopes: ['read:reports'],
      createdBy: ADMIN_USER_ID,
    },
  });
  testKeyId = key.id;
  createdKeyIds.push(testKeyId);

  // Create a revoked key
  const gen2 = await generateApiKey();
  revokedKeyRaw = gen2.raw;

  const revoked = await prisma.apiKey.create({
    data: {
      name: 'test-key-revoked',
      keyHash: gen2.hash,
      prefix: gen2.prefix,
      scopes: ['read:reports'],
      createdBy: ADMIN_USER_ID,
      revokedAt: new Date(),
    },
  });
  revokedKeyId = revoked.id;
  createdKeyIds.push(revokedKeyId);
});

after(async () => {
  // Clean up test rows
  await prisma.apiKey.deleteMany({ where: { id: { in: createdKeyIds } } });
  await prisma.$disconnect();
});

// ---- pure helper tests ------------------------------------------------------

describe('api-key-helpers (pure)', () => {
  it('generateApiKey returns raw with smk_ prefix and 32 hex suffix', async () => {
    const { raw, prefix, hash } = await generateApiKey();
    assert.match(raw, /^smk_[0-9a-f]{32}$/);
    assert.strictEqual(prefix, raw.slice(0, 8));
    assert.ok(hash.startsWith('$2'));
  });

  it('extractPrefix returns first 8 chars', () => {
    const raw = 'smk_abcdef1234567890abcdef1234567890';
    assert.strictEqual(extractPrefix(raw), 'smk_abcd');
  });

  it('isValidKeyFormat accepts valid keys', () => {
    assert.ok(isValidKeyFormat('smk_' + 'a'.repeat(32)));
    assert.ok(isValidKeyFormat('smk_' + '0123456789abcdef'.repeat(2)));
  });

  it('isValidKeyFormat rejects bad keys', () => {
    assert.ok(!isValidKeyFormat(''));
    assert.ok(!isValidKeyFormat('smk_SHORT'));
    assert.ok(!isValidKeyFormat('bad_prefix' + '0'.repeat(32)));
    assert.ok(!isValidKeyFormat('smk_' + 'g'.repeat(32))); // 'g' is not hex
    assert.ok(!isValidKeyFormat('smk_' + '0'.repeat(33))); // too long
  });

  it('compareKey returns true for matching raw/hash', async () => {
    const { raw, hash } = await generateApiKey();
    assert.ok(await compareKey(raw, hash));
  });

  it('compareKey returns false for wrong raw', async () => {
    const { hash } = await generateApiKey();
    const wrong = 'smk_' + '0'.repeat(32);
    assert.ok(!(await compareKey(wrong, hash)));
  });
});

// ---- middleware tests (DB-backed) -------------------------------------------

describe('createApiKeyAuthMiddleware', () => {
  const apiKeyAuth = createApiKeyAuthMiddleware(prisma);

  it('passes through when X-API-Key header is absent', (_, done) => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    const next: NextFunction = () => {
      assert.strictEqual(req.user, undefined);
      done();
    };
    apiKeyAuth(req as Request, res as unknown as Response, next);
  });

  it('rejects invalid format with 401', async () => {
    const req = mockReq({ headers: { 'x-api-key': 'bad-format' } });
    const res = mockRes();
    const next: NextFunction = () => { assert.fail('next should not be called'); };
    await Promise.resolve(apiKeyAuth(req as Request, res as unknown as Response, next));
    assert.strictEqual(res.statusCode, 401);
    assert.deepStrictEqual(res.body, { error: 'Invalid API key format' });
  });

  it('rejects unknown prefix with 401', async () => {
    const unknownKey = 'smk_' + '9'.repeat(32); // prefix smk_9999 won't exist
    const req = mockReq({ headers: { 'x-api-key': unknownKey } });
    const res = mockRes();
    const next: NextFunction = () => { assert.fail('next should not be called'); };
    await Promise.resolve(apiKeyAuth(req as Request, res as unknown as Response, next));
    assert.strictEqual(res.statusCode, 401);
  });

  it('rejects revoked key with 401', async () => {
    const req = mockReq({ headers: { 'x-api-key': revokedKeyRaw } });
    const res = mockRes();
    const next: NextFunction = () => { assert.fail('next should not be called'); };
    await Promise.resolve(apiKeyAuth(req as Request, res as unknown as Response, next));
    assert.strictEqual(res.statusCode, 401);
  });

  it('sets req.user and calls next for a valid key', (_, done) => {
    const req = mockReq({ headers: { 'x-api-key': testKeyRaw } });
    const res = mockRes();
    const next: NextFunction = () => {
      assert.ok(req.user);
      assert.strictEqual(req.user!.type, 'api-key');
      if (req.user!.type === 'api-key') {
        assert.strictEqual(req.user!.apiKeyId, testKeyId);
        assert.deepStrictEqual(req.user!.scopes, ['read:reports']);
        assert.strictEqual(req.user!.isAdmin, false);
      }
      done();
    };
    apiKeyAuth(req as Request, res as unknown as Response, next);
  });

  it('updates lastUsedAt asynchronously after valid auth', async () => {
    const before = await prisma.apiKey.findUnique({ where: { id: testKeyId }, select: { lastUsedAt: true } });

    const req = mockReq({ headers: { 'x-api-key': testKeyRaw } });
    const res = mockRes();
    await new Promise<void>((resolve) => {
      const next: NextFunction = () => resolve();
      apiKeyAuth(req as Request, res as unknown as Response, next);
    });

    // Wait for setImmediate + DB round-trip
    await new Promise((r) => setTimeout(r, 200));

    const after = await prisma.apiKey.findUnique({ where: { id: testKeyId }, select: { lastUsedAt: true } });
    assert.ok(after?.lastUsedAt);
    if (before?.lastUsedAt) {
      assert.ok(after!.lastUsedAt! >= before.lastUsedAt);
    }
  });
});

// ---- requireAuth tests ------------------------------------------------------

describe('requireAuth', () => {
  it('returns 401 when req.user is undefined', () => {
    const req = mockReq();
    const res = mockRes();
    const next: NextFunction = () => { assert.fail('should not call next'); };
    requireAuth()(req as Request, res as unknown as Response, next);
    assert.strictEqual(res.statusCode, 401);
  });

  it('allows api-key user with matching scope', (_, done) => {
    const req = mockReq();
    req.user = { type: 'api-key', apiKeyId: 'x', scopes: ['read:reports'], isAdmin: false };
    const res = mockRes();
    requireAuth(['read:reports'])(req as Request, res as unknown as Response, () => { done(); });
  });

  it('rejects api-key user missing required scope with 403', () => {
    const req = mockReq();
    req.user = { type: 'api-key', apiKeyId: 'x', scopes: ['read:reports'], isAdmin: false };
    const res = mockRes();
    const next: NextFunction = () => { assert.fail('should not call next'); };
    requireAuth(['read:crm'])(req as Request, res as unknown as Response, next);
    assert.strictEqual(res.statusCode, 403);
    assert.deepStrictEqual(res.body, { error: 'Insufficient scope' });
  });

  it('allows api-key user when no scopes required', (_, done) => {
    const req = mockReq();
    req.user = { type: 'api-key', apiKeyId: 'x', scopes: ['read:reports'], isAdmin: false };
    const res = mockRes();
    requireAuth()(req as Request, res as unknown as Response, () => { done(); });
  });

  it('allows JWT user regardless of scopes (backwards compat)', (_, done) => {
    const req = mockReq();
    req.user = { type: 'jwt', userId: 'u1', role: 'Member', isAdmin: false };
    const res = mockRes();
    requireAuth(['read:crm', 'read:reports'])(req as Request, res as unknown as Response, () => { done(); });
  });

  it('allows legacy JWT user without type field (backwards compat)', (_, done) => {
    const req = mockReq();
    // Simulate pre-Phase01 JWT user with no type field
    req.user = { userId: 'u1', role: 'Admin', isAdmin: true } as typeof req.user;
    const res = mockRes();
    requireAuth(['read:crm'])(req as Request, res as unknown as Response, () => { done(); });
  });
});
