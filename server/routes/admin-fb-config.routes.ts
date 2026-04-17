import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/crypto';
import { syncFbAdAccount } from '../services/facebook/fb-sync.service';
import {
  createFbAccountSchema,
  updateFbAccountSchema,
  syncFbAccountSchema,
  updateExchangeRateSchema,
} from '../schemas/admin-fb-config.schema';

const prisma = new PrismaClient();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
}

export function createAdminFbConfigRoutes() {
  const router = Router();
  router.use(requireAdmin);

  router.get('/fb-accounts', async (_req, res) => {
    try {
      const accounts = await prisma.fbAdAccountConfig.findMany({
        select: {
          id: true, accountId: true, accountName: true, currency: true,
          isActive: true, lastSyncAt: true, lastSyncStatus: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: accounts });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/fb-accounts', async (req, res) => {
    try {
      const parsed = createFbAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.message });
      }

      const { accountId, accountName, accessToken, currency } = parsed.data;
      const encryptedToken = encrypt(accessToken);

      const account = await prisma.fbAdAccountConfig.create({
        data: { accountId, accountName, accessTokenEncrypted: encryptedToken, currency, isActive: true },
        select: { id: true, accountId: true, accountName: true, currency: true },
      });

      res.status(201).json({ success: true, data: account });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.put('/fb-accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = updateFbAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.message });
      }

      const data: Record<string, unknown> = { ...parsed.data };
      if (data.accessToken) {
        data.accessTokenEncrypted = encrypt(data.accessToken as string);
        delete data.accessToken;
      }

      const account = await prisma.fbAdAccountConfig.update({
        where: { id },
        data,
        select: { id: true, accountId: true, accountName: true, currency: true, isActive: true },
      });

      res.json({ success: true, data: account });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.delete('/fb-accounts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await prisma.fbAdAccountConfig.delete({ where: { id } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.post('/fb-accounts/:id/sync', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parsed = syncFbAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.message });
      }

      const account = await prisma.fbAdAccountConfig.findUnique({ where: { id } });
      if (!account) {
        return res.status(404).json({ success: false, error: 'Account not found' });
      }

      res.status(202).json({ success: true, message: 'Sync started' });

      syncFbAdAccount(account.accountId, parsed.data.dateStart, parsed.data.dateEnd)
        .then((r) => console.log(`[fb-sync] ${account.accountId}:`, r))
        .catch((e) => console.error(`[fb-sync] ${account.accountId} error:`, e));
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.get('/exchange-rates', async (_req, res) => {
    try {
      const rate = await prisma.exchangeRateSetting.findFirst({
        where: { isDefault: true, accountId: null },
      });
      res.json({ success: true, data: rate ?? { exchangeRate: 27000 } });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  router.put('/exchange-rates', async (req, res) => {
    try {
      const parsed = updateExchangeRateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: parsed.error.message });
      }

      const rate = await prisma.exchangeRateSetting.upsert({
        where: { id: 1 },
        update: { exchangeRate: parsed.data.exchangeRate },
        create: { currencyFrom: 'USD', currencyTo: 'VND', exchangeRate: parsed.data.exchangeRate, isDefault: true },
      });

      res.json({ success: true, data: rate });
    } catch (err) {
      res.status(500).json({ success: false, error: (err as Error).message });
    }
  });

  return router;
}
