/**
 * PostHog UI v2 Regression Monitor
 *
 * Mục đích: Detect regression sau Phase 8 default flip (2026-05-10) bằng cách so sánh
 * metrics PostHog 48h sau flip vs 48h trước flip.
 *
 * Metrics tracked:
 *  - $exception count (frontend errors)
 *  - $rageclick count (frustration signal)
 *  - $dead_click count (broken click targets)
 *  - $pageview count by route (page crash detection)
 *  - $autocapture click rate (engagement health)
 *
 * Flag thresholds:
 *  - 🔴 Critical: errors > 2x prev period
 *  - 🟡 Warning: rageclicks > +50%, dead clicks > +30%, pageviews < -20%
 *  - 🟢 OK: in tolerance band
 *
 * Run: `npm run monitor:ui-regression -- [--flip-time=ISO] [--window=48h] [--output=reports/...]`
 *
 * Defaults:
 *  - flip-time = 2026-05-10T15:00:00Z (Phase 8 commit time, adjust if different)
 *  - window = 48h
 *  - output = plans/260510-0358-ui-system-redesign/reports/posthog-monitor-{timestamp}.md
 */
import { hogql, isPostHogConfigured } from '../server/services/posthog/posthog-client';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

interface CliArgs {
  flipTime: Date;
  windowHours: number;
  output: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let flipTime = new Date('2026-05-10T15:00:00Z');
  let windowHours = 48;
  let output = '';

  for (const arg of args) {
    if (arg.startsWith('--flip-time=')) {
      flipTime = new Date(arg.slice('--flip-time='.length));
    } else if (arg.startsWith('--window=')) {
      const raw = arg.slice('--window='.length);
      windowHours = parseInt(raw.replace('h', ''), 10);
    } else if (arg.startsWith('--output=')) {
      output = arg.slice('--output='.length);
    }
  }

  if (!output) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    output = `plans/260510-0358-ui-system-redesign/reports/posthog-monitor-${ts}.md`;
  }

  if (Number.isNaN(flipTime.getTime())) {
    throw new Error(`Invalid --flip-time: ${flipTime}`);
  }

  return { flipTime, windowHours, output };
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
}

function pctDelta(prev: number, curr: number): { abs: number; pct: number; arrow: string } {
  if (prev === 0) {
    return { abs: curr, pct: curr > 0 ? Infinity : 0, arrow: curr > 0 ? '🆕' : '—' };
  }
  const abs = curr - prev;
  const pct = (abs / prev) * 100;
  const arrow = pct > 0 ? '🔺' : pct < 0 ? '🔻' : '➡️';
  return { abs, pct, arrow };
}

function flagLevel(metric: string, prev: number, curr: number): string {
  const { pct } = pctDelta(prev, curr);
  if (metric === 'exception') {
    if (curr >= prev * 2) return '🔴 Critical';
    if (curr >= prev * 1.3) return '🟡 Warning';
    return '🟢 OK';
  }
  if (metric === 'rageclick') {
    if (pct >= 50) return '🟡 Warning';
    return '🟢 OK';
  }
  if (metric === 'dead_click') {
    if (pct >= 30) return '🟡 Warning';
    return '🟢 OK';
  }
  if (metric === 'pageview') {
    if (pct <= -20) return '🟡 Warning';
    return '🟢 OK';
  }
  return '➖';
}

interface CountRow {
  count: number;
}

interface CountByRouteRow {
  route: string;
  count: number;
}

async function countEvents(eventName: string, fromIso: string, toIso: string): Promise<number> {
  const sql = `
    SELECT count() AS count
    FROM events
    WHERE event = '${eventName}'
      AND timestamp >= toDateTime('${fromIso}')
      AND timestamp <  toDateTime('${toIso}')
  `;
  const rows = await hogql<Array<[number]>>(sql);
  return rows[0]?.[0] ?? 0;
}

async function countByRoute(eventName: string, fromIso: string, toIso: string): Promise<CountByRouteRow[]> {
  const sql = `
    SELECT properties.$pathname AS route, count() AS count
    FROM events
    WHERE event = '${eventName}'
      AND timestamp >= toDateTime('${fromIso}')
      AND timestamp <  toDateTime('${toIso}')
      AND properties.$pathname IS NOT NULL
    GROUP BY route
    ORDER BY count DESC
    LIMIT 20
  `;
  const rows = await hogql<Array<[string, number]>>(sql);
  return rows.map(([route, count]) => ({ route, count }));
}

