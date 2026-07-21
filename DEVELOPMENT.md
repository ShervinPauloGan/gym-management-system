# Development Guide — Architecture & Conventions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js + Express 4 + TypeScript |
| Frontend | React 18 + Vite + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS 3 + clsx (no custom CSS files) |
| Icons | `@heroicons/react` (24/outline) |
| State (frontend) | Zustand (persist for auth) |
| HTTP client | Axios (request/response interceptors) |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken` + `bcryptjs`) |
| Package manager | pnpm |

---

## Project Structure

```
<project-root>/
├── docker-compose.yml              # PostgreSQL + backend containers
├── gym-management-backend/         # Express API server
│   ├── Dockerfile
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── index.ts                # Entry point — mounts all modules
│       ├── database.ts             # PrismaClient singleton
│       ├── enums.ts                # Shared enums
│       ├── constants.ts            # App-wide constants
│       ├── middleware/
│       │   ├── auth.middleware.ts   # JWT verify + role guard
│       │   └── error.middleware.ts  # AppError class + error handler
│       └── modules/
│           └── <ModuleName>/       # PascalCase
│               ├── app/
│               │   ├── <module>.controller.ts
│               │   └── <module>.service.ts
│               ├── config/
│               │   └── index.ts
│               ├── database/
│               │   └── migrations.ts
│               ├── routes/
│               │   └── index.ts
│               └── tests/
│                   └── <module>.test.ts
│
└── gym-management-frontend/        # React SPA
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx                 # Router with ProtectedRoute/PublicRoute
        ├── index.css               # Only 3 Tailwind directives
        ├── components/
        │   └── layout/
        │       ├── AppLayout/      # Sidebar + TopNav + <Outlet />
        │       ├── Sidebar/
        │       └── TopNav/
        ├── shared/
        │   ├── lib/
        │   │   └── api.ts          # Axios instance with token interceptor
        │   ├── stores/
        │   │   ├── auth.store.ts   # Zustand + persist
        │   │   └── ui.store.ts     # Zustand (non-persisted)
        │   ├── types/              # Shared type definitions
        │   └── components/ui/
        │       ├── Button/
        │       ├── Input/
        │       ├── Card/
        │       └── Badge/
        └── modules/
            └── <ModuleName>/
                ├── pages/
                │   └── <ModuleName>/
                │       └── page.tsx
                ├── components/     # (optional)
                │   └── <ComponentName>/
                │       └── index.tsx
                ├── constants/
                │   └── index.ts
                ├── schema/         # (optional — Zod validation)
                │   └── index.ts
                ├── services/
                │   └── index.ts
                └── tests/
```

---

## Backend Conventions

### Module Structure (Laravel-Style)

Every module goes in `src/modules/<ModuleName>/`. Not every subfolder is required — add only what the module needs:

| Folder | Purpose | Required? |
|--------|---------|-----------|
| `app/<module>.controller.ts` | Route handlers (thin — parse req, call service, return res) | Only if module has endpoints |
| `app/<module>.service.ts` | Business logic (thick — Prisma queries, validation, calculations) | Recommended |
| `config/index.ts` | Module-specific constants/configuration | Optional |
| `database/migrations.ts` | Seed data or migration metadata | Optional |
| `routes/index.ts` | Express router with endpoint definitions | Required if module has endpoints |
| `tests/<module>.test.ts` | Test file | Optional |

### Controllers

```typescript
// src/modules/<Module>/app/<module>.controller.ts
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { <module>Service } from "./<module>.service";

const someSchema = z.object({ ... });

const service = new <Module>Service();

export class <Module>Controller {
  async method(req: Request, res: Response, next: NextFunction) {
    try {
      const data = someSchema.parse(req.body);
      const result = await service.method(data);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError)
        return res.status(400).json({ error: "Validation failed", details: err.errors });
      next(err);
    }
  }
}

export const <module>Controller = new <Module>Controller();
```

### Services

```typescript
// src/modules/<Module>/app/<module>.service.ts
import { prisma } from "../../../database";
import { AppError } from "../../../middleware/error.middleware";

