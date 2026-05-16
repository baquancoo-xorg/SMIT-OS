/**
 * Zone C — Jira task overview. Live proxy with manual refresh button.
 */

import { RefreshCw, ExternalLink } from 'lucide-react';
import { useJiraTasksQuery, useRefreshJiraMutation } from '../../../../hooks/use-personnel-integrations';
import { Card } from '../../../ui';

interface Props {
  personnelId: string;
}

export function JiraZone({ personnelId }: Props) {
  const { data, isLoading } = useJiraTasksQuery(personnelId);
  const refresh = useRefreshJiraMutation(personnelId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-card bg-surface-2" />;
  }

  if (!data?.configured) {
    return (
      <Card padding="lg">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Jira</p>
        <h3 className="mt-1 font-headline text-lg font-black text-text-1">Chưa cấu hình Jira</h3>
        <p className="mt-2 text-sm text-text-2">
          Thiếu biến môi trường <code>ATLASSIAN_EMAIL</code>, <code>ATLASSIAN_API_TOKEN</code>, <code>ATLASSIAN_CLOUD_BASE_URL</code>.
        </p>
      </Card>
    );
  }

  if (!data.accountMapped) {
    return (
      <Card padding="lg">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Jira</p>
        <h3 className="mt-1 font-headline text-lg font-black text-text-1">Chưa map Atlassian accountId</h3>
        <p className="mt-2 text-sm text-text-2">
          Admin cần điền <code>jiraAccountId</code> vào User, hoặc chạy resolver theo email.
        </p>
      </Card>
    );
  }

  const s = data.summary;
  if (!s) {
    return (
      <Card padding="lg">
        <p className="text-sm text-error">{data.error ?? 'Không lấy được dữ liệu Jira'}</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Jira · KKDS</p>
          <h3 className="mt-1 font-headline text-lg font-black text-text-1">Task overview</h3>
        </div>
        <button
          type="button"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs text-text-2 hover:text-text-1 disabled:opacity-50"
        >
          <RefreshCw className={`size-3.5 ${refresh.isPending ? 'animate-spin' : ''}`} />
          {refresh.isPending ? 'Đang tải...' : 'Refresh'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center md:grid-cols-6">
        <Stat label="Total" value={s.total} />
        <Stat label="Done" value={s.done} tone="success" />
        <Stat label="In Progress" value={s.inProgress} tone="info" />
        <Stat label="To Do" value={s.toDo} />
        <Stat label="Blocked" value={s.blocked} tone={s.blocked > 0 ? 'warning' : undefined} />
        <Stat label="Overdue" value={s.overdue} tone={s.overdue > 0 ? 'error' : undefined} />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-text-2">
          <span>Completion rate (50 task gần nhất)</span>
          <span className="font-semibold text-text-1">{s.completionRate}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${s.completionRate}%` }} />
        </div>
      </div>

      {s.recent.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">Recent tasks</p>
          <ul className="mt-2 space-y-1.5">
            {s.recent.map((t) => (
              <li key={t.key} className="flex items-center justify-between gap-2 rounded-input border border-border bg-surface p-2 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-text-1"><span className="font-mono text-text-muted">{t.key}</span> · {t.summary}</p>
                  {t.dueDate && <p className="text-[10px] text-text-muted">Due {t.dueDate.slice(0, 10)}</p>}
                </div>
                <span className={[
                  'shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium',
                  t.statusCategory === 'done' ? 'bg-emerald-500/15 text-emerald-500' :
                  t.statusCategory === 'indeterminate' ? 'bg-sky-500/15 text-sky-500' :
                  'bg-neutral-500/15 text-neutral-400',
                ].join(' ')}>{t.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

interface StatProps { label: string; value: number; tone?: 'success' | 'info' | 'warning' | 'error'; }
function Stat({ label, value, tone }: StatProps) {
  const toneCls =
    tone === 'success' ? 'text-emerald-500' :
    tone === 'info' ? 'text-sky-500' :
    tone === 'warning' ? 'text-amber-500' :
    tone === 'error' ? 'text-rose-500' :
    'text-text-1';
  return (
    <div className="rounded-input border border-border bg-surface p-2">
      <p className="text-[10px] uppercase tracking-wide text-text-muted">{label}</p>
      <p className={`mt-0.5 font-headline text-xl font-black ${toneCls}`}>{value}</p>
    </div>
  );
}
