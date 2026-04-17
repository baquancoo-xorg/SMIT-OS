# Express.js + Prisma Multi-Database Integration Patterns

**Status:** DONE
**Date:** 2026-04-17

---

## 1. Prisma Multi-Schema Setup (Best Practices)

### Option A: Multiple Schemas (Same DB)
- Supported: PostgreSQL, CockroachDB, SQL Server only
- Add schemas array in `datasource` block
- Query syntax unchanged - Prisma handles schema routing

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["main", "crm"]
}
```

### Option B: Multiple Databases (Separate Instances)
Recommended cho CRM external + Main DB setup:

1. **Separate schema files:**
   - `prisma/main/schema.prisma` → Main DB
   - `prisma/crm/schema.prisma` → CRM External DB

2. **Unique output paths cho mỗi client:**
```prisma
// prisma/main/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client-main"
}

// prisma/crm/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client-crm"
}
```

3. **Commands với --schema flag:**
```bash
npx prisma generate --schema=prisma/main/schema.prisma
npx prisma generate --schema=prisma/crm/schema.prisma
```

### Multi-File Schema (GA in v6.7.0)
- Organize models vào files riêng: `user.prisma`, `product.prisma`
- Auto-merge khi run CLI commands

---

## 2. Next.js → Express.js Route Adaptation

### Pattern Mapping

| Next.js (App Router) | Express.js |
|---------------------|------------|
| `app/api/users/route.ts` | `routes/users.ts` |
| `export async function GET(req)` | `router.get('/', handler)` |
| `NextResponse.json()` | `res.json()` |
| Web Request/Response API | Node req/res objects |

### Adapter Pattern
```typescript
// utils/route-adapter.ts
type NextHandler = (req: Request) => Promise<Response>;

export const adaptNextHandler = (handler: NextHandler) => {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    // Convert Express req → Web Request
    const webReq = new Request(req.url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    
    const response = await handler(webReq);
    const data = await response.json();
    res.status(response.status).json(data);
  };
};
```

### Direct Migration (Recommended)
Rewrite handlers thay vì adapt - cleaner code:
```typescript
// Before (Next.js)
export async function GET() {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

// After (Express.js)
export const getUsers = async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};
```

---

## 3. Service Layer Organization

### 3-Layer Architecture
```
┌─────────────────┐
│   Controllers   │  ← HTTP handling, validation
├─────────────────┤
│    Services     │  ← Business logic
├─────────────────┤
│  Repositories   │  ← Data access (Prisma)
└─────────────────┘
```

### Project Structure
```
src/
├── config/
│   ├── database.ts      # Prisma client instances
│   └── env.ts
├── controllers/
│   └── user.controller.ts
├── services/
│   └── user.service.ts
├── repositories/
│   └── user.repository.ts
├── routes/
│   └── user.routes.ts
├── middlewares/
│   └── auth.middleware.ts
├── utils/
└── app.ts
```

### Database Config (Multi-DB)
```typescript
// config/database.ts
import { PrismaClient as MainClient } from '@prisma/client-main';
import { PrismaClient as CrmClient } from '@prisma/client-crm';

export const mainDb = new MainClient();
export const crmDb = new CrmClient();
```

### Repository Pattern
```typescript
// repositories/user.repository.ts
export class UserRepository {
  constructor(private db: MainClient) {}
  
  findById(id: string) {
    return this.db.user.findUnique({ where: { id } });
  }
}
```

### Service Layer
```typescript
// services/user.service.ts
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private crmRepo: CrmUserRepository
  ) {}
  
  async getUserWithCrmData(id: string) {
    const user = await this.userRepo.findById(id);
    const crmData = await this.crmRepo.findByUserId(id);
    return { ...user, crm: crmData };
  }
}
```

---

## Key Takeaways

1. **Multi-DB:** Dùng separate schema files + unique output paths
2. **Migration:** Direct rewrite > adapter pattern (simpler)
3. **Architecture:** 3-layer (Controller-Service-Repository)
4. **DI:** Inject Prisma clients vào repositories, repositories vào services

---

## Sources
- [Prisma Multi-Schema Docs](https://www.prisma.io/docs/orm/prisma-schema/data-model/multi-schema)
- [Prisma Multiple Databases Guide](https://www.prisma.io/guides/multiple-databases)
- [Prisma Multi-File Support](https://www.prisma.io/blog/organize-your-prisma-schema-with-multi-file-support)
- [Clean Architecture with Prisma](https://blog.alexrusin.com/clean-architecture-in-node-js-implementing-the-repository-pattern-with-typescript-and-prisma/)
- [Express Prisma Layered Architecture](https://github.com/Faeshal/nodets-layered-architecture-prisma)
- [Express.js + Prisma Integration](https://www.prisma.io/express)

---

## Unresolved Questions
- CRM DB read-only hay cần write access?
- Connection pooling config cho multiple Prisma clients?
- Shared types giữa 2 DBs?
