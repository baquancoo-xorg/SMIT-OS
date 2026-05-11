/**
 * Phase 0 — audit raw-token usage across full src/.
 * Output: markdown report grouped by severity.
 * Exit: 0 always (informational). Use check-raw-tokens.ts as a gate.
 *
 * Run: npm run audit:tokens [-- --out=<path>]
 */
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { FORBIDDEN_PATTERNS, EXCLUDED_DIRS, type Severity } from './raw-tokens-config.js';

interface Hit {
  file: string;
  line: number;
  col: number;
  match: string;
  pattern: string;
  severity: Severity;
}

const ROOT = resolve(process.cwd());
const SRC_DIR = join(ROOT, 'src');
const DEFAULT_OUT = join(
  ROOT,
  'plans/260512-0145-ui-rebuild-v4-foundation-first/reports/00-audit-v3-token-usage.md',
);

async function* walkTsx(dir: string): AsyncGenerator<string> {
  let entries: string[] = [];
  try {
    entries = await readdir(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (EXCLUDED_DIRS.includes(name)) continue;
    const full = join(dir, name);
    const st = await stat(full);
    if (st.isDirectory()) {
      yield* walkTsx(full);
    } else if (st.isFile() && full.endsWith('.tsx')) {
      yield full;
    }
  }
}

function scanFile(file: string, source: string): Hit[] {
  const hits: Hit[] = [];
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const p of FORBIDDEN_PATTERNS) {
      p.regex.lastIndex = 0;
      for (const m of line.matchAll(p.regex)) {
        hits.push({
          file: relative(ROOT, file),
          line: i + 1,
          col: (m.index ?? 0) + 1,
          match: m[0],
          pattern: p.name,
          severity: p.severity,
        });
      }
    }
  }
  return hits;
}

function groupBySeverity(hits: Hit[]): Record<Severity, Hit[]> {
  const out: Record<Severity, Hit[]> = { invalid: [], color: [], radius: [], spacing: [] };
  for (const h of hits) out[h.severity].push(h);
  return out;
}

function topOffenders(hits: Hit[], n = 10): { file: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const h of hits) counts.set(h.file, (counts.get(h.file) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([file, count]) => ({ file, count }));
}

function renderMarkdown(hits: Hit[], filesScanned: number): string {
  const grouped = groupBySeverity(hits);
  const SEVERITY_ORDER: Severity[] = ['invalid', 'color', 'radius', 'spacing'];
  const date = new Date().toISOString().slice(0, 10);

  const sections: string[] = [];
  sections.push('# Audit — Raw Token Usage in v3 Codebase');
  sections.push('');
  sections.push(`> Generated: ${date}`);
  sections.push(`> Files scanned: ${filesScanned}`);
  sections.push(`> Total hits: ${hits.length}`);
  sections.push(`> Phase: 0 — proves drift exists before lint gate goes live`);
  sections.push('');
  sections.push('## Summary');
  sections.push('');
  sections.push('| Severity | Count |');
  sections.push('|---|---|');
  for (const sev of SEVERITY_ORDER) sections.push(`| ${sev} | ${grouped[sev].length} |`);
  sections.push('');

  sections.push('## Top 10 offender files');
  sections.push('');
  sections.push('| File | Hits |');
  sections.push('|---|---|');
  for (const { file, count } of topOffenders(hits)) sections.push(`| ${file} | ${count} |`);
  sections.push('');

  for (const sev of SEVERITY_ORDER) {
    const list = grouped[sev];
    if (list.length === 0) continue;
    sections.push(`## ${sev} (${list.length})`);
    sections.push('');
    const byPattern = new Map<string, Hit[]>();
    for (const h of list) {
      if (!byPattern.has(h.pattern)) byPattern.set(h.pattern, []);
      byPattern.get(h.pattern)!.push(h);
    }
    for (const [pattern, hs] of byPattern) {
      sections.push(`### ${pattern} (${hs.length})`);
      sections.push('');
      sections.push('| File:Line:Col | Class |');
      sections.push('|---|---|');
      for (const h of hs) sections.push(`| ${h.file}:${h.line}:${h.col} | \`${h.match}\` |`);
      sections.push('');
    }
  }

  return sections.join('\n');
}

function parseArgs(): { out: string } {
  let out = DEFAULT_OUT;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith('--out=')) out = resolve(ROOT, a.slice(6));
  }
  return { out };
}

async function main() {
  const { out } = parseArgs();
  const hits: Hit[] = [];
  let filesScanned = 0;
  for await (const f of walkTsx(SRC_DIR)) {
    filesScanned++;
    const src = await readFile(f, 'utf8');
    hits.push(...scanFile(f, src));
  }
  await writeFile(out, renderMarkdown(hits, filesScanned), 'utf8');
  console.log(`Audit done. ${hits.length} hits across ${filesScanned} files. Report: ${relative(ROOT, out)}`);
}

main().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(2);
});
