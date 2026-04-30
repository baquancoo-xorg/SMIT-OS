import { Prisma, type Lead } from '@prisma/client';
import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { BATCH_SIZE, CRM_OWNED_FIELDS, CUTOFF_2026_04_01, LEAD_SYNC_LOCK_KEY } from './constants';
import { withAdvisoryLock } from './advisory-lock';
import { loadStatusMap } from './status-mapper';
import { loadEmployeeMap } from './employee-mapper';
import { loadNotesMap } from './derive-notes';
import { loadResolvedDateMap } from './derive-resolved-date';
import { getLeadSyncPrisma } from './state';

type SyncMode = 'cron' | 'manual' | 'backfill';

type SyncOptions = {
  mode: SyncMode;
  from?: Date;
  to?: Date;
};

type SyncErrorItem = {
  crmSubscriberId: string;
  message: string;
};

type SyncSummary = {
  runId: string;
  status: string;
  subscribersScanned: number;
  leadsCreated: number;
  leadsUpdated: number;
  errors: SyncErrorItem[];
  startedAt: Date;
  finishedAt: Date | null;
};

type CrmSubscriberRow = {
  id: bigint;
  fullName: string | null;
  employee_id_modified: number | null;
  createdAt: Date;
  updatedAt: Date;
  status: string | null;
};

type LeadWritePayload = Pick<Lead, (typeof CRM_OWNED_FIELDS)[number]> & {
  crmSubscriberId: bigint;
  syncedFromCrm: boolean;
  lastSyncedAt: Date;
};

const FALLBACK_STATUS = 'Mới';

function normalizeDateOnly(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0, 0));
}

function mapLeadPayload(
  sub: CrmSubscriberRow,
  statusMap: Record<string, string>,
  employeeMap: Map<number, { id?: string; fullName: string }>,
  notes: string,
  resolvedDate: Date | null,
  now: Date,
  errors: SyncErrorItem[]
): LeadWritePayload {
  const crmStatus = sub.status ?? '';
  const mappedStatus = crmStatus ? (statusMap[crmStatus] ?? FALLBACK_STATUS) : FALLBACK_STATUS;

  if (crmStatus && !statusMap[crmStatus]) {
    errors.push({
      crmSubscriberId: String(sub.id),
      message: `Unknown CRM status: ${crmStatus}`,
    });
  }

  const mappedEmployee = sub.employee_id_modified !== null ? employeeMap.get(sub.employee_id_modified) : undefined;

  return {
    customerName: (sub.fullName ?? '').trim() || `CRM-${String(sub.id)}`,
    ae: mappedEmployee?.fullName ?? 'Unmapped',
    receivedDate: normalizeDateOnly(sub.createdAt),
    resolvedDate,
    status: mappedStatus,
    notes,
    crmSubscriberId: sub.id,
    syncedFromCrm: true,
    lastSyncedAt: now,
  };
}

function collectChanges(existing: Lead, incoming: LeadWritePayload) {
  const changes: Record<string, { from: string | null; to: string | null }> = {};

  for (const field of CRM_OWNED_FIELDS) {
    const oldValue = existing[field];
    const newValue = incoming[field];

    const from = oldValue instanceof Date ? oldValue.toISOString() : oldValue === null ? null : String(oldValue);
    const to = newValue instanceof Date ? newValue.toISOString() : newValue === null ? null : String(newValue);

    if (from !== to) {
      changes[field] = { from, to };
    }
  }

  return changes;
}

async function fetchSubscribersBatch(skip: number, take: number, from: Date, to: Date) {
  const crm = getCrmClient();
  if (!crm) {
    return [] as CrmSubscriberRow[];
  }

  return safeCrmQuery(
    () =>
      crm.crmSubscriber.findMany({
        where: {
          createdAt: { gte: CUTOFF_2026_04_01 },
          updatedAt: { gte: from, lte: to },
          PEERDB_IS_DELETED: false,
        },
        orderBy: { id: 'asc' },
        skip,
        take,
        select: {
          id: true,
          fullName: true,
          employee_id_modified: true,
          createdAt: true,
          updatedAt: true,
          status: true,
        },
      }),
    [] as CrmSubscriberRow[]
  );
}

