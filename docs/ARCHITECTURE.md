# ARCHITECTURE.md — সিরাত প্রপার্টিজ Real Estate OS

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  Next.js 14 (App Router) + Tailwind CSS + shadcn/ui     │
│  Hosted on: Vercel                                       │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                    API LAYER                             │
│  NestJS (REST API)                                       │
│  Hosted on: Railway / Render                             │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
┌──────▼──────┐  ┌─────▼──────┐  ┌────▼──────────┐
│  Supabase   │  │  Supabase  │  │   Supabase    │
│  PostgreSQL │  │  Realtime  │  │   Storage     │
│  (Database) │  │  (Socket)  │  │   (Files)     │
└─────────────┘  └────────────┘  └───────────────┘
       │
┌──────▼──────┐
│  Supabase   │
│  Auth       │
│  (OTP +     │
│   Google)   │
└─────────────┘
```

---

## Tech Stack (Final)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14 (App Router) | SSR/SSG, routing, UI |
| Styling | Tailwind CSS + shadcn/ui | Component library |
| State Management | Zustand + TanStack Query | Global state + server state |
| Forms | React Hook Form + Zod | Form validation |
| Backend | NestJS | REST API, business logic |
| Database | PostgreSQL via Supabase | All data storage |
| Auth | Supabase Auth | OTP + Google OAuth |
| Realtime | Supabase Realtime | Chat + notifications |
| Storage | Supabase Storage | Images, videos, documents |
| PDF Generation | React-PDF / Puppeteer | Receipts, appointment letters |
| Deployment Frontend | Vercel | Auto-deploy from Git |
| Deployment Backend | Railway | NestJS API server |
| Deployment Database | Supabase Cloud | Managed PostgreSQL |

---

## Service Modules (NestJS)

```
src/
├── auth/           → OTP login, Google OAuth, JWT, KYC
├── users/          → User CRUD, profile, role management
├── properties/     → Property CRUD, image upload, units
├── bookings/       → Booking, installment, receipt
├── agents/         → Agent profile, apply, deals
├── commissions/    → Commission calculation, wallet
├── projects/       → Project updates, landing pages
├── chat/           → Chat rooms, messages (Supabase Realtime)
├── notifications/  → Push notifications
├── admin/          → User management, KYC approval, audit
├── hr/             → Employees, payroll, KPI
├── accounts/       → Expenses, ledger, approvals
└── tasks/          → Kanban, task assignment
```

---

## Authentication Flow

```
User → Phone/Email OTP or Google
     → Supabase Auth verify
     → JWT token issued
     → Role check (buyer/seller/agent/admin)
     → KYC check (if seller/agent)
     → Dashboard redirect
```

## Role-Based Access Control (RBAC)

| Role | Access |
|---|---|
| `buyer` | Search, book, installment, chat, project feed |
| `seller` | Property listing, inventory, agent assign, landing page, project updates |
| `agent` | Apply listings, commission deals, wallet, withdraw |
| `admin` | All above + KYC approval, user management |
| `hr_admin` | Employee management, payroll, KPI |
| `accounts_admin` | Ledger, expenses, payment approvals |
| `super_admin` | Everything + audit trail, SOP |

---

## Data Flow Examples

### Booking Flow
```
Buyer selects property
→ POST /bookings (buyer_id, property_id, type, amount)
→ NestJS validates: unit available? buyer KYC ok?
→ DB: bookings table insert
→ DB: property_units status → 'booked'
→ Installment schedule auto-generate
→ Notification: seller + agent notified
→ Buyer sees booking confirmation + receipt
```

### Commission Flow
```
Agent applies to listing
→ POST /agent-listings/apply
→ Seller approves agent
→ POST /commission-deals (commission%, deadline)
→ Agent accepts deal
→ Property page auto-branded with agent info
→ Deal closes (booking completed)
→ Commission auto-calculated
→ Agent wallet credited
→ Withdraw request created
→ Accounts admin approves
→ Payment sent
```

### Real-time Chat Flow
```
Buyer opens chat with Agent
→ Supabase Realtime channel created
→ Messages insert to DB
→ Supabase broadcasts to both clients
→ Read receipt update
```

---

## Security

| Concern | Solution |
|---|---|
| Authentication | JWT via Supabase Auth |
| Authorization | RBAC middleware in NestJS |
| Database | Row Level Security (RLS) in Supabase |
| File Upload | Type + size validation, Supabase Storage policies |
| Input Validation | Zod (frontend) + class-validator (backend) |
| SQL Injection | Supabase ORM / parameterized queries |
| HTTPS | SSL via Vercel + Supabase |
| Sensitive Data | Environment variables only |

---

## Supabase Storage Buckets

| Bucket | Contents | Access |
|---|---|---|
| `avatars` | User profile pictures | Public read |
| `kyc-docs` | NID/Trade License | Private (admin only) |
| `property-images` | Property photos/videos | Public read |
| `project-updates` | Construction photos/videos | Public read |
| `receipts` | Booking receipts PDF | Private (owner only) |
| `payroll-docs` | Appointment letters | Private (admin only) |
