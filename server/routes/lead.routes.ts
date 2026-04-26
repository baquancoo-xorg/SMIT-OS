import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { handleAsync } from '../utils/async-handler';
import { validate } from '../middleware/validate.middleware';
import { createLeadSchema, updateLeadSchema } from '../schemas/lead.schema';
import { RBAC } from '../middleware/rbac.middleware';

const TRACKED_FIELDS = ['status', 'ae', 'leadType', 'unqualifiedType', 'notes', 'resolvedDate', 'receivedDate'] as const;
const CRM_LOCKED_FIELDS = ['customerName', 'ae', 'receivedDate', 'resolvedDate', 'status'] as const;

// Check if user can write leads (Sale dept member or Admin)
function canWriteLead(user: any): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === 'Admin') return true;
  if (user.departments?.includes('Sale')) return true;
  return false;
}

function canDelete(user: any): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === 'Admin') return true;
  if (user.role === 'Leader' && user.departments?.includes('Sale')) return true;
  return false;
}

function normalizeVal(field: string, val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (field === 'resolvedDate' || field === 'receivedDate') {
    return val instanceof Date ? val.toISOString().slice(0, 10) : String(val).slice(0, 10);
  }
  return String(val);
}

function stripCrmLockedFields(payload: Record<string, unknown>) {
  const next = { ...payload };
  for (const field of CRM_LOCKED_FIELDS) {
    delete next[field];
  }
  return next;
}

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

    // Build date list (YYYY-MM-DD) u2014 use UTC noon to avoid timezone offset shifting the date
    const fromStr = (dateFrom as string) ?? new Date(fromDate).toISOString().slice(0, 10);
    const toStr = (dateTo as string) ?? new Date(toDate).toISOString().slice(0, 10);
    const dateList: string[] = [];
    let cur = fromStr;
    while (cur <= toStr) {
      dateList.push(cur);
      const next = new Date(cur + 'T12:00:00Z');
      next.setUTCDate(next.getUTCDate() + 1);
      cur = next.toISOString().slice(0, 10);
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

  // Audit log for a lead - requires Sale dept or Admin (contains PII)
  router.get('/:id/audit', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    if (!canWriteLead(req.user)) {
      return res.status(403).json({ error: 'Sale department or Admin required' });
    }
    const logs = await prisma.leadAuditLog.findMany({
      where: { leadId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  }));

  router.post('/:id/delete-request', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    // Only the AE of this lead, or Leader/Admin can request deletion
    const user = req.user!;
    const isAeOfLead = existing.ae === user.fullName || existing.ae === user.username;
    const isLeaderOrAdmin = user.isAdmin || user.role?.includes('Leader');
    if (!isAeOfLead && !isLeaderOrAdmin) {
      return res.status(403).json({ error: 'Only the AE of this lead or Leader/Admin can request deletion' });
    }
    if (existing.deleteRequestedBy) {
      return res.status(409).json({ error: 'Delete request already pending' });
    }
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        deleteRequestedBy: user.userId,
        deleteRequestedAt: new Date(),
        deleteReason: req.body.reason || 'No reason provided',
      },
    });
    res.json(lead);
  }));

  router.delete('/:id/delete-request', RBAC.authenticated, handleAsync(async (req: any, res: any) => {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.deleteRequestedBy !== req.user!.userId) {
      return res.status(403).json({ error: 'Not your request' });
    }
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { deleteRequestedBy: null, deleteRequestedAt: null, deleteReason: null },
    });
    res.json(lead);
  }));

  router.post('/:id/delete-request/approve', handleAsync(async (req: any, res: any) => {
    if (!canDelete(req.user)) return res.status(403).json({ error: 'Insufficient permissions' });
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  router.post('/:id/delete-request/reject', handleAsync(async (req: any, res: any) => {
    if (!canDelete(req.user)) return res.status(403).json({ error: 'Insufficient permissions' });
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { deleteRequestedBy: null, deleteRequestedAt: null, deleteReason: null },
    });
    res.json(lead);
  }));

  router.get('/', handleAsync(async (req: any, res: any) => {
    const { ae, status, dateFrom, dateTo, hasNote, noteDate } = req.query;
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

    if (hasNote === 'yes') {
      where.NOT = [{ notes: null }, { notes: '' }];
    } else if (hasNote === 'no') {
      where.OR = [
        { notes: null },
        { notes: '' },
      ];
    }

    if (noteDate) {
      const start = new Date(`${String(noteDate)}T00:00:00`);
      const end = new Date(`${String(noteDate)}T23:59:59.999`);
      where.updatedAt = { gte: start, lte: end };
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { receivedDate: 'desc' },
    });
    res.json(leads);
  }));

  router.post('/', RBAC.authenticated, validate(createLeadSchema), handleAsync(async (req: any, res: any) => {
    if (!canWriteLead(req.user)) {
      return res.status(403).json({ error: 'Sale department or Admin required' });
    }
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

  router.put('/:id', RBAC.authenticated, validate(updateLeadSchema), handleAsync(async (req: any, res: any) => {
    if (!canWriteLead(req.user)) {
      return res.status(403).json({ error: 'Sale department or Admin required' });
    }
    const { id } = req.params;
    const { receivedDate, resolvedDate, ...rest } = req.body;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const safeRest = existing.syncedFromCrm ? stripCrmLockedFields(rest) : rest;

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...safeRest,
        ...(existing.syncedFromCrm
          ? {}
          : {
              ...(receivedDate && { receivedDate: new Date(receivedDate) }),
              ...(resolvedDate !== undefined && { resolvedDate: resolvedDate ? new Date(resolvedDate) : null }),
            }),
      },
    });

    // Diff tracked fields and write audit log if anything changed
    const changes: Record<string, { from: string | null; to: string | null }> = {};
    for (const field of TRACKED_FIELDS) {
      const from = normalizeVal(field, (existing as any)[field]);
      const to = normalizeVal(field, (lead as any)[field]);
      if (from !== to) changes[field] = { from, to };
    }
    if (Object.keys(changes).length > 0) {
      await prisma.leadAuditLog.create({
        data: { leadId: id, changes, actorUserId: req.user!.userId }
      });
    }

    res.json(lead);
  }));

  router.delete('/:id', handleAsync(async (req: any, res: any) => {
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (!canDelete(req.user)) return res.status(403).json({ error: 'Insufficient permissions' });
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }));

  return router;
}
