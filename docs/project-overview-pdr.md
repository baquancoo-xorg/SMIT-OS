# Project Overview PDR

## Product
SMIT OS is an internal operating dashboard for running SMIT growth, execution, and reporting workflows from one command center.

## Primary Users
- Founder/operator: needs fast executive overview and cross-workspace decisions.
- Growth team: manages leads, ads, media, and acquisition quality.
- Execution team: manages OKRs, daily syncs, weekly check-ins, and blockers.
- Admin: manages users, API keys, settings, and integrations.

## V5 Product Direction
V5 rebuilds the product from a page collection into an Executive Command Center:
1. Command Center
2. Growth Workspace
3. Execution Workspace
4. Intelligence / Reports
5. Admin / Settings

## UX Goals
- Dark-first premium command-center feel.
- Light mode parity with same brand DNA.
- Data-dense layouts that remain scannable.
- Clear workspace navigation and operating loop.
- Fast access to daily operational actions.

## Visual DNA
- Canonical visual contract: `docs/ui-design-contract.md`, based on `docs/ref-ui-playground/Playground .html`.
- Warm dark base: `#0D0D0D`, `#161316`, `#211C19`.
- Orange accent: `#FF6D29` with accessible accent text variant `#FF8F50`.
- Primary CTA: dark gradient, orange beam, orange icon.
- Rounded cards, soft borders, subtle hover-only glow.
- Hanken Grotesk-compatible typography.

## Functional Scope
- Dashboard: overview, acquisition, call performance, distribution, marketing, media, product.
- Leads: logs, stats, filters, real CRM-backed data.
- Ads/Media: campaign and media tracker workflows.
- OKRs: objective and key-result hierarchy.
- Daily/Weekly: DB-backed reporting and approvals.
- Reports: cross-workspace intelligence snapshot and print export.
- Settings/Profile: account/admin operations and appearance controls.

## Non-Goals
- Public customer-facing portal.
- Generic report builder.
- Scheduled email reports.
- Framework migration away from React/Vite without a concrete post-v5 reason.
