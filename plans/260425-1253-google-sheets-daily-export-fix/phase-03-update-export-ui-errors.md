# Phase 03 Update Export UI Errors

## Context Links

- Plan: `plan.md`
- Files: `src/components/settings/sheets-export-tab.tsx`

## Overview

Priority: medium.

Make Export tab show clear errors instead of console-only failures.

## Key Insights

- `connectGoogle` currently parses JSON and redirects if `authUrl` exists.
- If API returns 403/500/no authUrl, user sees no useful message.
- Folder/export errors also mostly go to console.

## Requirements

### Functional

- Show visible error when Connect Google fails.
- Show visible error when folder loading fails.
- Keep export status error display.
- Clear stale errors when retrying actions.

### Non-functional

- Avoid adding new UI libraries.
- Use existing `Card`, `Badge`, `Button` patterns.

## Architecture

Add local state:

```ts
const [googleError, setGoogleError] = useState<string | null>(null);
```

Handling:

- Before `connectGoogle`, clear error.
- If `res.ok` false, read `{ error }` and display.
- If response lacks `authUrl`, display `Google OAuth URL missing`.
- On success, redirect.
- On callback `?error=...`, parse and display after URL cleanup.

## Related Code Files

Modify:

- `src/components/settings/sheets-export-tab.tsx`

Read:

- `src/components/ui/*` if needed for alert/card style.

## Implementation Steps

1. Add `googleError` state.
2. Update `connectGoogle` to check `res.ok` before redirect.
3. Surface callback `error` query param.
4. Render a small error panel near Google Account card.
5. Clear error after successful disconnect/status refresh as appropriate.

## Todo List

- [ ] Add visible Google connection error state.
- [ ] Handle non-OK `/api/google/auth` responses.
- [ ] Handle missing `authUrl` response.
- [ ] Surface callback `error` query param.
- [ ] Keep UI concise.

## Success Criteria

- If `/api/google/auth` returns 403, user sees message.
- If Google credentials are missing server-side, user sees message.
- If callback returns `?error=...`, tab shows it.

## Risk Assessment

- Risk: leaking technical internals. Mitigation: show short API error only, no stack.
- Risk: stale error after success. Mitigation: clear error on retry/success.

## Security Considerations

- Do not render HTML from error string.
- React text rendering is safe for plain strings.

## Next Steps

Proceed to Phase 04 validation.

## Unresolved Questions

- None.