async function generateReport(args: CliArgs): Promise<string> {
  if (!isPostHogConfigured()) {
    throw new Error('PostHog not configured. Set POSTHOG_HOST/POSTHOG_PROJECT_ID/POSTHOG_PERSONAL_API_KEY in .env');
  }

  const flipIso = args.flipTime.toISOString();
  const windowMs = args.windowHours * 60 * 60 * 1000;

  const prevFrom = new Date(args.flipTime.getTime() - windowMs).toISOString();
  const prevTo = flipIso;
  const currFrom = flipIso;
  const currTo = new Date(args.flipTime.getTime() + windowMs).toISOString();

  console.log(`[monitor] Flip time: ${flipIso}`);
  console.log(`[monitor] Prev window: ${prevFrom} → ${prevTo}`);
  console.log(`[monitor] Curr window: ${currFrom} → ${currTo}`);

  // Fetch all metrics in parallel
  const [
    prevExc, currExc,
    prevRage, currRage,
    prevDead, currDead,
    prevPv, currPv,
    prevAuto, currAuto,
    currPvByRoute,
  ] = await Promise.all([
    countEvents('$exception', prevFrom, prevTo),
    countEvents('$exception', currFrom, currTo),
    countEvents('$rageclick', prevFrom, prevTo),
    countEvents('$rageclick', currFrom, currTo),
    countEvents('$dead_click', prevFrom, prevTo),
    countEvents('$dead_click', currFrom, currTo),
    countEvents('$pageview', prevFrom, prevTo),
    countEvents('$pageview', currFrom, currTo),
    countEvents('$autocapture', prevFrom, prevTo),
    countEvents('$autocapture', currFrom, currTo),
    countByRoute('$pageview', currFrom, currTo),
  ]);

  // Build markdown report
  const lines: string[] = [];
  lines.push(`# PostHog UI v2 Regression Monitor Report\n`);
  lines.push(`**Generated:** ${formatDate(new Date())}`);
  lines.push(`**Flip time:** ${formatDate(args.flipTime)}`);
  lines.push(`**Window:** ${args.windowHours}h before vs ${args.windowHours}h after`);
  lines.push(`**Plan:** [\`260510-0358-ui-system-redesign\`](../plan.md)\n`);

  lines.push(`## Summary\n`);
  lines.push(`| Metric | Pre-flip | Post-flip | Δ | % | Status |`);
  lines.push(`|---|---:|---:|---:|---:|---|`);

  const metrics: Array<[string, string, number, number]> = [
    ['exception', 'Frontend errors ($exception)', prevExc, currExc],
    ['rageclick', 'Rage clicks ($rageclick)', prevRage, currRage],
    ['dead_click', 'Dead clicks ($dead_click)', prevDead, currDead],
    ['pageview', 'Page views ($pageview)', prevPv, currPv],
    ['autocapture', 'Click events ($autocapture)', prevAuto, currAuto],
  ];

  for (const [key, label, prev, curr] of metrics) {
    const { abs, pct, arrow } = pctDelta(prev, curr);
    const flag = flagLevel(key, prev, curr);
    const pctStr = Number.isFinite(pct) ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : 'new';
    lines.push(`| ${label} | ${prev.toLocaleString()} | ${curr.toLocaleString()} | ${arrow} ${abs >= 0 ? '+' : ''}${abs.toLocaleString()} | ${pctStr} | ${flag} |`);
  }

  lines.push(`\n## Top routes by post-flip pageviews\n`);
  if (currPvByRoute.length === 0) {
    lines.push(`_No pageview data._\n`);
  } else {
    lines.push(`| Route | Pageviews |`);
    lines.push(`|---|---:|`);
    for (const row of currPvByRoute) {
      lines.push(`| \`${row.route}\` | ${row.count.toLocaleString()} |`);
    }
  }

  lines.push(`\n## Interpretation\n`);
  const excFlag = flagLevel('exception', prevExc, currExc);
  if (excFlag.includes('Critical')) {
    lines.push(`🔴 **CRITICAL:** Frontend error rate doubled. Investigate \`?v=1\` rollback option immediately.\n`);
  } else if (excFlag.includes('Warning')) {
    lines.push(`🟡 **WARNING:** Frontend error rate elevated (+30% or more). Check error tracking dashboard.\n`);
  } else {
    lines.push(`🟢 **Frontend errors stable.**\n`);
  }

  const rageFlag = flagLevel('rageclick', prevRage, currRage);
  if (rageFlag.includes('Warning')) {
    lines.push(`🟡 **WARNING:** Rage clicks +50% or more — UI v2 có click target khó tap hoặc unresponsive. Review session replays.\n`);
  } else {
    lines.push(`🟢 **Rage clicks stable** — no frustration spike.\n`);
  }

  const pvFlag = flagLevel('pageview', prevPv, currPv);
  if (pvFlag.includes('Warning')) {
    lines.push(`🟡 **WARNING:** Pageview drop > 20% — possible page crash hoặc user dropoff.\n`);
  }

  lines.push(`\n## Next Steps\n`);
  lines.push(`1. Nếu có 🔴: enable \`?v=1\` rollback link via support channel.`);
  lines.push(`2. Nếu có 🟡: open PostHog session replay → filter by error event hoặc rageclick → review 5 sessions.`);
  lines.push(`3. Nếu tất cả 🟢: schedule next monitor run +24h or +1 week.`);
  lines.push(`4. After 7 days clean: proceed to sub-component migration follow-up phase.`);
  lines.push(`\n## Raw HogQL Queries\n`);
  lines.push(`Generated by \`scripts/posthog-ui-regression-monitor.ts\`. Re-run với:`);
  lines.push(`\`\`\`bash`);
  lines.push(`npm run monitor:ui-regression -- --flip-time=${flipIso} --window=${args.windowHours}h`);
  lines.push(`\`\`\``);

  return lines.join('\n');
}

async function main() {
  const args = parseArgs();
  console.log(`[monitor] Generating report → ${args.output}`);

  const md = await generateReport(args);
  mkdirSync(dirname(args.output), { recursive: true });
  writeFileSync(args.output, md, 'utf-8');

  console.log(`[monitor] ✓ Report saved: ${args.output}`);
  console.log(`\n${md.split('\n').slice(0, 25).join('\n')}\n...`);
}

main().catch((err) => {
  console.error('[monitor] FAILED:', err);
  process.exit(1);
});
