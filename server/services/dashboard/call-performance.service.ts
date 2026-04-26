import { getCrmClient, safeCrmQuery } from '../../lib/crm-db';
import { loadEmployeeMap, type EmployeeMapValue } from '../lead-sync/employee-mapper';
import type { CallPerformanceCallInput, CallPerformanceResponse } from '../../types/call-performance.types';
import { aggregateConversion, aggregateHeatmap, aggregatePerAe, aggregateTrend } from './call-performance-aggregators';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_KEYS = 500;

type CacheEntry = {
  expiresAt: number;
  data: CallPerformanceResponse;
};

const cache = new Map<string, CacheEntry>();

function getCacheKey(from: Date, to: Date, aeId?: string) {
  return `${from.toISOString()}::${to.toISOString()}::${aeId ?? 'all'}`;
}

function readCache(key: string) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function writeCache(key: string, data: CallPerformanceResponse) {
  if (cache.size >= MAX_CACHE_KEYS) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function getDisplayNameFromLarkInfo(larkInfo: unknown) {
  if (!larkInfo || typeof larkInfo !== 'object' || Array.isArray(larkInfo)) return null;

  const record = larkInfo as Record<string, unknown>;

  const name = record.name;
  if (typeof name === 'string' && name.trim()) return name.trim();

  const enterpriseEmail = record.enterprise_email;
  if (typeof enterpriseEmail === 'string' && enterpriseEmail.trim()) return enterpriseEmail.trim();

  const email = record.email;
  if (typeof email === 'string' && email.trim()) return email.trim();

  return null;
}

async function loadCrmEmployeeNameMap(crm: any, employeeUserIds: number[]) {
  if (employeeUserIds.length === 0) return new Map<number, EmployeeMapValue>();

  const rows = await safeCrmQuery(
    () =>
      crm.smit_employee.findMany({
        where: {
          user_id: { in: employeeUserIds },
          is_active: true,
        },
        select: {
          user_id: true,
          lark_info: true,
        },
      }),
    [] as Array<{ user_id: number; lark_info: unknown }>
  );

  const map = new Map<number, EmployeeMapValue>();

  for (const row of rows ?? []) {
    const fullName = getDisplayNameFromLarkInfo(row.lark_info);
    if (!fullName) continue;

    map.set(row.user_id, {
      id: `crm:${row.user_id}`,
      fullName,
    });
  }

  return map;
}

export async function getCallPerformance(from: Date, to: Date, aeId?: string): Promise<CallPerformanceResponse> {
  const key = getCacheKey(from, to, aeId);
  const cached = readCache(key);
  if (cached) return cached;

  const crm = getCrmClient();
  if (!crm) {
    const empty: CallPerformanceResponse = {
      perAe: [],
      heatmap: [],
      conversion: [],
      trend: [],
    };
    writeCache(key, empty);
    return empty;
  }

  const employeeMap = await loadEmployeeMap();

  const filterEmployeeId = aeId
    ? [...employeeMap.entries()].find(([, user]) => user.id === aeId)?.[0]
    : undefined;

  if (aeId && filterEmployeeId === undefined) {
    const empty: CallPerformanceResponse = {
      perAe: [],
      heatmap: [],
      conversion: [],
      trend: [],
    };
    writeCache(key, empty);
    return empty;
  }

  const callsRaw = await safeCrmQuery(
    () =>
      crm.crm_call_history.findMany({
        where: {
          created_at: { gte: from, lte: to },
          PEERDB_IS_DELETED: false,
          ...(filterEmployeeId !== undefined ? { employee_user_id: filterEmployeeId } : {}),
        },
        select: {
          subscriber_id: true,
          employee_user_id: true,
          total_duration: true,
          call_start_time: true,
          created_at: true,
        },
      }),
    [] as Array<{
      subscriber_id: number | null;
      employee_user_id: number | null;
      total_duration: number | null;
      call_start_time: Date | null;
      created_at: Date;
    }>
  );

  const calls: CallPerformanceCallInput[] = (callsRaw ?? []).map((row) => ({
    subscriberId: row.subscriber_id,
    employeeUserId: row.employee_user_id,
    totalDuration: row.total_duration,
    callStartTime: row.call_start_time,
    createdAt: row.created_at,
  }));

  const employeeUserIds = [...new Set(calls.map((c) => c.employeeUserId).filter((id): id is number => id !== null))];
  const crmEmployeeNameMap = await loadCrmEmployeeNameMap(crm, employeeUserIds);
  const mergedEmployeeMap = new Map(employeeMap);

  for (const [employeeUserId, employee] of crmEmployeeNameMap.entries()) {
    if (!mergedEmployeeMap.has(employeeUserId)) {
      mergedEmployeeMap.set(employeeUserId, employee);
    }
  }

  const subscriberIds = [...new Set(calls.map((c) => c.subscriberId).filter((id): id is number => id !== null))];
  const statusesRaw = subscriberIds.length > 0
    ? await safeCrmQuery(
      () =>
        crm.crmSubscriber.findMany({
          where: {
            id: { in: subscriberIds.map((id) => BigInt(id)) },
            PEERDB_IS_DELETED: false,
          },
          select: { id: true, status: true },
        }),
      [] as Array<{ id: bigint; status: string | null }>
    )
    : [];

  const subscriberStatusMap = new Map<number, { status: string | null }>();
  for (const row of statusesRaw ?? []) {
    subscriberStatusMap.set(Number(row.id), { status: row.status ?? null });
  }

  const data: CallPerformanceResponse = {
    perAe: aggregatePerAe(calls, mergedEmployeeMap),
    heatmap: aggregateHeatmap(calls),
    conversion: aggregateConversion(calls, mergedEmployeeMap, subscriberStatusMap),
    trend: aggregateTrend(calls),
  };

  writeCache(key, data);
  return data;
}
