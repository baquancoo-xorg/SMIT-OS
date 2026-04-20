import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema, updateLeadSchema } from '../schemas/lead.schema';

export function createLeadRoutes(prisma: PrismaClient) {
  const router = Router();

  // Static routes MUST come before /:id
  router.get('/ae-list', handleAsync(async (_req: any, res: any) => {
    const users = await prisma.user.findMany({
      where: { departments: { has: 'Sale' } },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    });
    res.json(users);
  }));

  router.get('/daily-stats', handleAsync(async (req: any, res: any) => {
    const { ae, dateFrom, dateTo } = req.query;

    const where: any = {};
    if (ae) where.ae = ae as string;

    const fromDate = dateFrom ? new Date(dateFrom as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const toDate = dateTo ? new Date(dateTo as string) : new Date();
    toDate.setHours(23, 59, 59, 999);

    // Fetch all leads in range (by receivedDate or resolvedDate)
    const leads = await prisma.lead.findMany({
      where: {
        ...where,
        OR: [
          { receivedDate: { gte: fromDate, lte: toDate } },
          { resolvedDate: { gte: fromDate, lte: toDate } },
        ],
      },
    });

    // Collect all AEs and all dates in range
    const aeSet = new Set<string>(leads.map((l) => l.ae));
    if (ae) { aeSet.clear(); aeSet.add(ae as string); }

    // Build date list (YYYY-MM-DD)
    const dateList: string[] = [];
    const cur = new Date(fromDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setHours(0, 0, 0, 0);
    while (cur <= end) {
      dateList.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }

    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    type StatRow = {
      date: string;
      ae: string;
      added: number;
      processed: number;
      remaining: number;
      dailyRate: number | null;
      totalRate: number | null;
    };

    const results: StatRow[] = [];

    for (const aeName of aeSet) {
      let prevRemaining = 0;
      for (const dateStr of dateList) {
        const added = leads.filter(
          (l) => l.ae === aeName && toDateStr(l.receivedDate) === dateStr
        ).length;
        const processed = leads.filter(
          (l) =>
            l.ae === aeName &&
            l.resolvedDate &&
            toDateStr(l.resolvedDate) === dateStr &&
            (l.status === 'Qualified' || l.status === 'Unqualified')
        ).length;
        const remaining = prevRemaining + added - processed;
        const dailyRate = added > 0 ? processed / added : null;
        const totalRate = added + prevRemaining > 0 ? processed / (added + prevRemaining) : null;
        results.push({ date: dateStr, ae: aeName, added, processed, remaining, dailyRate, totalRate });
        prevRemaining = remaining;
      }
    }

    // Return sorted by date desc
    results.sort((a, b) => b.date.localeCompare(a.date) || a.ae.localeCompare(b.ae));
    res.json(results);
  }));

  router.get('/', handleAsync(async (req: any, res: any) => {
    const { ae, status, dateFrom, dateTo } = req.query;
    const where: any = {};
    if (ae) where.ae = ae as string;
    if (status) where.status = status as string;
    if (dateFrom || dateTo) {
      where.receivedDate = {};
      if (dateFrom) where.receivedDate.gte = new Date(dateFrom as string);
      if (dateTo) {
        const to = new Date(dateTo as string);
        to.setHours(23, 59, 59, 999);
        where.receivedDate.lte = to;
      }
    }
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { receivedDate: 'desc' },
    });
    res.json(leads);
  }));

  router.post('/', validate(createLeadSchema), handleAsync(async (req: any, res: any) => {
    const { receivedDate, resolvedDate, ...rest } = req.body;
    const lead = await prisma.lead.create({
      data: {
        ...rest,
        receivedDate: new Date(receivedDate),
        resolvedDate: resolvedDate ? new Date(resolvedDate) : null,
      },
    });
    res.status(201).json(lead);
  }));

  router.put('/:id', validate(updateLeadSchema), handleAsync(async (req: any, res: any) => {
    const { id } = req.params;
    const { receivedDate, resolvedDate, ...rest } = req.body;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...rest,
        ...(receivedDate && { receivedDate: new Date(receivedDate) }),
        ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
      },
    });
    res.json(lead);
  }));

  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
