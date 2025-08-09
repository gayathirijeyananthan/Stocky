## Stock Management System — Implementation Plan & Tracker

### Purpose
Single source of truth for scope, architecture, phased milestones, checklists, and acceptance criteria to build the multi-tenant stock management platform.

### Roles
- **Super Admin**: Platform-wide control, approvals, audit.
- **Company Admin**: Stores, products, deliveries, approvals, reports.
- **Shop Owner**: Access requests, stock view, restock requests.

## Architecture Overview
- **Frontend**: React, React Router, TypeScript, Vite (in `client/`).
- **Backend**: Node.js, Express, TypeScript (in `server/`).
- **Database**: MongoDB (Atlas/local) with Mongoose.
- **Auth**: JWT (access + refresh), bcrypt for passwords.
- **Email**: Nodemailer (SMTP provider TBD).
- **Hosting**: TBD (Heroku/AWS). CI/CD with GitHub Actions (future).

## Project Structure (proposed)
- `client/src`
  - `pages/` Login, Register, Dashboards, Products, Stores, Deliveries, Requests
  - `components/` shared UI
  - `routes/` router config and guards
  - `services/` API client (axios/fetch)
  - `state/` auth and role context
- `server/src`
  - `app.ts` Express app (middlewares, routes)
  - `index.ts` entrypoint (already present)
  - `config/` env, db connection
  - `middlewares/` auth, role, error handler, audit
  - `modules/`
    - `auth/` register, login, refresh
    - `users/`
    - `companies/`
    - `shops/`
    - `products/`
    - `deliveries/`
    - `restockRequests/`
    - `notifications/`
  - `utils/` email, logger
  - `types/`

## Environment Variables
- Server
  - `PORT`
  - `MONGO_URI`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `ACCESS_TOKEN_TTL` (e.g., 15m)
  - `REFRESH_TOKEN_TTL` (e.g., 7d)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Client
  - `VITE_API_BASE_URL`

## Database Schema (simplified with indexes)
- `users`
  - `{ _id, email [unique], password, role ['SUPER_ADMIN'|'COMPANY_ADMIN'|'SHOP_OWNER'], linkedCompanyId?, linkedShopId?, createdAt, updatedAt }`
  - Indexes: `email` unique; `role` (filter)
- `companies`
  - `{ _id, name, address, contact, status ['pending'|'active'|'inactive'], createdByUserId, createdAt, updatedAt }`
  - Indexes: `status`, `name` text
- `shops`
  - `{ _id, name, address, contact, linkedCompanyId, status, createdByUserId, createdAt, updatedAt }`
  - Indexes: `linkedCompanyId`, `status`
- `products`
  - `{ _id, companyId, name, SKU [unique per company], price, warehouseStock, expiryDate?, imageUrl?, createdAt, updatedAt }`
  - Indexes: `companyId`, compound `(companyId, SKU)` unique
- `deliveries`
  - `{ _id, companyId, storeId, productsDelivered: [{ productId, quantity }], deliveryDate, createdByUserId }`
  - Indexes: `companyId`, `storeId`, `deliveryDate`
- `shop_stock`
  - `{ _id, shopId, productId, currentStock, lastDeliveryDate?, expiryDate? }`
  - Indexes: compound `(shopId, productId)` unique
- `restock_requests`
  - `{ _id, shopId, companyId, productId, quantity, requestDate, status ['pending'|'fulfilled'] }`
  - Indexes: `shopId`, `companyId`, `productId`, `status`
- `audit_logs` (optional early)
  - `{ _id, userId, action, entity, entityId, meta, createdAt }`
  - Index: `createdAt`, `userId`

## Core Flows
- **Authentication**
  - Register → hash password → assign role → issue tokens
  - Login → verify → issue tokens; refresh flow with rotation
- **Company Registration**
  - Company Admin submits company → status=pending → Super Admin approves → status=active
- **Shop Access Request**
  - Shop Owner sends request to company → Company Admin approves/rejects → link shop to company and grant access
- **Delivery**
  - Company Admin creates delivery → atomic: decrement product.warehouseStock, upsert shop_stock, record delivery → trigger low-stock notifications
- **Restock**
  - Shop creates request (manual or auto when stock=0) → Company Admin processes via delivery → mark request fulfilled

## Authorization Matrix (high-level)
- **Super Admin**: manage companies/shops/users; approve companies; view all reports; view audit
- **Company Admin**: manage own company, stores, products, deliveries; approve shop access; view/handle restock
- **Shop Owner**: register shop; request access; view own stock; create restock requests

## API Surface (v1)
- `POST /auth/register` — Public
- `POST /auth/login` — Public
- `POST /auth/refresh` — Public (with refresh token)
- `GET /companies?status=` — Super Admin
- `POST /companies/:id/approve` — Super Admin
- `POST /stores` — Company Admin
- `GET /stores` — Company Admin (own company)
- `POST /products` — Company Admin
- `GET /products` — Company Admin (own company)
- `POST /deliveries` — Company Admin
- `POST /shops/requests` — Shop Owner
- `GET /shops/stock` — Shop Owner (own shop)
- `POST /restock_requests` — Shop Owner
- `GET /notifications` — Authenticated (role-filtered)

