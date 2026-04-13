# SMIT-OS Backend & Logic Review Report

**Date:** 2026-04-14 02:01 AM  
**Type:** Code Review / Audit  
**Scope:** Backend logic, frontend-backend integration, data flow

---

## Executive Summary

| Metric | Status |
|--------|--------|
| **Overall Health** | 60% (Needs Work) |
| **Backend APIs** | Functional, but incomplete |
| **Frontend Logic** | Mostly working, some broken features |
| **Data Integrity** | At risk due to missing validations |
| **Security** | Basic, needs improvements |

---

## Architecture Overview

```
Frontend (React 19 + TypeScript)
         │
         ▼
    API Endpoints (/api/*)
         │
         ▼
    server.ts (Express 5)
         │
         ▼
    Prisma Client
         │
         ▼
    PostgreSQL (Docker)
```

---

## Critical Issues (P0 - Must Fix)

### 1. Key Results CRUD Not Working
**Location:** [OKRsManagement.tsx:527-549](src/pages/OKRsManagement.tsx#L527-L549)

**Problem:** AddKRButton gọi API không đúng cách
```typescript
// Frontend gọi:
PUT /api/objectives/:id với body: { keyResults: { create: [...] } }

// Backend chỉ hỗ trợ:
prisma.objective.update({ data: objectiveData })  // Không có nested create
```

**Impact:** Không thể add Key Results vào Objectives

**Fix:** Cần sửa để gọi `POST /api/key-results` thay vì PUT objectives

---

### 2. Edit/Delete Key Results Broken
**Location:** [OKRsManagement.tsx:706](src/pages/OKRsManagement.tsx#L706)

**Problem:** 
- `onDelete={() => { }}` - Empty function, không gọi API
- Edit KR modal chỉ update local state, không persist

**Impact:** Thay đổi KR không được lưu vào database

---

### 3. OKR Progress Not Auto-Recalculating
**Location:** [server.ts:457-488](server.ts#L457-L488)

**Problem:** `recalculateObjectiveProgress()` chỉ được gọi khi:
- Approve Weekly Report (sync KR progress)
- Manual call `/api/okrs/recalculate`

**Impact:** Khi update KR trực tiếp → Objective progress không cập nhật

**Fix:** Gọi recalculate sau mỗi KR update

---

### 4. Daily Report Shows Task IDs Instead of Titles
**Location:** [DailySync.tsx:476-515](src/pages/DailySync.tsx#L476-L515)

**Problem:** 
```tsx
// Chỉ hiển thị:
<div>Task ID: {id}</div>

// Cần resolve task title từ ID
```

**Impact:** User thấy UUID thay vì task title trong Daily Report detail

---

## High Priority Issues (P1)

### 5. PMDashboard Using Wrong Field
**Location:** [PMDashboard.tsx:76](src/pages/PMDashboard.tsx#L76)

**Problem:**
```typescript
// Hiện tại:
obj.level === 'L1'  // Field 'level' không tồn tại trong schema

// Đúng:
obj.department === 'BOD'  // hoặc !obj.parentId
```

**Note:** Code line 76 dùng `level` nhưng Prisma schema không có field này. Logic đang hoạt động vì fallback sang `department === 'BOD'`.

---

### 6. Authentication Security Weak
**Location:** [AuthContext.tsx](src/contexts/AuthContext.tsx)

**Issues:**
- Session chỉ lưu `user_id` vào localStorage
- Không có JWT token
- Không có session expiration
- Restore session bằng cách match ID từ public users list

**Risk:** Session hijacking dễ dàng nếu biết user ID

---

### 7. Missing Input Validation
**Location:** [server.ts](server.ts) (toàn bộ API endpoints)

**Problem:** Không validate input trước khi:
- Create user (có thể duplicate username)
- Create objective (thiếu required fields)
- Update work items (status không hợp lệ)

---

## Medium Priority Issues (P2)

### 8. Orphaned Data References
**Problem:** Khi delete KR, WorkItems với `linkedKrId` vẫn giữ reference

**Fix:** Set `linkedKrId = null` cho WorkItems trước khi delete KR

---

### 9. Work Items Filter Incomplete
**Location:** [TechBoard.tsx:60-64](src/pages/TechBoard.tsx#L60-L64)

```typescript
// Hiện tại:
item.assignee?.department === 'Tech'  // Có thể undefined nếu assignee null
```

**Fix:** Backend cần include assignee relation hoặc filter server-side

---

### 10. Error Handling Inconsistent
**Problem:** Nhiều API calls không có try-catch hoặc error UI

**Affected:**
- [OKRsManagement.tsx](src/pages/OKRsManagement.tsx) - handleAddObjective
- [DailySync.tsx](src/pages/DailySync.tsx) - handleSubmit
- Most modal forms

---

## Working Features (Verified)

| Feature | Status | Notes |
|---------|--------|-------|
| User Login | OK | Basic auth with bcrypt |
| User CRUD (Settings) | OK | Full functionality |
| Sprint CRUD | OK | Full functionality |
| Work Items CRUD | OK | Create, edit, delete, drag-drop |
| Daily Reports | Partial | Create OK, display needs task titles |
| Weekly Reports | OK | With approve flow |
| TechBoard Kanban | OK | Drag-drop với @dnd-kit |
| Objective CRUD | OK | Create, update, delete |
| Key Results | BROKEN | Add/Edit/Delete not persisting |
| OKR Progress Sync | Partial | Only on report approve |

---

## Database Schema Status

| Model | Fields | Relations | Issues |
|-------|--------|-----------|--------|
| User | Complete | OK | - |
| Sprint | Complete | OK | - |
| Objective | Complete | OK | Missing `level` field (frontend assumes it exists) |
| KeyResult | Complete | OK | - |
| WorkItem | Complete | OK | - |
| WeeklyReport | Complete | OK | - |
| DailyReport | Complete | OK | - |

---

## Recommended Fix Priority

### Immediate (This Week)
1. Fix Key Results CRUD endpoints
2. Fix OKR progress auto-recalculate
3. Fix Daily Report task title display

### Short-term (Next Sprint)
4. Add input validation
5. Improve error handling
6. Fix PMDashboard level field

### Long-term
7. Implement proper JWT auth
8. Add rate limiting
9. Add API documentation

---

## Code Quality Observations

### Positives
- Clean component structure
- Good use of TypeScript types
- Consistent UI design system
- Proper error boundaries in some places

### Areas for Improvement
- Backend all in single file (server.ts ~660 lines)
- Missing API input validation
- Inconsistent error handling patterns
- No unit tests found

---

## Questions Unresolved

1. Có plan nào để thêm JWT authentication không?
2. Backend có cần tách ra modules không? (controllers, services)
3. Có cần thêm API rate limiting không?
4. Test strategy là gì?

---

*Report generated by Code Review Agent*
