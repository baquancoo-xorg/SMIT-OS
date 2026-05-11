#!/usr/bin/env node
/**
 * Stitch budget — CLI status / reset helper
 *
 * Usage:
 *   node .claude/hooks/stitch-budget-status.cjs           # show status
 *   node .claude/hooks/stitch-budget-status.cjs --reset   # reset counters
 *
 * Useful for debugging or manually clearing budget after rotating API key.
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '..', '.stitch-budget.json');
const DAILY_CAP = Number(process.env.STITCH_DAILY_CAP) || 350;
const WARN_AT = Number(process.env.STITCH_WARN_AT) || 280;
const SESSION_CAP = Number(process.env.STITCH_SESSION_CAP) || 60;

function load() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (_) {
    return null;
  }
}

function reset() {
  try {
    fs.unlinkSync(STATE_FILE);
    console.log(`✓ Reset: removed ${STATE_FILE}`);
    console.log('  Counters will start at 0 on next Stitch call.');
  } catch (e) {
    if (e.code === 'ENOENT') {
      console.log(`Already reset (no state file at ${STATE_FILE}).`);
    } else {
      console.error(`✗ Reset failed: ${e.message}`);
      process.exit(1);
    }
  }
}

function show() {
  const state = load();
  if (!state) {
    console.log('Stitch budget — no usage recorded yet.');
    console.log(`  State file: ${STATE_FILE} (will be created on first Stitch call)`);
    console.log(`  Daily cap: ${DAILY_CAP} | Warn at: ${WARN_AT} | Session cap: ${SESSION_CAP}`);
    return;
  }

  const dailyPct = ((state.dailyUsed / DAILY_CAP) * 100).toFixed(1);
  const sessionPct = ((state.sessionUsed / SESSION_CAP) * 100).toFixed(1);
  const status = state.dailyUsed >= DAILY_CAP ? '🔴 BLOCKED' :
                 state.dailyUsed >= WARN_AT ? '⚠️  HIGH'   :
                 '✓ OK';

  console.log(`Stitch budget — ${status}`);
  console.log('');
  console.log(`  Date:           ${state.date} (UTC)`);
  console.log(`  Daily used:     ${state.dailyUsed}/${DAILY_CAP}  (${dailyPct}%)`);
  console.log(`  Session used:   ${state.sessionUsed}/${SESSION_CAP}  (${sessionPct}%)`);
  console.log(`  Session ID:     ${state.sessionId}`);
  console.log('');
  console.log(`  History (last ${state.history?.length || 0} calls):`);
  (state.history || []).slice(-5).forEach(h => {
    console.log(`    ${h.at}  ${h.tool}  cost=${h.cost}`);
  });
  if ((state.history || []).length > 5) {
    console.log(`    ... (${state.history.length - 5} earlier)`);
  }
}

const arg = process.argv[2];
if (arg === '--reset' || arg === '-r') {
  reset();
} else if (arg === '--help' || arg === '-h') {
  console.log('Usage: node stitch-budget-status.cjs [--reset|--help]');
} else {
  show();
}