export async function syncLeadsFromCrm(options: SyncOptions): Promise<SyncSummary | null> {
  const prisma = getLeadSyncPrisma();

  return withAdvisoryLock(LEAD_SYNC_LOCK_KEY, async () => {
    const now = new Date();
    const errors: SyncErrorItem[] = [];

    const run = await prisma.leadSyncRun.create({
      data: {
        startedAt: now,
        status: 'running',
        triggerType: options.mode,
        subscribersScanned: 0,
        leadsCreated: 0,
        leadsUpdated: 0,
      },
    });

    try {
      const statusMap = await loadStatusMap();
      const employeeMap = await loadEmployeeMap();

      const lastSuccessfulRun = !options.from
        ? await prisma.leadSyncRun.findFirst({
            where: { status: 'success' },
            orderBy: { startedAt: 'desc' },
          })
        : null;

      const from = options.from ?? lastSuccessfulRun?.startedAt ?? CUTOFF_2026_04_01;
      const to = options.to ?? now;

      let skip = 0;
      let scanned = 0;
      let created = 0;
      let updated = 0;

      while (true) {
        const batch = await fetchSubscribersBatch(skip, BATCH_SIZE, from, to);
        if (!batch || batch.length === 0) {
          break;
        }

        // Batch-fetch all existing leads for this batch to avoid N+1 query pattern
        const batchIds = batch.map((s) => s.id);
        const batchLeads = await prisma.lead.findMany({ where: { crmSubscriberId: { in: batchIds } } });
        const existingMap = new Map<bigint, (typeof batchLeads)[number]>(batchLeads.map((l) => [l.crmSubscriberId!, l]));

        const notesMap = await loadNotesMap(batch.map((s) => s.id));

        const statusBySubscriber = new Map<bigint, string>();
        for (const sub of batch) {
          const crmStatus = sub.status ?? '';
          const mappedStatus = crmStatus ? (statusMap[crmStatus] ?? FALLBACK_STATUS) : FALLBACK_STATUS;
          statusBySubscriber.set(sub.id, mappedStatus);
        }

        const quSubIds = batch
          .filter((s) => {
            const st = statusBySubscriber.get(s.id);
            return st === 'Qualified' || st === 'Unqualified';
          })
          .map((s) => s.id);
        const resolvedDateMap = await loadResolvedDateMap(quSubIds);

        for (const sub of batch) {
          try {
            const notes = notesMap.get(sub.id) ?? '';
            const resolvedDate = resolvedDateMap.get(sub.id) ?? null;
            const payload = mapLeadPayload(
              sub,
              statusMap,
              employeeMap,
              notes,
              resolvedDate,
              now,
              errors
            );

            const existing = existingMap.get(sub.id) ?? null;
            if (existing?.deleteRequestedAt) {
              continue;
            }

            if (!existing) {
              const createdLead = await prisma.lead.create({
                data: {
                  customerName: payload.customerName,
                  ae: payload.ae,
                  receivedDate: payload.receivedDate,
                  resolvedDate: payload.resolvedDate,
                  status: payload.status,
                  notes: payload.notes,
                  crmSubscriberId: payload.crmSubscriberId,
                  syncedFromCrm: true,
                  lastSyncedAt: payload.lastSyncedAt,
                },
              });

              await prisma.leadAuditLog.create({
                data: {
                  leadId: createdLead.id,
                  actorUserId: 'system-sync',
                  changes: {
                    source: { from: null, to: 'crm-sync-create' },
                  },
                },
              });

              created += 1;
              continue;
            }

            const changes = collectChanges(existing, payload);
            const hasChanges = Object.keys(changes).length > 0;

            await prisma.lead.update({
              where: { id: existing.id },
              data: {
                customerName: payload.customerName,
                ae: payload.ae,
                receivedDate: payload.receivedDate,
                resolvedDate: payload.resolvedDate,
                status: payload.status,
                notes: payload.notes,
                syncedFromCrm: true,
                lastSyncedAt: payload.lastSyncedAt,
              },
            });

            if (hasChanges) {
              await prisma.leadAuditLog.create({
                data: {
                  leadId: existing.id,
                  actorUserId: 'system-sync',
                  changes,
                },
              });
              updated += 1;
            }
          } catch (error) {
            errors.push({
              crmSubscriberId: String(sub.id),
              message: error instanceof Error ? error.message : 'Unknown sync error',
            });
          }
        }

        scanned += batch.length;
        skip += BATCH_SIZE;
      }

      const finishedAt = new Date();
      const finalStatus = errors.length > 0 ? 'success_with_errors' : 'success';

      const updatedRun = await prisma.leadSyncRun.update({
        where: { id: run.id },
        data: {
          status: finalStatus,
          finishedAt,
          subscribersScanned: scanned,
          leadsCreated: created,
          leadsUpdated: updated,
          errors: errors.length > 0 ? (errors as unknown as Prisma.JsonArray) : Prisma.JsonNull,
        },
      });

      return {
        runId: updatedRun.id,
        status: updatedRun.status,
        subscribersScanned: updatedRun.subscribersScanned,
        leadsCreated: updatedRun.leadsCreated,
        leadsUpdated: updatedRun.leadsUpdated,
        errors,
        startedAt: updatedRun.startedAt,
        finishedAt: updatedRun.finishedAt,
      };
    } catch (error) {
      const finishedAt = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Unknown run error';

      const updatedRun = await prisma.leadSyncRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          finishedAt,
          errors: [{ crmSubscriberId: 'run', message: errorMessage }] as unknown as Prisma.JsonArray,
        },
      });

      return {
        runId: updatedRun.id,
        status: updatedRun.status,
        subscribersScanned: updatedRun.subscribersScanned,
        leadsCreated: updatedRun.leadsCreated,
        leadsUpdated: updatedRun.leadsUpdated,
        errors: [{ crmSubscriberId: 'run', message: errorMessage }],
        startedAt: updatedRun.startedAt,
        finishedAt: updatedRun.finishedAt,
      };
    }
  });
}