export class <Module>Service {
  async method(data: SomeType): Promise<SomeResponse> {
    const record = await prisma.someModel.findUnique({ where: { ... } });
    if (!record) throw new AppError(404, "Not found");
    // ... business logic ...
    return { ... };
  }
}
```

### Routes

```typescript
// src/modules/<Module>/routes/index.ts
import { Router } from "express";
import { <module>Controller } from "../app/<module>.controller";

const router = Router();
router.get("/", <module>Controller.method);
export { router as <module>Router };
```

### Routes Mounted in `src/index.ts`

```typescript
// Public (no auth)
app.use("/api/auth", authRouter);

// Protected (JWT required)
app.use("/api/members", verifyToken, membersRouter);
app.use("/api/plans", verifyToken, planShopRouter);
// ... etc.

// Global error handler — MUST be last
app.use(errorHandler);
```

### Error Handling

```typescript
// src/middleware/error.middleware.ts
export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.errors });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
```

### Auth Middleware

```typescript
// src/middleware/auth.middleware.ts
interface JwtPayload { sub: string; role: string; }
interface AuthRequest extends Request { user?: JwtPayload; }

// Extracts Bearer token, verifies JWT, attaches req.user
function verifyToken(req: AuthRequest, res: Response, next: NextFunction) { ... }

// Factory — returns middleware that checks role membership
function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => { ... };
}
```

### Database Client (`src/database.ts`)

```typescript
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Prisma Schema Conventions

```prisma
model Example {
  id        String   @id @default(uuid()) @db.Uuid
  fieldName String   @map("field_name")           // snake_case in DB
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  relation  OtherModel @relation(fields: [foreignId], references: [id], onDelete: Cascade)
  foreignId String   @map("foreign_id") @db.Uuid
  @@index([foreignId, createdAt])                  // composite index
  @@map("examples")                                // snake_case table name
}
```

### Enums & Constants

```typescript
// src/enums.ts
export enum Role { Admin = "admin", Manager = "manager", Member = "member" }

// src/constants.ts
export const SOME_VALUE = 42;
export const CONFIG_MAP: Record<string, number> = { key: 100 };
```

### Backend package.json Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "lint": "tsc --noEmit"
  }
}
```

### Backend tsconfig

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Frontend Conventions

### Module Structure

```
modules/<ModuleName>/
├── pages/<ModuleName>/page.tsx     # Page component (named export: <ModuleName>Page)
├── components/<ComponentName>/index.tsx  # Module-specific components
├── constants/index.ts              # Data constants
├── schema/index.ts                 # Zod validation schemas
├── services/index.ts               # API service object
└── tests/                          # Test files
```

### Page Component

```typescript
// modules/<Module>/pages/<Module>/page.tsx
import { SomeComponent } from "../../components/SomeComponent";

export function <Module>Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Page Title</h1>
          <p className="text-sm text-muted mt-1">Page description</p>
        </div>
      </div>
      {/* Page content */}
    </div>
  );
}
```

### API Client (`shared/lib/api.ts`)

```typescript
import axios from "axios";
import { useAuthStore } from "@/shared/stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Auto-attach Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout();
    return Promise.reject(err);
  },
);
```

### Service Module

```typescript
// modules/<Module>/services/index.ts
import { api } from "@/shared/lib/api";

export const <module>Service = {
  getAll(params?: Record<string, string>) {
    return api.get("/<resource>", { params });
  },
  get(id: string) {
    return api.get(`/<resource>/${id}`);
  },
  create(data: SomeType) {
    return api.post("/<resource>", data);
  },
};
```

### Zustand Store

```typescript
// shared/stores/<name>.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface <Name>State {
  // state
  setter: () => void;
}

