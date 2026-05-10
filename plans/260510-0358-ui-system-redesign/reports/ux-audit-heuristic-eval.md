# Heuristic Evaluation (Nielsen 10) — SMIT-OS UI

> Date: 2026-05-10 | Phase 1 deliverable
> Scope: 10 pages + 5 layout components | Static code audit
> Severity: 🔴 Critical / 🟡 Major / 🟢 Minor

## Methodology

Apply Nielsen's 10 usability heuristics selectively against findings từ 13 page-level audit reports + cross-page drift inventory.

Each heuristic: list violations với severity + location + suggested fix.

## H1. Visibility of system status

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | Loading skeletons chỉ có 1-2 places (Skeleton.tsx import count low) | Most pages | Phase 4: ship `<PageSkeleton>`, `<TableSkeleton>` components |
| 2 | 🔴 | Form submit không show inline spinner (LoginPage có, Profile/Settings không) | Profile, Settings tabs | Phase 4: `<Button loading>` prop |
| 3 | 🟡 | LeadTracker last-sync indicator chỉ admin thấy → member ko biết data fresh | LeadTracker | Phase 6: show indicator cho all roles |
| 4 | 🟡 | Optimistic UI ít dùng — user click submit phải đợi network | OKRs check-in, daily-sync | Phase 6: optimistic update + rollback |
| 5 | 🟢 | Notification unread count ko realtime (cần refresh) | Header NotificationCenter | Phase 4: pollover websocket; defer |

## H2. Match between system and real world

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🟡 | Vietnamese only helper text (FB Config, OKR Cycles) → mixed language UX | Settings sub-tabs | Phase 5: i18n strategy decision |
| 2 | 🟡 | Stat label viết tắt không tooltip ("OT" "OVD" "VN" "QT" trong LeadTracker) | LeadTracker logs-tab | Phase 4: `<Abbr>` component với tooltip |
| 3 | 🟢 | Numeric inputs không hỗ trợ K/M suffix (10K → 10000) | MediaTracker reach input | Phase 4: smart number input |

## H3. User control and freedom

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | Modals không close on ESC (LeadDetailModal, MediaPostDialog) | lead-tracker, media-tracker | Phase 4: shared `<Modal>` với ESC + click-outside |
| 2 | 🔴 | Form data lost on navigation (DailySync, WeeklyCheckin) — user fill xong nav away mất hết | Checkin pages | Phase 4: form autosave + dirty state warn |
| 3 | 🟡 | Tab state ko URL-encoded → reload mất context | LeadTracker, MediaTracker, AdsTracker, Settings | Phase 4: `useSearchParams` pattern |
| 4 | 🟡 | Bulk action ko undo (LeadTracker bulk delete) | LeadTracker | Phase 6: toast + undo button |
| 5 | 🟢 | Breadcrumb item không clickable (decorative) | All pages | Phase 4: navigable breadcrumb |

## H4. Consistency and standards

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | 4 page header variants production (canonical/Profile/mid-size/login) | Cross-page | Phase 2 doc + Phase 4 `<PageHeader>` |
| 2 | 🔴 | 39 card pattern variants | Cross-page | Phase 4 single `<Card>` primitive |
| 3 | 🔴 | Spacing tokens chỉ 5.5% adoption (292 raw vs 17 token) | Cross-page | Phase 2 codemod |
| 4 | 🔴 | Edit pattern split: User mgmt = modal, OKR Cycles + FB Config = inline | Settings sub-tabs | Phase 5: pick one (recommend inline) |
| 5 | 🟡 | Button radius 3 variants (full/xl/2xl) | Cross-page | Phase 4 `<Button>` enforce radius |
| 6 | 🟡 | Emoji icons (🆕 ⏰ 📅) trộn với Material Symbols | NotificationCenter | Phase 4: replace với Material |
| 7 | 🟡 | Breadcrumb separator: unicode `›` (Header) vs Material `chevron_right` (style guide) | Header | Phase 4: standardize |
| 8 | 🟢 | Date picker label `text-xs` vs `text-[10px]` chuẩn | OKR Cycles, Sheets Export | Phase 2 typography |

## H5. Error prevention

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | Form validation absent — accept blank inputs silently (Dashboard add objective, OKRs KR add) | OKRs | Phase 4: `useFormValidation` hook + inline error |
| 2 | 🔴 | Destructive actions không confirmation OR ko show what will be deleted (LeadTracker bulk) | LeadTracker | Phase 4: `<ConfirmDialog>` với details |
| 3 | 🟡 | Password field ko show requirements (8 chars? special?) | Settings ProfileTab, LoginPage signup | Phase 4: `<PasswordInput>` với strength |
| 4 | 🟡 | Token paste ko trim whitespace (FB Config) → silently fails | Settings FB Config | Phase 4: trim + validate format |
| 5 | 🟢 | Number input không clamp (allow negative reach in MediaTracker) | media-post-dialog | Phase 4: typed input |

