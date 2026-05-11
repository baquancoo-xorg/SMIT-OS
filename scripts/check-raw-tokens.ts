/**
 * Phase 0 — CI/lint gate for v4 paths.
 * Scans src/design/v4/** and src/pages-v4/**.
 * Exit 1 on ANY hit (with file:line:col output). Exit 0 if clean.
 *
 * v3 paths are exempt during migration window.
 *
 * Run: npm run lint
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import {
  FORBIDDEN_PATTERNS,
  V4_PATH_PREFIXES,
  EXCLUDED_DIRS,
  type Severity,
} from './raw-tokens-config.js';

interface Hit {
  file: string;
  line: number;
  col: number;
  match: string;
  pattern: string;
  severity: Severity;
}

const ROOT = resolve(process.cwd());

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

async function dirExists(p: string): Promise<boolean> {
  try {
    const s = await stat(p);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function main() {
  const hits: Hit[] = [];
  let scannedDirs = 0;
  let scannedFiles = 0;

  for (const prefix of V4_PATH_PREFIXES) {
    const dir = join(ROOT, prefix);
    if (!(await dirExists(dir))) continue;
    scannedDirs++;
    for await (const f of walkTsx(dir)) {
      scannedFiles++;
      const src = await readFile(f, 'utf8');
      hits.push(...scanFile(f, src));
    }
  }

  if (scannedDirs === 0) {
    console.log(`check-raw-tokens: no v4 paths exist yet (${V4_PATH_PREFIXES.join(', ')}). Skipping gate.`);
    return;
  }

  if (hits.length === 0) {
    console.log(`check-raw-tokens: clean — ${scannedFiles} v4 file(s) scanned, 0 violations.`);
    return;
  }

  console.error(`check-raw-tokens: ${hits.length} violation(s) in v4 paths:`);
  console.error('');
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}:${h.col}  [${h.severity}/${h.pattern}]  ${h.match}`);
  }
  console.error('');
  console.error(`Hint: use semantic tokens declared in src/design/v4/tokens.css.`);
  console.error(`See scripts/raw-tokens-config.ts for forbidden patterns + suggestions.`);
  process.exit(1);
}

main().catch((err) => {
  console.error('check-raw-tokens failed:', err);
  process.exit(2);
});