export const use<Name>Store = create<<Name>State>()(
  persist(
    (set) => ({
      // initial state
      setter: () => set({ ... }),
    }),
    { name: "<storage-key>" },
  ),
);
```

Use `persist` middleware only for data that must survive page refresh (auth token/user). Omit for ephemeral UI state.

### Shared UI Components

All in `shared/components/ui/<Component>/index.tsx`:

| Component | Props | ForwardRef? |
|-----------|-------|-------------|
| `Button` | `variant` ("primary"\|"secondary"\|"ghost"), `size` ("sm"\|"md"\|"lg"), `loading`, + HTML button attrs | Yes |
| `Input` | `label`, `error`, + HTML input attrs | Yes |
| `Card` | `elevated`, + HTML div attrs | Yes |
| `Badge` | `variant` ("default"\|"active"\|"inactive"\|"warning") | No |

All use `clsx` for conditional class merging. No custom CSS files.

### Routing (`App.tsx`)

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        {/* ... more routes */}
      </Route>
    </Routes>
  );
}
```

### Vite Config

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: { "/api": { target: "http://localhost:4000", changeOrigin: true } },
  },
});
```

### Frontend tsconfig (key parts)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

### Tailwind Config (key parts)

- **Font:** Geist (loaded from Google Fonts in `index.html`)
- **Colors:** `surface` (#F8F9FA), `surface-dim` (#E5E7EB), `surface-bright` (#FFFFFF), `primary` (#000000), `primary-foreground` (#FFFFFF), `muted` (#6B7280), `muted-foreground` (#9CA3AF), `border` (#E5E7EB), `error` (#DC2626)
- **Spacing:** `gutter: 24px`, `page-margin: 32px`
- **Font sizes:** `metric-lg` (36px/44px), `metric-md` (24px/32px)

### Frontend package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  }
}
```

---

## Docker

### docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: gym-postgres
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gym_system
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck: { test: ["CMD-SHELL", "pg_isready -U postgres"], interval: 5s, retries: 5 }

  backend:
    build: ./gym-management-backend
    container_name: gym-backend
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/gym_system"
      JWT_SECRET: "dev-secret-change-in-production"
      CLIENT_ORIGIN: "http://localhost:5173"
    depends_on: { postgres: { condition: service_healthy } }
```

### Backend Dockerfile

Use `node:22-slim` with OpenSSL installed (required by Prisma):

```dockerfile
FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY prisma ./prisma
RUN pnpm db:generate
COPY . .
ENV CI=true
RUN pnpm build
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
```

---

## File Naming & Export Conventions

| What | Convention | Example |
|------|-----------|---------|
| Backend module folders | PascalCase | `Auth`, `PlanShop` |
| Backend controllers | kebab-case + `.controller.ts` | `auth.controller.ts` |
| Backend services | kebab-case + `.service.ts` | `auth.service.ts` |
| Backend routes | kebab-case in `routes/index.ts` | `routes/index.ts` |
| Backend exports | Named exports: `xxxController`, `xxxRouter`, `xxxService` | `export const authController = ...` |
| Frontend module folders | PascalCase | `Dashboard`, `PlanShop` |
| Frontend page component | PascalCase + `Page` | `DashboardPage` |
| Frontend page file | `pages/<Module>/page.tsx` | `pages/Dashboard/page.tsx` |
| Frontend services | Named exports: `xxxService` | `export const dashboardService = ...` |
| Frontend stores | Named exports: `useXxxStore` | `export const useAuthStore = ...` |
| Frontend stores file | kebab-case + `.store.ts` | `auth.store.ts` |
| Frontend shared UI | PascalCase folder + `index.tsx` | `Button/index.tsx` |
| Frontend layout | PascalCase folder + `index.tsx` | `Sidebar/index.tsx` |
| Routes (API) | `/api/<resource>` | `/api/auth`, `/api/members` |
| Frontend URL paths | kebab-case | `/login`, `/check-in`, `/plan-shop` |

---

## Quick-Start Checklist

```bash
# Backend
pnpm install
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to PostgreSQL
pnpm dev                  # Start dev server on :4000

# Frontend
pnpm install
pnpm dev                  # Start dev server on :5173

# Or with Docker:
docker compose up --build -d
```
