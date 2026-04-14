# Phase 7: Testing & Deployment

**Priority:** HIGH
**Effort:** 2 days
**Status:** completed
**Depends on:** All previous phases

## Overview

Comprehensive testing và deployment preparation.

## Day 1: Security Testing

### 1. Authentication Tests

```bash
# Test: Unauthenticated access blocked
curl -i http://localhost:3005/api/users
# Expected: 401 Unauthorized

# Test: Login returns cookie
curl -i -X POST http://localhost:3005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
# Expected: Set-Cookie: jwt=...; HttpOnly; ...

# Test: Cookie-based access works
curl -i http://localhost:3005/api/users \
  --cookie "jwt=<token_from_login>"
# Expected: 200 OK with users array

# Test: Invalid token rejected
curl -i http://localhost:3005/api/users \
  --cookie "jwt=invalid-token"
# Expected: 401 Unauthorized

# Test: Logout clears cookie
curl -i -X POST http://localhost:3005/api/auth/logout \
  --cookie "jwt=<token>"
# Expected: Set-Cookie: jwt=; ... (cleared)
```

### 2. Authorization Tests (RBAC)

```bash
# Test: Member cannot create user
# Login as member first, then:
curl -i -X POST http://localhost:3005/api/users \
  --cookie "jwt=<member_token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","username":"test"}'
# Expected: 403 Forbidden

# Test: Member can update own profile
curl -i -X PUT http://localhost:3005/api/users/<own_id> \
  --cookie "jwt=<member_token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Updated Name"}'
# Expected: 200 OK

# Test: Member cannot update other's profile
curl -i -X PUT http://localhost:3005/api/users/<other_id> \
  --cookie "jwt=<member_token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Hacked"}'
# Expected: 403 Forbidden

# Test: Leader can approve team member's report
# ... (similar pattern)

# Test: Leader cannot approve other dept's report
# ... (similar pattern)
```

### 3. Input Validation Tests

```bash
# Test: Invalid username rejected
curl -i -X POST http://localhost:3005/api/users \
  --cookie "jwt=<admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","username":"ab"}'
# Expected: 400 {"error":"Validation failed","details":[...]}

# Test: Invalid email rejected
curl -i -X PUT http://localhost:3005/api/users/<id> \
  --cookie "jwt=<admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"not-an-email"}'
# Expected: 400 with validation error

# Test: XSS attempt sanitized
curl -i -X POST http://localhost:3005/api/work-items \
  --cookie "jwt=<token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>"}'
# Expected: Stored as plain text, not executed
```

### 4. Security Checklist

- [ ] JWT secret is in .env (not hardcoded)
- [ ] .env is in .gitignore
- [ ] Cookies have httpOnly flag
- [ ] Cookies have Secure flag (production)
- [ ] Cookies have SameSite=Strict
- [ ] No localStorage auth remnants
- [ ] All API routes protected (except /auth/login)
- [ ] Role checks are server-side only
- [ ] Input validation on all POST/PUT

---

## Day 2: Integration Testing & Deployment

### 1. Full Flow Tests

```bash
# Test: Complete user journey
1. Login → Get cookie
2. View dashboard → Data loads
3. Create work item → Success
4. Update work item → Success
5. Submit report → Success
6. Logout → Cookie cleared
7. Access protected route → Redirected to login

# Test: Admin journey
1. Login as admin
2. Create new user → Success
3. Update user role → Success
4. Delete user → Success

# Test: Leader journey
1. Login as leader
2. View team reports → See team only
3. Approve member report → Success
4. Try approve other dept → 403
```

### 2. Frontend Integration Tests

```typescript
// Manual test checklist
- [ ] Login page works
- [ ] Session persists on refresh
- [ ] Logout works across tabs
- [ ] 401 redirects to login
- [ ] Protected routes redirect unauthenticated
- [ ] Admin routes redirect non-admin
- [ ] PM Dashboard loads without lag
- [ ] All CRUD operations work
```

### 3. Performance Tests

```bash
# Test: API response times
for i in {1..10}; do
  time curl -s http://localhost:3005/api/work-items \
    --cookie "jwt=<token>" > /dev/null
done
# Target: <100ms average

# Test: OKR sync performance
time curl -X POST http://localhost:3005/api/reports/<id>/approve \
  --cookie "jwt=<admin_token>"
# Target: <500ms for 50 KRs

# Test: Dashboard render (use React DevTools Profiler)
# Target: <50ms with 500+ items
```

### 4. Deployment Preparation

#### Environment Variables
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=<generate-secure-32-char-secret>
DATABASE_URL=<production-db-url>
```

#### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Production Checklist
- [ ] JWT_SECRET is unique and secure
- [ ] DATABASE_URL points to production DB
- [ ] NODE_ENV=production
- [ ] Cookie Secure flag enabled
- [ ] CORS configured for production domain
- [ ] Rate limiting added (optional)
- [ ] Logging configured

### 5. Rollback Plan

If issues in production:

```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Redeploy
npm run build && npm run start

# 3. If DB changes needed, run migrations
npm run db:push
```

### 6. Post-Deployment Verification

```bash
# Test production endpoints
curl -i https://production-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"<prod-password>"}'

# Verify:
- [ ] Login works
- [ ] Cookie is Secure
- [ ] All routes protected
- [ ] Dashboard loads
```

## Success Criteria

| Criteria | Target | Status |
|----------|--------|--------|
| All API routes protected | 100% | [ ] |
| Role checks server-side | 100% | [ ] |
| Input validation | All POST/PUT | [ ] |
| server.ts lines | <100 | [ ] |
| API response time | <100ms | [ ] |
| Dashboard render | <50ms | [ ] |
| Security vulnerabilities | 0 | [ ] |

## Final Sign-off

- [ ] Security testing complete
- [ ] Integration testing complete
- [ ] Performance targets met
- [ ] Production environment configured
- [ ] Rollback plan documented
- [ ] Team trained on new auth flow

---

**Plan Complete!**

After all phases complete, run:
```bash
/ck:plan archive plans/260414-0925-security-backend-restructure
```
