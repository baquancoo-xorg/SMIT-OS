import type {
  CallPerformanceCallInput,
  CallPerformanceConversionItem,
  CallPerformanceHeatmapItem,
  CallPerformancePerAeItem,
  CallPerformanceTrendItem,
  SubscriberStatusMap,
} from '../../types/call-performance.types';

const ANSWERED_THRESHOLD_SECONDS = 10;

function toVnParts(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = fmt.formatToParts(date);
  const map = new Map(parts.map((p) => [p.type, p.value]));
  const y = map.get('year') ?? '1970';
  const m = map.get('month') ?? '01';
  const d = map.get('day') ?? '01';
  const hour = Number(map.get('hour') ?? '0');
  const weekday = map.get('weekday') ?? 'Sun';
  const weekdayMap: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

  return {
    date: `${y}-${m}-${d}`,
    hour,
    dayOfWeek: weekdayMap[weekday] ?? 0,
  };
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function buildAeIdentity(employeeUserId: number | null, employeeMap: Map<number, { id: string; fullName: string }>) {
  if (employeeUserId === null) return { aeUserId: 'unmapped:unknown', aeName: 'Unmapped (CRM ID: unknown)' };

  const mapped = employeeMap.get(employeeUserId);
  if (mapped) return { aeUserId: mapped.id, aeName: mapped.fullName };

  return { aeUserId: `unmapped:${employeeUserId}`, aeName: `Unmapped (CRM ID: ${employeeUserId})` };
}

export function aggregatePerAe(
  calls: CallPerformanceCallInput[],
  employeeMap: Map<number, { id: string; fullName: string }>
): CallPerformancePerAeItem[] {
  const group = new Map<string, {
    aeUserId: string;
    aeName: string;
    totalCalls: number;
    answeredCalls: number;
    totalDuration: number;
    leadSet: Set<number>;
  }>();

  for (const call of calls) {
    const identity = buildAeIdentity(call.employeeUserId, employeeMap);
    if (!group.has(identity.aeUserId)) {
      group.set(identity.aeUserId, {
        aeUserId: identity.aeUserId,
        aeName: identity.aeName,
        totalCalls: 0,
        answeredCalls: 0,
        totalDuration: 0,
        leadSet: new Set<number>(),
      });
    }

    const row = group.get(identity.aeUserId)!;
    row.totalCalls += 1;
    const duration = call.totalDuration ?? 0;
    if (duration > ANSWERED_THRESHOLD_SECONDS) row.answeredCalls += 1;
    row.totalDuration += duration;
    if (call.subscriberId !== null) row.leadSet.add(call.subscriberId);
  }

  return [...group.values()]
    .map((row) => {
      const totalLeadsCalled = row.leadSet.size;
      return {
        aeUserId: row.aeUserId,
        aeName: row.aeName,
        totalCalls: row.totalCalls,
        answeredCalls: row.answeredCalls,
        answerRate: row.totalCalls > 0 ? round2((row.answeredCalls * 100) / row.totalCalls) : 0,
        avgDuration: row.totalCalls > 0 ? round2(row.totalDuration / row.totalCalls) : 0,
        totalLeadsCalled,
        callsPerLead: totalLeadsCalled > 0 ? round2(row.totalCalls / totalLeadsCalled) : 0,
      } satisfies CallPerformancePerAeItem;
    })
    .sort((a, b) => b.totalCalls - a.totalCalls || a.aeName.localeCompare(b.aeName));
}

export function aggregateHeatmap(calls: CallPerformanceCallInput[]): CallPerformanceHeatmapItem[] {
  const map = new Map<string, number>();

  for (const call of calls) {
    const sourceDate = call.callStartTime ?? call.createdAt;
    const parts = toVnParts(sourceDate);
    const key = `${parts.dayOfWeek}-${parts.hour}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  const rows: CallPerformanceHeatmapItem[] = [];
  for (let day = 0; day <= 6; day += 1) {
    for (let hour = 0; hour <= 23; hour += 1) {
      const key = `${day}-${hour}`;
      rows.push({ dayOfWeek: day, hour, callCount: map.get(key) ?? 0 });
    }
  }

  return rows;
}

export function aggregateConversion(
  calls: CallPerformanceCallInput[],
  employeeMap: Map<number, { id: string; fullName: string }>,
  subscriberStatusMap: SubscriberStatusMap
): CallPerformanceConversionItem[] {
  const perAeSubs = new Map<string, {
    aeUserId: string;
    aeName: string;
    subscribers: Map<number, number>;
  }>();

  for (const call of calls) {
    if (call.subscriberId === null) continue;
    const identity = buildAeIdentity(call.employeeUserId, employeeMap);

    if (!perAeSubs.has(identity.aeUserId)) {
      perAeSubs.set(identity.aeUserId, {
        aeUserId: identity.aeUserId,
        aeName: identity.aeName,
        subscribers: new Map<number, number>(),
      });
    }

    const row = perAeSubs.get(identity.aeUserId)!;
    row.subscribers.set(call.subscriberId, (row.subscribers.get(call.subscriberId) ?? 0) + 1);
  }

  return [...perAeSubs.values()]
    .map((row) => {
      let callsToQualified = 0;
      let callsToUnqualified = 0;
      let qualifiedLeadCount = 0;
      let unqualifiedLeadCount = 0;

      for (const [subscriberId, count] of row.subscribers.entries()) {
        const status = subscriberStatusMap.get(subscriberId)?.status ?? null;
        if (status === 'mql_qualified') {
          callsToQualified += count;
          qualifiedLeadCount += 1;
        } else if (status === 'mql_unqualified') {
          callsToUnqualified += count;
          unqualifiedLeadCount += 1;
        }
      }

      const closedLeadCount = qualifiedLeadCount + unqualifiedLeadCount;
      const avgCallsBeforeClose = closedLeadCount > 0
        ? round2((callsToQualified + callsToUnqualified) / closedLeadCount)
        : 0;

      return {
        aeUserId: row.aeUserId,
        aeName: row.aeName,
        callsToQualified,
        callsToUnqualified,
        avgCallsBeforeClose,
      } satisfies CallPerformanceConversionItem;
    })
    .sort((a, b) => {
      const aTotal = a.callsToQualified + a.callsToUnqualified;
      const bTotal = b.callsToQualified + b.callsToUnqualified;
      return bTotal - aTotal || a.aeName.localeCompare(b.aeName);
    });
}

export function aggregateTrend(calls: CallPerformanceCallInput[]): CallPerformanceTrendItem[] {
  const map = new Map<string, { calls: number; answered: number; duration: number }>();

  for (const call of calls) {
    const sourceDate = call.callStartTime ?? call.createdAt;
    const vn = toVnParts(sourceDate);

    if (!map.has(vn.date)) map.set(vn.date, { calls: 0, answered: 0, duration: 0 });

    const row = map.get(vn.date)!;
    row.calls += 1;
    const duration = call.totalDuration ?? 0;
    if (duration > ANSWERED_THRESHOLD_SECONDS) row.answered += 1;
    row.duration += duration;
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, row]) => ({
      date,
      calls: row.calls,
      answered: row.answered,
      avgDuration: row.calls > 0 ? round2(row.duration / row.calls) : 0,
    }));
}
