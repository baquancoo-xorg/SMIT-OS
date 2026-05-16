/**
 * Atlassian Jira REST v3 client wrapper.
 * Reads env: ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN, ATLASSIAN_CLOUD_BASE_URL.
 * Returns null if credentials missing → routes degrade to "unconfigured" state.
 */

const PROJECT_KEY = 'KKDS';

export interface JiraTaskSummary {
  total: number;
  done: number;
  inProgress: number;
  toDo: number;
  blocked: number;
  overdue: number;
  completionRate: number;
  recent: Array<{
    key: string;
    summary: string;
    status: string;
    statusCategory: string;
    dueDate: string | null;
    updatedAt: string;
  }>;
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string; statusCategory: { key: string; name: string } };
    duedate: string | null;
    updated: string;
  };
}

function hasCredentials(): boolean {
  return !!(process.env.ATLASSIAN_EMAIL && process.env.ATLASSIAN_API_TOKEN && process.env.ATLASSIAN_CLOUD_BASE_URL);
}

function authHeader(): string {
  const token = Buffer.from(`${process.env.ATLASSIAN_EMAIL}:${process.env.ATLASSIAN_API_TOKEN}`).toString('base64');
  return `Basic ${token}`;
}

function categorize(issues: JiraIssue[]): JiraTaskSummary {
  const now = new Date();
  let done = 0, inProgress = 0, toDo = 0, blocked = 0, overdue = 0;
  for (const it of issues) {
    const cat = it.fields.status.statusCategory.key;
    const name = it.fields.status.name.toLowerCase();
    if (cat === 'done') done++;
    else if (cat === 'indeterminate') inProgress++;
    else if (cat === 'new') toDo++;
    if (name.includes('block')) blocked++;
    if (cat !== 'done' && it.fields.duedate && new Date(it.fields.duedate) < now) overdue++;
  }
  const total = issues.length;
  return {
    total,
    done,
    inProgress,
    toDo,
    blocked,
    overdue,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    recent: issues.slice(0, 5).map((i) => ({
      key: i.key,
      summary: i.fields.summary,
      status: i.fields.status.name,
      statusCategory: i.fields.status.statusCategory.key,
      dueDate: i.fields.duedate,
      updatedAt: i.fields.updated,
    })),
  };
}

export async function fetchJiraTasksForAccount(accountId: string): Promise<JiraTaskSummary | null> {
  if (!hasCredentials()) return null;
  if (!accountId) return null;

  const base = process.env.ATLASSIAN_CLOUD_BASE_URL!.replace(/\/$/, '');
  const jql = `project = ${PROJECT_KEY} AND assignee = ${accountId} ORDER BY updated DESC`;
  const url = `${base}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,status,duedate,updated&maxResults=50`;

  const res = await fetch(url, {
    headers: { Authorization: authHeader(), Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Jira ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as { issues: JiraIssue[] };
  return categorize(data.issues ?? []);
}

export async function findJiraAccountByEmail(email: string): Promise<string | null> {
  if (!hasCredentials() || !email) return null;
  const base = process.env.ATLASSIAN_CLOUD_BASE_URL!.replace(/\/$/, '');
  const url = `${base}/rest/api/3/user/search?query=${encodeURIComponent(email)}`;
  const res = await fetch(url, {
    headers: { Authorization: authHeader(), Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ accountId: string; emailAddress?: string }>;
  const match = data.find((u) => u.emailAddress?.toLowerCase() === email.toLowerCase());
  return match?.accountId ?? null;
}

export function isJiraConfigured(): boolean {
  return hasCredentials();
}
