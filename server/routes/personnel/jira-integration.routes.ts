/**
 * Zone C — Jira task widget. Live proxy with 5min cache.
 * Falls back to "unconfigured" state when missing credentials or jiraAccountId.
 */

import { Router } from 'express';
import type { PrismaClient } from '@prisma/client';
import { handleAsync } from '../../utils/async-handler';
import { createPersonnelAccess, adminOnly } from '../../middleware/personnel-access';
import { fetchJiraTasksForAccount, findJiraAccountByEmail, isJiraConfigured } from '../../lib/jira-client';
import { cached, cacheKey, invalidatePrefix } from '../../lib/external-cache';

const TTL_MS = 5 * 60 * 1000;

interface UserPick { id: string; jiraAccountId: string | null; }

async function userFromPersonnel(prisma: PrismaClient, personnelId: string): Promise<UserPick | null> {
  const p = await prisma.personnel.findUnique({
    where: { id: personnelId },
    select: { user: { select: { id: true, jiraAccountId: true } } },
  });
  return p?.user ?? null;
}

export function createJiraIntegrationRoutes(prisma: PrismaClient) {
  const router = Router({ mergeParams: true });
  const personnelAccess = createPersonnelAccess(prisma);

  // Per-personnel task widget
  router.get('/', personnelAccess, handleAsync(async (req: any, res: any) => {
    const user = await userFromPersonnel(prisma, req.params.id);
    if (!user) return res.status(404).json({ error: 'Personnel not found' });

    if (!isJiraConfigured()) {
      return res.json({ configured: false, accountMapped: false, summary: null });
    }
    if (!user.jiraAccountId) {
      return res.json({ configured: true, accountMapped: false, summary: null });
    }

    const refresh = req.query.refresh === '1';
    const key = cacheKey('jira', user.id);
    if (refresh) invalidatePrefix(key);

    try {
      const summary = await cached(key, TTL_MS, () => fetchJiraTasksForAccount(user.jiraAccountId!));
      return res.json({ configured: true, accountMapped: true, summary });
    } catch (e: any) {
      return res.status(502).json({ configured: true, accountMapped: true, summary: null, error: e.message });
    }
  }));

  // Admin one-shot resolver — fill jiraAccountId by email lookup for users without one.
  // Note: emails are not currently stored on User. Caller supplies a CSV map { username: email } body.
  router.post('/admin/resolve', adminOnly, handleAsync(async (req: any, res: any) => {
    if (!isJiraConfigured()) {
      return res.status(400).json({ error: 'Jira credentials missing in env' });
    }
    const map = (req.body?.usernameToEmail ?? {}) as Record<string, string>;
    const usernames = Object.keys(map);
    if (usernames.length === 0) {
      return res.status(400).json({ error: 'usernameToEmail map required' });
    }
    const users = await prisma.user.findMany({
      where: { username: { in: usernames }, jiraAccountId: null },
      select: { id: true, username: true },
    });
    let updated = 0;
    const skipped: string[] = [];
    for (const u of users) {
      const email = map[u.username];
      if (!email) { skipped.push(u.username); continue; }
      const accountId = await findJiraAccountByEmail(email);
      if (!accountId) { skipped.push(u.username); continue; }
      await prisma.user.update({ where: { id: u.id }, data: { jiraAccountId: accountId } });
      updated++;
    }
    res.json({ updated, skipped });
  }));

  return router;
}