## H6. Recognition rather than recall

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | Active tab indicator yếu (chỉ subtle bg change, ko chevron/dot) | Most tab containers | Phase 4: `<Tabs>` với strong indicator |
| 2 | 🟡 | Sidebar active item indicator nhỏ (vertical line không nổi) | Sidebar | Phase 4: clearer active state |
| 3 | 🟡 | OKRs hierarchy L1/L2 ko rõ ràng — user phải đoán level | OKRs | Phase 7: visual hierarchy + breadcrumb in detail |
| 4 | 🟢 | Filter chips ko show active filter count (badge) | LeadTracker | Phase 4: `<FilterChip>` với count |

## H7. Flexibility and efficiency of use

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🟡 | No keyboard shortcuts (e.g. `g d` go dashboard, `c` create) | All | Phase 4 (defer): keyboard shortcut layer |
| 2 | 🟡 | Tab switch ko keyboard arrow keys | All tab containers | Phase 4: `<Tabs>` với roving tabindex |
| 3 | 🟡 | Sort table chỉ AdsTracker có (Campaigns) — mất state on tab switch | LeadTracker, MediaTracker tables | Phase 4: `<DataTable>` với persisted sort |
| 4 | 🟢 | No bulk export across pages (chỉ LeadTracker có CSV) | MediaTracker, AdsTracker | Phase 6: shared CSV export hook |

## H8. Aesthetic and minimalist design

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🟡 | Dashboard tab có quá nhiều sub-components (38 files, 5 tabs) — info overload | Dashboard | Phase 7: progressive disclosure, drill-down |
| 2 | 🟡 | OKRsManagement.tsx 1324 LOC → modal + accordion + tabs trong 1 file | OKRs | Phase 7: extract sub-routes |
| 3 | 🟢 | Header breadcrumb thường truncate trên mobile | Header | Phase 4: mobile-aware breadcrumb |

## H9. Help users recognize, diagnose, recover from errors

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🔴 | Many pages dùng `alert()` cho error → blocking + ugly | DailySync, WeeklyCheckin | Phase 4: `<Toast>` system |
| 2 | 🔴 | Error messages generic ("Something went wrong") — ko actionable | Most fetch error branches | Phase 4: error categorization + retry button |
| 3 | 🟡 | Inline form error scattered, no error summary at top | All forms | Phase 4: error summary component |
| 4 | 🟡 | Network error ko distinguish vs validation error | API error handling | Phase 4: error code mapping |

## H10. Help and documentation

| # | Severity | Violation | Location | Fix |
|---|---|---|---|---|
| 1 | 🟡 | Empty state messaging ko hướng dẫn ("No data") thay vì explain how to add | All tables empty | Phase 4: `<EmptyState>` component với CTA |
| 2 | 🟡 | Onboarding flow ko có (new user landing dashboard ko biết bắt đầu từ đâu) | Dashboard | Phase 7: optional empty-onboarding state |
| 3 | 🟢 | Tooltip/help icon ít dùng | Settings token fields | Phase 4: `<HelpTooltip>` |

## Severity summary

| Severity | Count | Phase |
|---|---|---|
| 🔴 Critical | 13 | Phase 2 (tokens) + Phase 4 (primitives) — addresses all |
| 🟡 Major | 24 | Phase 4-7 |
| 🟢 Minor | 11 | Phase 8 polish |

Total: 48 violations.

## Top patterns underlying violations

1. **No design system primitives** → drift across pages (heuristic 4)
2. **No form abstraction** → no validation, no autosave, no error handling (H1, H5, H9)
3. **No table abstraction** → no sort, no empty state, no skeleton (H1, H6, H10)
4. **No modal abstraction** → no ESC, no focus trap, inconsistent close (H3)
5. **No toast/notification system** → `alert()` fallback (H9)
6. **No keyboard layer** → tab switch, form submit, ESC mostly missing (H7)

**Key takeaway:** Phase 4 component library là leverage cao nhất — fix 1 component = fix 10 pages.

## Unresolved questions

1. Keyboard shortcuts (Linear/Cmd-K style) — in scope hay out?
2. Internationalization — Vietnamese-only OK forever, hay add English support?
3. Toast vs Banner vs Modal — phân vai nào dùng cái nào?
4. Real-time updates (notification, OKR progress) — websocket hay poll?
5. Onboarding/tour — out of scope cho redesign?
