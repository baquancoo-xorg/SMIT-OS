/**
 * Phase 0 — shared config for raw-token detection.
 * Used by both audit-raw-tokens.ts (informational) and check-raw-tokens.ts (gate).
 *
 * Q7 decision: regex-grep CI script (no ESLint).
 */

export type Severity = 'color' | 'radius' | 'spacing' | 'invalid';

export interface ForbiddenPattern {
  name: string;
  severity: Severity;
  /** Must be /g flag — used in matchAll. */
  regex: RegExp;
  description: string;
  suggestion: string;
}

const TW_COLORS =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const TW_COLOR_PROPS =
  'bg|text|border|ring|outline|divide|placeholder|caret|accent|fill|stroke|from|via|to';
const TW_SHADES = '50|100|200|300|400|500|600|700|800|900|950';
const SPACING_PROPS =
  'p|m|px|py|pt|pr|pb|pl|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y';

export const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  {
    name: 'raw-tailwind-color',
    severity: 'color',
    regex: new RegExp(
      `\\b(${TW_COLOR_PROPS})-(${TW_COLORS})-(${TW_SHADES})(\\/\\d+)?\\b`,
      'g',
    ),
    description: 'Raw Tailwind color (e.g. bg-blue-600).',
    suggestion: 'Use semantic token: bg-primary | bg-error | bg-success | bg-info | text-on-surface, etc.',
  },
  {
    name: 'generic-radius',
    severity: 'radius',
    regex: /\brounded-(sm|md|lg|xl|2xl|3xl)\b/g,
    description: 'Generic radius stop (rounded-sm/md/lg/xl/2xl/3xl).',
    suggestion: 'Use semantic: rounded-card | rounded-button | rounded-chip | rounded-input | rounded-modal | rounded-full.',
  },
  {
    name: 'raw-spacing',
    severity: 'spacing',
    regex: new RegExp(`\\b(${SPACING_PROPS})-(\\d+(?:\\.\\d+)?)\\b`, 'g'),
    description: 'Raw spacing scale (e.g. p-4, gap-2). Tailwind numeric scale escapes the token system.',
    suggestion: 'Use clamp-based spacing tokens declared in design/v4/tokens.css.',
  },
  {
    name: 'invalid-double-opacity',
    severity: 'invalid',
    // Require a known Tailwind utility prefix to avoid false positives on URLs like "picsum.photos/seed/pm/96/96".
    regex: new RegExp(
      `\\b(${TW_COLOR_PROPS}|rounded|shadow|opacity)-[a-zA-Z0-9-]+(\\/\\d+){2,}\\b`,
      'g',
    ),
    description: 'Double opacity suffix (e.g. bg-error-container/30/50). Tailwind silently drops the class.',
    suggestion: 'Pick one opacity stop. Tailwind allows at most one /N suffix per utility.',
  },
];

/** Paths under v4 must pass the strict gate (check-raw-tokens). */
export const V4_PATH_PREFIXES = ['src/design/v4/', 'src/pages-v4/'];

/** Glob for audit (covers all source files). */
export const SRC_TSX_GLOB = 'src/**/*.tsx';

/** Files / dirs we never scan even during full audit. */
export const EXCLUDED_DIRS = ['node_modules', 'dist', '.claude', 'build'];
