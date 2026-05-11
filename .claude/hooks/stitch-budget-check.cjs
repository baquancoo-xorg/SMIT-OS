#!/usr/bin/env node
/**
 * Stitch budget guard — Claude Code PreToolUse hook
 *
 * Purpose: chặn `mcp__stitch__*` tool calls khi vượt quota cho phép, tránh
 * tình trạng Stitch tự disable account (auto-detect abuse) hoặc vượt
 * RATE_LIMITED giữa session đang chạy.
 *
 * Input: JSON via stdin (Claude Code hook contract).
 * Output: stderr message + exit code (0 = allow, 2 = block).
 *
 * State: `.claude/.stitch-budget.json` (gitignored, local).
 *
 * To bypass once: set env STITCH_BUDGET_OVERRIDE=1 before running Claude.
 * To bump cap: edit CONFIG below or set STITCH_DAILY_CAP / STITCH_SESSION_CAP.
 */

const fs = require('fs');
const path = require('path');

// ---------- CONFIG ---------- //
const STITCH_FREE_QUOTA = 400; // Stitch hard limit (per Settings page)
const CONFIG = {
  // Block at 87.5% of free quota — 50-credit buffer for safety
  dailyCap: Number(process.env.STITCH_DAILY_CAP) || 350,
  // Warn at 70% so user has heads-up
  warnAt: Number(process.env.STITCH_WARN_AT) || 280,
  // Per-session cap — anti runaway loop
  sessionCap: Number(process.env.STITCH_SESSION_CAP) || 60,
  // Override switch (set env to bypass — emergency only)
  override: process.env.STITCH_BUDGET_OVERRIDE === '1',
  // State file location
  stateFile: path.join(__dirname, '..', '.stitch-budget.json'),
};

// Per-tool credit cost. Conservative: assume 1 credit unless known free.
// Tool names verified against Google Stitch MCP server (Nov 2026).
const TOOL_COST = {
  // Generation — costs credits
  'mcp__stitch__generate_screen_from_text': 1,
  'mcp__stitch__build_site': 1,             // Generates multi-screen routes
  // Read-only / metadata — free
  'mcp__stitch__create_project': 0,
  'mcp__stitch__list_projects': 0,
  'mcp__stitch__get_project': 0,
  'mcp__stitch__list_screens': 0,
  'mcp__stitch__get_screen': 0,
  'mcp__stitch__fetch_screen_code': 0,      // Export HTML of existing screen
  'mcp__stitch__fetch_screen_image': 0,     // Screenshot of existing screen
  'mcp__stitch__extract_design_context': 0, // Read design DNA
  // Fallback for unknown stitch tools — assume costs credits
  default: 1,
};

// ---------- helpers ---------- //
function readStdin() {
  return new Promise(resolve => {
    let buf = '';
    process.stdin.on('data', chunk => (buf += chunk));
    process.stdin.on('end', () => resolve(buf));
    process.stdin.on('error', () => resolve(''));
    // Safety: don't hang indefinitely if no stdin
    setTimeout(() => resolve(buf), 1000);
  });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
  } catch (_) {
    return { date: '', dailyUsed: 0, sessionId: '', sessionUsed: 0, history: [] };
  }
}

function saveState(state) {
  try {
    fs.mkdirSync(path.dirname(CONFIG.stateFile), { recursive: true });
    fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
  } catch (e) {
    // Don't crash hook on write fail; just warn
    process.stderr.write(`[stitch-budget] WARN: cannot write state file: ${e.message}\n`);
  }
}

function utcDate() {
  // Stitch resets at 00:00 UTC. Use UTC date string YYYY-MM-DD.
  return new Date().toISOString().slice(0, 10);
}

// ---------- main ---------- //
(async () => {
  const raw = await readStdin();
  let payload = {};
  try { payload = JSON.parse(raw || '{}'); } catch (_) { /* ignore */ }

  const toolName = payload.tool_name || '';
  const sessionId = payload.session_id || 'unknown';

  // Only gate Stitch tools — let everything else through
  if (!toolName.startsWith('mcp__stitch__')) {
    process.exit(0);
  }

  // Emergency override (logged for audit trail)
  if (CONFIG.override) {
    process.stderr.write(`[stitch-budget] OVERRIDE active — allowing ${toolName} without counting\n`);
    process.exit(0);
  }

  const cost = TOOL_COST[toolName] ?? TOOL_COST.default;
  const today = utcDate();
  const state = loadState();

  // Reset daily counter at UTC midnight
  if (state.date !== today) {
    state.date = today;
    state.dailyUsed = 0;
    state.history = [];
  }

  // Reset session counter on session change
  if (state.sessionId !== sessionId) {
    state.sessionId = sessionId;
    state.sessionUsed = 0;
  }

  // Check daily cap
  if (state.dailyUsed + cost > CONFIG.dailyCap) {
    process.stderr.write(
      `⛔ BLOCKED: Stitch daily cap reached.\n` +
      `   Used today: ${state.dailyUsed}/${CONFIG.dailyCap} (Stitch free quota: ${STITCH_FREE_QUOTA})\n` +
      `   This call would cost: ${cost}\n` +
      `   Reset at 00:00 UTC (≈07:00 VN).\n` +
      `   To bypass once: STITCH_BUDGET_OVERRIDE=1 (use sparingly).\n` +
      `   To raise cap permanently: edit .claude/hooks/stitch-budget-check.cjs CONFIG.dailyCap.\n`
    );
    process.exit(2);
  }

  // Check session cap
  if (state.sessionUsed + cost > CONFIG.sessionCap) {
    process.stderr.write(
      `⛔ BLOCKED: Stitch per-session cap reached.\n` +
      `   This session: ${state.sessionUsed}/${CONFIG.sessionCap}\n` +
      `   Restart Claude Code (or wait) to reset session counter.\n` +
      `   This guard prevents runaway loops calling Stitch in a single session.\n`
    );
    process.exit(2);
  }

  // Increment + persist BEFORE allowing call
  // (If call later fails, we still counted it — conservative side)
  state.dailyUsed += cost;
  state.sessionUsed += cost;
  state.history.push({ at: new Date().toISOString(), tool: toolName, cost });
  // Trim history to last 100 entries (keep file small)
  if (state.history.length > 100) state.history = state.history.slice(-100);
  saveState(state);

  // Warn if crossed warn threshold
  if (state.dailyUsed >= CONFIG.warnAt) {
    process.stderr.write(
      `⚠️  Stitch usage HIGH: ${state.dailyUsed}/${CONFIG.dailyCap} daily (warn at ${CONFIG.warnAt})\n` +
      `   Approaching cap — consider deferring remaining work to tomorrow.\n`
    );
  }

  // Always emit progress so it shows in transcript
  process.stderr.write(
    `💰 Stitch: ${state.dailyUsed}/${CONFIG.dailyCap} daily, ${state.sessionUsed}/${CONFIG.sessionCap} session ` +
    `(${toolName}, cost ${cost})\n`
  );

  process.exit(0);
})();
