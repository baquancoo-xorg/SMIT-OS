# Brainstorm: Auto Server Setup for SMIT-OS

**Date:** 2026-04-14
**Status:** Approved

---

## Problem Statement

User cannot access localhost:3005 after code changes because:
1. Server doesn't auto-start on system boot (LaunchAgent fails with error 126)
2. No hot-reload - requires manual restart after code changes
3. No CLAUDE.md to guide Claude on project-specific commands

## Requirements

### Functional
- Server auto-starts when macOS boots
- Server auto-restarts when code changes
- Claude follows project conventions via CLAUDE.md

### Non-Functional  
- Minimal setup complexity
- No additional dependencies if possible
- Works with existing Docker PostgreSQL setup

## Evaluated Approaches

### 1. tsx --watch (SELECTED)
**Pros:** Simple, tsx already installed, no extra packages
**Cons:** Less configurable than nodemon
**Verdict:** Best balance of simplicity and functionality

### 2. nodemon + tsx
**Pros:** More configurable, industry standard
**Cons:** Extra dependency, overkill for this use case
**Verdict:** Rejected - unnecessary complexity

### 3. Docker Compose with volume watch
**Pros:** Consistent environment, deployment ready
**Cons:** Complex setup, more resources
**Verdict:** Rejected - too much overhead for dev workflow

## Recommended Solution

### 1. Fix package.json scripts
```json
{
  "scripts": {
    "dev": "tsx --watch server.ts",
    "start": "tsx server.ts"
  }
}
```

### 2. Fix LaunchAgent permissions
- Grant Full Disk Access to Terminal.app
- Or use alternative: Login Items with script

### 3. Create CLAUDE.md
```markdown
# SMIT-OS Project

## Development
- Port: 3005
- DB: Docker PostgreSQL on port 5435
- Start server: `npm run dev`
- Server auto-reloads on file changes

## Commands
- `npm run dev` - Start dev server with hot-reload
- `npm run start` - Production start (no watch)
- `docker-compose up -d` - Start DB container

## After Code Changes
Server auto-restarts via tsx --watch. No manual action needed.
```

## Implementation Steps

1. Update `package.json` dev script to use `--watch` flag
2. Create `CLAUDE.md` with project conventions
3. Fix LaunchAgent macOS permissions:
   - System Settings > Privacy & Security > Full Disk Access
   - Add Terminal.app
   - Reload LaunchAgent: `launchctl unload/load`
4. Test: modify any `.ts` file, verify server restarts

## Success Criteria

- [ ] `localhost:3005` accessible after boot
- [ ] Server restarts automatically when `.ts` files change
- [ ] CLAUDE.md guides future Claude sessions

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| macOS blocks LaunchAgent | Fallback: Login Items |
| tsx --watch has issues | Fallback: nodemon |

## Next Steps

Create implementation plan via `/ck:plan` command.