Notes:
- Use route-level RBAC middleware. All company/shop scoped queries must filter by `companyId`/`shopId` from token context.
- Prefer Mongo transactions for delivery operations.

## Validation & Errors
- Request validation with Zod/Yup or express-validator.
- Centralized error handler → consistent `{ message, code, details }` shape.
- Do not leak internal errors; log with correlation id.

## Notifications
- Email via Nodemailer for: company approval, shop access decisions, low stock, restock status.
- In-app notifications collection for dashboard alerts.

## Reporting (initial)
- Delivery reports by date range per company.
- Low stock report (warehouse + shop).
- Extend later with aggregated pipelines.

## Testing Strategy
- Server: Jest + supertest for routes; Mongoose Test DB.
- Client: Vitest + React Testing Library for components/routes.
- E2E (later): Playwright covering role flows.

## Security
- Strong password hashing (bcrypt).
- JWT best practices: short-lived access, rotating refresh, blacklist on logout (optional phase 2).
- Input validation, rate limiting, CORS, Helmet.
- Audit critical actions to `audit_logs`.

## Milestones & Checklists

### Phase 0 — Project Setup (Day 0–1)
- [ ] Configure server app scaffolding (`server/src/app.ts`, middlewares, router mount)
- [ ] Configure Mongo connection and healthcheck
- [ ] Add env loader and sample `.env.example`
- [ ] Client axios base + auth context skeleton

Acceptance: server boots, `/health` OK; client builds; lint and format pass.

### Phase 1 — Auth & Users (Day 1–2)
- [ ] `POST /auth/register` (roles: COMPANY_ADMIN, SHOP_OWNER)
- [ ] `POST /auth/login`
- [ ] `POST /auth/refresh`
- [ ] Password hashing and token issuance
- [ ] Role-based route guard middleware
- [ ] Client login/register pages wired to API

Acceptance: can register/login for both roles; protected routes gated by role.

### Phase 2 — Super Admin (Day 2–3)
- [ ] Create/seed Super Admin user
- [ ] `GET /companies?status=pending|active`
- [ ] `POST /companies/:id/approve`
- [ ] Admin dashboard pages (list + approve)

Acceptance: Super Admin can approve companies; status transitions reflected.

### Phase 3 — Company Admin Core (Day 3–5)
- [ ] Stores CRUD (scoped to company)
- [ ] Products CRUD (scoped to company; SKU uniqueness per company)
- [ ] Shop access requests: list + approve/reject

Acceptance: Company Admin can manage stores/products; approve shop access.

### Phase 4 — Deliveries & Stock (Day 5–7)
- [ ] `POST /deliveries` with Mongo session transaction
- [ ] Deduct warehouse stock atomically
- [ ] Upsert `shop_stock` increments
- [ ] Low-stock notifications
- [ ] Shop stock view endpoint and page

Acceptance: Delivery adjusts stocks correctly; low stock alerts fire; shop sees stock.

### Phase 5 — Restock Requests (Day 7–8)
- [ ] `POST /restock_requests` (Shop Owner)
- [ ] Company view + fulfill via delivery flow
- [ ] Auto-create restock request when `currentStock` hits 0 (hook)

Acceptance: Manual/auto restock requests visible and can be fulfilled.

### Phase 6 — Notifications & Email (Day 8–9)
- [ ] In-app notifications storage + `GET /notifications`
- [ ] Email templates and SMTP wiring

Acceptance: Users receive emails and see dashboard alerts.

### Phase 7 — Reports & Audit (Day 9–10)
- [ ] Delivery report endpoints
- [ ] Low stock report
- [ ] Audit logging middleware for critical actions

Acceptance: Reports render; audit entries recorded.

## Frontend Routing (initial)
- Public: `/login`, `/register`
- Super Admin: `/admin/companies`, `/admin/reports`
- Company Admin: `/dashboard`, `/stores`, `/products`, `/deliveries`, `/requests`, `/restocks`, `/reports`
- Shop Owner: `/shop/companies`, `/shop/stock`, `/shop/restocks`

## API Conventions
- Base path: `/api/v1`
- Pagination: `?page=1&pageSize=20`
- Sorting: `?sort=field:asc|desc`
- Errors: HTTP status + `{ message, code, details }`

## Open Questions / Decisions
- Multi-tenant isolation strategy beyond filtering (soft multi-tenancy): need per-request company scoping conventions.
- Email provider (SMTP vs transactional service).
- Audit log retention policy.

## Runbook (dev)
1) Start MongoDB or set `MONGO_URI` to Atlas.
2) Server: `cd server && npm i && npm run dev`
3) Client: `cd client && npm i && npm run dev`

## Progress Log
- Date | Item | Owner | Status | Notes
- 2025-__-__ | File initialized | — | pending | —


