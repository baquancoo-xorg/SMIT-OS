# Auto Server Setup

**Date:** 2026-04-14

## Summary

Implemented hot-reload dev server and created CLAUDE.md for project conventions.

## Changes

### package.json
- `dev` script: `tsx watch --ignore './logs/**' --ignore './dist/**' --ignore './node_modules/**' --ignore './.claude/**' server.ts`
- Enables auto-restart on `.ts` file changes

### CLAUDE.md (new)
- Project conventions for Claude sessions
- Server/DB ports, commands, tech stack

### scripts/start-server.sh
- Changed from `npm run dev` to `npm run start` for LaunchAgent (no watch mode needed for auto-start)

## Issues Resolved

**Infinite restart loop:** Initial `tsx --watch` without ignore patterns caused server to restart endlessly due to log file writes. Fixed by adding ignore patterns for logs/, dist/, node_modules/, .claude/.

## Pending

LaunchAgent (`com.smitos.server.plist`) requires user to grant Full Disk Access to Terminal.app in System Settings > Privacy & Security.
