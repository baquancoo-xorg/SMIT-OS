# UTM Convention — Acquisition Tracking

> Plan: `260510-0237-acquisition-trackers` Phase 3b
> Audience: Marketing team
> Last updated: 2026-05-10

## Why this matters

Lead Tracker stores `Lead.source` (free text). Ads Tracker matches that to `AdCampaign.utmCampaign`
to compute **CPL, lead count, qualified count per campaign**. If `utm_campaign` doesn't match,
the lead is reported as **unmatched** in the Attribution tab and the spend has no lead attribution.

## Rules

1. **All paid traffic landing pages MUST carry `utm_campaign`.**
2. **Campaign names** in Meta Ads Manager **MUST include the UTM** in this format:

   ```
   <Human readable name> [utm:<value>]
   ```

   Example: `Summer Sale 2026 [utm:summer_sale_2026]`

3. **`utm_campaign` value rules:**
   - lowercase only
   - words separated by `_`
   - no diacritics (use `summer_sale_2026`, not `khuyến_mãi_2026`)
   - max 64 chars

4. **Stable across creatives.** If you re-run the same campaign, reuse the same `utm_campaign`
   so historical attribution remains continuous.

5. **One `utm_campaign` per campaign**. If you split a campaign by audience or creative, encode
   that in `utm_content` / `utm_term`, not in `utm_campaign`.

## Where it gets matched

| Source | Field used | Notes |
|---|---|---|
| Meta campaign | name `[utm:value]` extracted by regex | Phase 3a `meta-ads-normalize.ts` |
| Meta fallback | `RawAdsFacebook.utm_campaign` (most common value) | Used when name doesn't carry the tag |
| Lead | `Lead.source` exact value (case-insensitive trim) | Compared via `attribution.service.ts` |

## Common mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Different casing (`Summer_Sale_2026` vs `summer_sale_2026`) | Match works (we normalize) | Keep lowercase in source-of-truth anyway |
| Trailing whitespace | Match works (we trim) | Remove |
| Mixing `_` and `-` in same value | False mismatch | Pick one separator (we recommend `_`) |
| Using campaign id instead of slug | Hard to read in dashboard | Use a slug, keep id in `utm_content` |
| Missing utm on landing page | Lead has `source = null` → no attribution | Add the tracking link |

## Validation

The Ads Tracker **Attribution tab** highlights any `Lead.source` that doesn't match a campaign
`utmCampaign`. Review weekly and either:
- Fix the campaign name to add the missing `[utm:...]`, or
- Update marketing docs to align future campaigns

## Future scope

- Fuzzy matching (Levenshtein distance) — defer until manual review shows >10% mismatches
- Auto-link `utm_content` for creative-level attribution

**Owner:** Marketing team. **Reviewer:** Acquisition tracker maintainer.
