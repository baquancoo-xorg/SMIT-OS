#!/usr/bin/env node
/**
 * UI Canon Grep Scanner
 * Scans v5 UI files for forbidden patterns that violate the design contract.
 *
 * Usage: node scripts/ui-canon-grep.cjs
 * Exit: 0 if warn-only (default), 1 if strict mode enabled via UI_CANON_STRICT=1
 */

const fs = require('fs');
const path = require('path');

const STRICT_MODE = process.env.UI_CANON_STRICT === '1';
const ROOT = process.cwd();

const SCAN_DIRS = [
  'src/components/v5',
  'src/pages/v5',
];

const FORBIDDEN_PATTERNS = [
  {
    name: 'hardcoded-hex',
    regex: /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g,
    message: 'Hardcoded hex color — use CSS variable token',
    exclude: /\/\/ ui-canon-ok|eslint-disable|@ts-|className.*#|from.*#|import.*#/,
  },
  {
    name: 'bg-white',
    regex: /\bbg-white\b/g,
    message: 'bg-white — use bg-surface or token',
    exclude: /ui-canon-ok/,
  },
  {
    name: 'text-white',
    regex: /\btext-white\b/g,
    message: 'text-white — use text-text-1 or token',
    exclude: null,
  },
  {
    name: 'border-white',
    regex: /\bborder-white\b/g,
    message: 'border-white — use border-border or token',
    exclude: null,
  },
  {
    name: 'shadow-lg-xl',
    regex: /\bshadow-(lg|xl|2xl)\b/g,
    message: 'shadow-lg/xl/2xl — use shadow-card or shadow-elevated',
    exclude: null,
  },
  {
    name: 'rounded-arbitrary',
    regex: /\brounded-(xl|2xl|3xl)\b/g,
    message: 'rounded-xl/2xl/3xl — use rounded-card, rounded-modal, or token',
    exclude: null,
  },
  {
    name: 'font-black',
    regex: /\bfont-black\b/g,
    message: 'font-black — only allowed with explicit comment for hero/KPI',
    exclude: /ui-canon-ok|hero|kpi/i,
  },
  {
    name: 'border-gray',
    regex: /\bborder-gray-\d+\b/g,
    message: 'border-gray-* — use border-border or border-outline token',
    exclude: null,
  },
];

function walkDir(dir, fileList = []) {
  const fullPath = path.join(ROOT, dir);
  if (!fs.existsSync(fullPath)) return fileList;

  const files = fs.readdirSync(fullPath, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.name.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function scanFiles() {
  const violations = [];
  const allFiles = [];

  for (const dir of SCAN_DIRS) {
    walkDir(dir, allFiles);
  }

  for (const file of allFiles) {
    const filePath = path.join(ROOT, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, lineIndex) => {
      // Check current line + up to 8 previous lines for exclude comments (covers function body)
      const contextLines = [];
      for (let i = 0; i <= 8 && lineIndex - i >= 0; i++) {
        contextLines.push(lines[lineIndex - i]);
      }

      for (const { name, regex, message, exclude } of FORBIDDEN_PATTERNS) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(line)) !== null) {
          // Check current line and up to 3 previous lines for exclude pattern
          const excluded = exclude && contextLines.some(l => exclude.test(l));
          if (excluded) continue;
          // Skip import/from statements with hex in URLs
          if (name === 'hardcoded-hex' && /import|from|require/.test(line)) continue;

          violations.push({
            file: file,
            line: lineIndex + 1,
            column: match.index + 1,
            pattern: name,
            message,
            snippet: line.trim().substring(0, 60),
          });
        }
      }
    });
  }

  return violations;
}

function formatTable(violations) {
  if (violations.length === 0) {
    return '✅ No UI canon violations found.';
  }

  const header = '| File | Line | Pattern | Message |';
  const divider = '|------|------|---------|---------|';
  const rows = violations.slice(0, 50).map(v =>
    `| ${v.file} | ${v.line} | ${v.pattern} | ${v.message} |`
  );

  const output = [
    `⚠️ Found ${violations.length} UI canon violation(s)${violations.length > 50 ? ' (showing first 50)' : ''}:`,
    '',
    header,
    divider,
    ...rows,
  ];

  return output.join('\n');
}

function main() {
  console.log('🔍 Scanning for UI canon violations...\n');

  const violations = scanFiles();
  const output = formatTable(violations);

  console.log(output);
  console.log('');

  if (violations.length > 0) {
    console.log(`Mode: ${STRICT_MODE ? 'STRICT (will fail)' : 'WARN (informational)'}`);
    console.log('Set UI_CANON_STRICT=1 to enable strict mode.\n');

    if (STRICT_MODE) {
      process.exit(1);
    }
  }

  process.exit(0);
}

main();
