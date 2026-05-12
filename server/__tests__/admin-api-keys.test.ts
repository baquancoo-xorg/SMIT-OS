/**
 * Admin API keys integration tests — real PG (Docker port 5435), no mocks.
 * Covers: POST/GET/DELETE lifecycle, auth gates, Zod validation, rawKey exposure.
 *
 * Run: npm test -- admin-api-keys
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import express from 'express';
import cookieParser from 'cookie-parser';
import type { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import { authService } from '../services/auth.service';
import { createAdminApiKeysRoutes } from '../routes/admin-api-keys.routes';
import { createApiKeyAuditService } from '../services/api-key-audit.service';
import { createApiKeyAuthMiddleware } from '../middleware/api-key-auth';
import { generateApiKey } from '../lib/api-key-helpers';

// Suppress pino pretty-print noise in tests
process.env.LOG_LEVEL = 'silent';

// ---- setup ------------------------------------------------------------------

const prisma = new PrismaClient();

// Seeded admin user (matches db:setup)
const ADMIN_USER_ID = 'bcf275bb-9eb2-4968-9ccc-ebdbc3bbd75e';
const MEMBER_USER_ID = 'member-test-user-phase02'; // created in before()

const createdKeyIds: string[] = [];
let adminToken: string;
let memberToken: string;
let server: Server;
let baseUrl: string;

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user?.isAdmin) return res.status(403).json({ success: false, error: 'Admin required' });
  next();
}

before(async () => {
  // Ensure member user exists (may already exist from previous runs)
  await prisma.user.upsert({
    where: { id: MEMBER_USER_ID },
    update: {},
    create: {
      id: MEMBER_USER_ID,
      fullName: 'Phase02 Member',
      username: 'phase02-member',
      password: 'irrelevant',
      departments: [],
      role: 'Member',
      avatar: '',
      isAdmin: false,
    },
  });

  adminToken = authService.signToken({ userId: ADMIN_USER_ID, role: 'Admin', isAdmin: true });
  memberToken = authService.signToken({ userId: MEMBER_USER_ID, role: 'Member', isAdmin: false });

  const auditService = createApiKeyAuditService(prisma);

  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Auth middleware: parse Authorization header for test (ESM — no require)
  app.use((req, _res, next) => {
    const auth = req.headers['authorization'];
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = authService.verifyToken(token);
      if (payload) req.user = { type: 'jwt', ...payload };
    }
    next();
  });

  // API key auth for audit log test
  app.use('/api', createApiKeyAuthMiddleware(prisma, auditService));

  app.use('/api/admin/api-keys', requireAdmin, createAdminApiKeysRoutes(prisma));

  // Dummy route to trigger api-key auth + audit
  app.get('/api/ping', (_req, res) => res.json({ ok: true }));

  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });

  const addr = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${addr.port}`;
});

after(async () => {
  if (createdKeyIds.length > 0) {
    // Delete audit logs first (FK constraint)
    await prisma.apiKeyAuditLog.deleteMany({ where: { apiKeyId: { in: createdKeyIds } } });
    await prisma.apiKey.deleteMany({ where: { id: { in: createdKeyIds } } });
  }
  await prisma.user.deleteMany({ where: { id: MEMBER_USER_ID } });
  await prisma.$disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

// ---- helpers ----------------------------------------------------------------

async function apiPost(path: string, body: unknown, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function apiGet(path: string, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

async function apiDelete(path: string, token?: string) {
  return fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ---- tests ------------------------------------------------------------------

describe('POST /api/admin/api-keys', () => {
  it('creates key and returns rawKey with smk_ prefix', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'test-key', scopes: ['read:reports'] }, adminToken);
    assert.strictEqual(res.status, 201);
    const body = await res.json() as { success: boolean; data: Record<string, unknown> };
    assert.ok(body.success);
    assert.ok(typeof body.data.rawKey === 'string');
    assert.match(body.data.rawKey as string, /^smk_[0-9a-f]{32}$/);
    assert.ok(typeof body.data.id === 'string');
    assert.strictEqual(body.data.name, 'test-key');
    assert.deepStrictEqual(body.data.scopes, ['read:reports']);
    // Track for cleanup
    createdKeyIds.push(body.data.id as string);
  });

  it('returns 403 for non-admin user', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'x', scopes: ['read:reports'] }, memberToken);
    assert.strictEqual(res.status, 403);
  });

  it('returns 403 when unauthenticated', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'x', scopes: ['read:reports'] });
    assert.strictEqual(res.status, 403);
  });

  it('returns 400 for invalid scope name', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'bad', scopes: ['read:revenue'] }, adminToken);
    assert.strictEqual(res.status, 400);
  });

  it('returns 400 for empty scopes array', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'bad', scopes: [] }, adminToken);
    assert.strictEqual(res.status, 400);
  });

  it('returns 400 when name exceeds 50 chars', async () => {
    const res = await apiPost('/api/admin/api-keys', { name: 'a'.repeat(51), scopes: ['read:reports'] }, adminToken);
    assert.strictEqual(res.status, 400);
  });

  it('accepts all 5 valid scopes', async () => {
    const scopes = ['read:reports', 'read:crm', 'read:ads', 'read:okr', 'read:dashboard'];
    const res = await apiPost('/api/admin/api-keys', { name: 'all-scopes', scopes }, adminToken);
    assert.strictEqual(res.status, 201);
    const body = await res.json() as { success: boolean; data: Record<string, unknown> };
    createdKeyIds.push(body.data.id as string);
  });
});

describe('GET /api/admin/api-keys', () => {
  it('lists keys without keyHash and without rawKey', async () => {
    const res = await apiGet('/api/admin/api-keys', adminToken);
    assert.strictEqual(res.status, 200);
    const body = await res.json() as { success: boolean; data: Record<string, unknown>[] };
    assert.ok(body.success);
    assert.ok(Array.isArray(body.data));
    for (const key of body.data) {
      assert.ok(!('keyHash' in key), 'keyHash must not be in response');
      assert.ok(!('rawKey' in key), 'rawKey must not be in response');
      assert.ok('prefix' in key);
      assert.ok('name' in key);
      assert.ok('scopes' in key);
      assert.ok('createdBy' in key);
    }
  });

  it('returns 403 for non-admin', async () => {
    const res = await apiGet('/api/admin/api-keys', memberToken);
    assert.strictEqual(res.status, 403);
  });
});

describe('DELETE /api/admin/api-keys/:id', () => {
  let keyId: string;

  before(async () => {
    // Create a key to revoke
    const res = await apiPost('/api/admin/api-keys', { name: 'to-revoke', scopes: ['read:crm'] }, adminToken);
    const body = await res.json() as { data: { id: string } };
    keyId = body.data.id;
    createdKeyIds.push(keyId);
  });

  it('soft-revokes key with 204', async () => {
    const res = await apiDelete(`/api/admin/api-keys/${keyId}`, adminToken);
    assert.strictEqual(res.status, 204);
  });

  it('GET list shows revokedAt for revoked key', async () => {
    const res = await apiGet('/api/admin/api-keys', adminToken);
    const body = await res.json() as { data: Array<{ id: string; revokedAt: string | null }> };
    const found = body.data.find((k) => k.id === keyId);
    assert.ok(found, 'revoked key should appear in list');
    assert.ok(found!.revokedAt !== null, 'revokedAt should be set');
  });

  it('returns 409 when revoking already-revoked key', async () => {
    const res = await apiDelete(`/api/admin/api-keys/${keyId}`, adminToken);
    assert.strictEqual(res.status, 409);
  });

  it('returns 404 for unknown id', async () => {
    const res = await apiDelete('/api/admin/api-keys/00000000-0000-0000-0000-000000000000', adminToken);
    assert.strictEqual(res.status, 404);
  });

  it('returns 403 for non-admin', async () => {
    const res = await apiDelete(`/api/admin/api-keys/${keyId}`, memberToken);
    assert.strictEqual(res.status, 403);
  });
});

describe('audit log', () => {
  it('creates ApiKeyAuditLog entry on authenticated request', async () => {
    // Generate a fresh key
    const generated = await generateApiKey();
    const key = await prisma.apiKey.create({
      data: {
        name: 'audit-test-key',
        keyHash: generated.hash,
        prefix: generated.prefix,
        scopes: ['read:reports'],
        createdBy: ADMIN_USER_ID,
      },
    });
    createdKeyIds.push(key.id);

    const countBefore = await prisma.apiKeyAuditLog.count({ where: { apiKeyId: key.id } });

    // Hit /api/ping which passes through api-key-auth middleware
    await fetch(`${baseUrl}/api/ping`, {
      headers: { 'x-api-key': generated.raw },
    });

    // Wait for setImmediate + DB write
    await new Promise((r) => setTimeout(r, 300));

    const countAfter = await prisma.apiKeyAuditLog.count({ where: { apiKeyId: key.id } });
    assert.strictEqual(countAfter, countBefore + 1, 'audit log entry should be created');
  });
});
