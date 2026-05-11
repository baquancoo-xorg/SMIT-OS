/**
 * Admin endpoints for API key lifecycle management.
 * POST /   — generate new key (returns rawKey ONCE)
 * GET  /   — list all keys (no keyHash, no rawKey)
 * DELETE /:id — soft-revoke key (sets revokedAt)
 *
 * Mount behind requireAdmin middleware in server.ts.
 */

import { Router } from 'express';
import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { generateApiKey } from '../lib/api-key-helpers';
import { API_KEY_SCOPES } from '../lib/api-key-scopes';

const scopeEnum = z.enum(API_KEY_SCOPES as unknown as [string, ...string[]]);

const createKeySchema = z.object({
  name: z.string().min(1).max(50),
  scopes: z.array(scopeEnum).min(1),
});

export function createAdminApiKeysRoutes(prisma: PrismaClient) {
  const router = Router();

  // POST / — generate new API key
  router.post('/', async (req, res) => {
    const parsed = createKeySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }

    const { name, scopes } = parsed.data;

    // req.user is JWT admin (guaranteed by requireAdmin upstream)
    const createdBy = req.user?.type === 'jwt' || !req.user?.type
      ? (req.user as { userId: string }).userId
      : null;

    if (!createdBy) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    try {
      const { raw, prefix, hash } = await generateApiKey();

      const key = await prisma.apiKey.create({
        data: {
          name,
          keyHash: hash,
          prefix,
          scopes,
          createdBy,
        },
        select: {
          id: true,
          prefix: true,
          name: true,
          scopes: true,
          createdBy: true,
          createdAt: true,
        },
      });

      // rawKey returned ONCE — never stored, never logged
      return res.status(201).json({ success: true, data: { ...key, rawKey: raw } });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // GET / — list all keys (explicit select — no keyHash, no rawKey)
  router.get('/', async (_req, res) => {
    try {
      const keys = await prisma.apiKey.findMany({
        select: {
          id: true,
          prefix: true,
          name: true,
          scopes: true,
          createdAt: true,
          lastUsedAt: true,
          revokedAt: true,
          creator: {
            select: { fullName: true },
          },
        },
        orderBy: [
          { revokedAt: { sort: 'asc', nulls: 'first' } },
          { createdAt: 'desc' },
        ],
      });

      const result = keys.map((k) => ({
        id: k.id,
        prefix: k.prefix,
        name: k.name,
        scopes: k.scopes,
        createdBy: k.creator.fullName,
        createdAt: k.createdAt,
        lastUsedAt: k.lastUsedAt,
        revokedAt: k.revokedAt,
      }));

      return res.json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  // DELETE /:id — soft revoke
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const existing = await prisma.apiKey.findUnique({ where: { id }, select: { id: true, revokedAt: true } });
      if (!existing) {
        return res.status(404).json({ success: false, error: 'API key not found' });
      }
      if (existing.revokedAt) {
        return res.status(409).json({ success: false, error: 'API key already revoked' });
      }

      await prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
      return res.status(204).send();
    } catch (err) {
      return res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  return router;
}
