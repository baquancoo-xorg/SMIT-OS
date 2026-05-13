#!/usr/bin/env bash
# docs-keyword-router.sh
# UserPromptSubmit hook — inject docs reminder khi prompt match keyword.
# Zero overhead khi không match. Reminder ngắn (~200 token) khi match.
# Đọc prompt từ stdin (JSON từ Claude Code), in reminder ra stdout.

set -euo pipefail

# Đọc JSON từ stdin, extract prompt field
input_json=$(cat)
prompt=$(printf '%s' "$input_json" | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("prompt","") if isinstance(d,dict) else "")' 2>/dev/null || echo "")

# Lowercase để match case-insensitive
prompt_lower=$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]')

reminders=()

# UI signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(ui|component|button|card|table|form|chart|color|màu|radius|spacing|icon|typography|theme|design|style|css|tailwind|sidebar|header|modal|dialog|tab|badge|kpi|input|select|date.?picker|tooltip|checkbox|switch|radio|toast|skeleton|empty.?state|playground)\b'; then
  reminders+=("UI task detected. Read docs/ui-design-contract.md FIRST. Top rules: (1) NO solid orange CTA — primary = dark gradient + orange beam + orange icon. (2) Card radius 1.5rem dark / 0.75rem light, Input 1rem / 0.75rem. (3) Accent canonical = var(--brand-500) OKLCH, KHÔNG hex hardcode. (4) Light + dark parity required. (5) Data section bọc <Suspense fallback={Skeleton}>. Cite §-section trong plan + report compliance end-of-task. Visual canon: docs/ref-ui-playground/Playground .html (v4).")
fi

# Backend / API signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(api|endpoint|route|express|prisma|schema|migration|backend|server|middleware|controller|service)\b'; then
  reminders+=("Backend task detected. Read docs/system-architecture.md + docs/code-standards.md FIRST. Stack: Express 5 + Prisma + PostgreSQL 15 @ localhost:5435. File <200 lines, kebab-case, real DB no mocks.")
fi

# Auth / API key signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(auth|api.?key|token|login|session|jwt|oauth|2fa|password)\b'; then
  reminders+=("Auth task detected. Read docs/api-key-authentication.md FIRST. 5 scopes, 1 key model, audit log với UA+sourceIp.")
fi

# MCP signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(mcp|cowork|smitos-mcp)\b'; then
  reminders+=("MCP task detected. Read docs/mcp-cowork-integration.md FIRST. 7-phase plan, smitos-mcp-server repo riêng.")
fi

# Feature scope / PDR signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(pdr|roadmap|feature.?scope|product.?goal|milestone|phase.?plan)\b'; then
  reminders+=("Scope task detected. Read docs/project-overview-pdr.md + docs/development-roadmap.md FIRST.")
fi

# Bug fix signals
if printf '%s' "$prompt_lower" | grep -Eq '\b(bug|fix|debug|error|crash|fail|broken|regression)\b'; then
  reminders+=("Bug fix detected. Read docs/code-standards.md + check docs/journals/ for prior incidents. Root-cause first, no symptom masking.")
fi

# In ra stdout nếu có reminder
if [ ${#reminders[@]} -gt 0 ]; then
  echo "=== Docs Router Reminder ==="
  for r in "${reminders[@]}"; do
    echo "• $r"
  done
  echo "==========================="
fi

exit 0
