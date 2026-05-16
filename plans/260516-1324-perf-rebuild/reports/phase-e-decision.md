# Phase E Decision Log

## Decision: SKIP virtualization

**Reason:** `raw_ads_facebook` (4202 rows) là backend sync table, KHÔNG expose trực tiếp ra UI. AdsTracker page hiển thị aggregated/filtered data — không có table nào hiện đang render >100 rows trong UI tree.

**Verified:**
- `grep raw_ads_facebook src/` → 0 matches in frontend code
- DataTable đã hỗ trợ `pagination` prop (controlled)

**YAGNI:** Premature virtualization khi không có pain point thực tế. Khi UI page nào đó thực sự render >500 rows, add `@tanstack/react-virtual` lúc đó.

**Trigger criteria for future virtualization:**
- DataTable user nào render data.length > 500 (without pagination)
- Scroll FPS đo được <40 trên page đó

## Action

- Không cài `@tanstack/react-virtual`
- Đóng task #7
