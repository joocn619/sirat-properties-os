# TRACKING.md — সিরাত প্রপার্টিজ Real Estate OS
## Project Progress Tracker

> ✅ = Completed | 🔄 = In Progress | ⏳ = Pending

---

## Phase 0 — Project Setup

### Planning & Documentation
- [x] Product context তৈরি
- [x] Features breakdown তৈরি
- [x] Architecture design তৈরি
- [x] Database schema তৈরি
- [x] Phase plan তৈরি
- [x] Project folder structure তৈরি

### Dev Environment
- [ ] Next.js 14 project initialize
- [ ] Tailwind CSS + shadcn/ui setup
- [ ] NestJS project initialize
- [ ] Supabase project create
- [ ] Database schema run (Supabase SQL editor)
- [ ] Storage buckets তৈরি (`avatars`, `kyc-docs`, `property-images`, `project-updates`, `receipts`)
- [ ] Environment variables (.env) configure
- [ ] Git repository initialize

---

## Phase 1 — Authentication System

### Supabase Auth Config
- [ ] OTP (SMS) provider enable
- [ ] Google OAuth provider enable

### Frontend
- [ ] Login page (OTP flow)
- [ ] Google login button
- [ ] OTP verify screen
- [ ] Role selection screen
- [ ] KYC upload page (NID / Trade License)
- [ ] Profile setup page
- [ ] Auth middleware (route protection)

### Backend (NestJS)
- [ ] Auth module তৈরি
- [ ] JWT strategy implement
- [ ] RBAC guard তৈরি
- [ ] KYC upload endpoint
- [ ] Profile update endpoint

### Admin
- [ ] KYC approval queue page
- [ ] Approve / Reject KYC
- [ ] Verified badge assign

---

## Phase 2 — Property Listing

### Seller
- [ ] Property listing form (all fields)
- [ ] Image upload (Supabase Storage)
- [ ] Video upload
- [ ] Unit management (floor/unit numbers)
- [ ] Draft save
- [ ] Publish (KYC check)
- [ ] Edit / delete listing

### Buyer
- [ ] Property search page
- [ ] Advanced filter sidebar
- [ ] Property card component
- [ ] Property detail page
- [ ] Image gallery / video player

### Backend
- [ ] Property CRUD endpoints
- [ ] Image upload endpoint
- [ ] Search + filter query
- [ ] Unit management endpoints

---

## Phase 3 — Booking & Installment

### Frontend
- [ ] Booking request form
- [ ] Booking type selector (full / installment / rent)
- [ ] Installment schedule view
- [ ] Payment mark করার UI
- [ ] Receipt download button
- [ ] Buyer booking dashboard
- [ ] Seller booking management

### Backend
- [ ] Booking create endpoint
- [ ] Installment schedule auto-generate
- [ ] Payment mark endpoint
- [ ] Receipt PDF generate
- [ ] Inventory auto-update on booking

---

## Phase 4 — Agent & Commission System

### Frontend
- [ ] Agent listings browse page
- [ ] Apply to listing button
- [ ] Commission deal view (seller offer)
- [ ] Accept / counter deal UI
- [ ] Agent dashboard
- [ ] Wallet balance page
- [ ] Transaction history
- [ ] Withdraw request form
- [ ] Auto-branding on property page

### Backend
- [ ] Agent apply endpoint
- [ ] Deal negotiation endpoints
- [ ] Commission auto-calculate logic
- [ ] Wallet credit on deal close
- [ ] Withdraw request endpoint
- [ ] Withdraw approval endpoint

### Seller
- [ ] Agent applications list
- [ ] Approve / reject agent
- [ ] Commission deal offer form
- [ ] Agent performance view

---

## Phase 5 — Project Updates & Landing Page Builder

### Project Updates
- [ ] Seller update post form (title + text + media)
- [ ] Media upload for updates
- [ ] Buyer project feed page
- [ ] Update card component (image/video)

### Landing Page Builder
- [ ] Section components (Header, Gallery, Map, Features, Contact)
- [ ] Drag & drop section reorder
- [ ] Section content editor
- [ ] Custom slug input
- [ ] Publish / unpublish toggle
- [ ] Public landing page route (`/projects/[slug]`)

---

## Phase 6 — Real-time Chat & Notifications

### Chat
- [ ] Chat list page
- [ ] Message thread page
- [ ] Supabase Realtime subscription
- [ ] Send message
- [ ] Read receipt update
- [ ] WhatsApp button on property page

### Notifications
- [ ] Notification center page
- [ ] Unread badge count
- [ ] Booking notification
- [ ] Commission notification
- [ ] KYC notification
- [ ] Task completion notification

---

## Phase 7 — Admin ERP

### Super Admin
- [ ] Overview dashboard (stats)
- [ ] User list + search
- [ ] User edit / block / delete
- [ ] KYC queue + approval
- [ ] Audit log viewer
- [ ] SOP & Policy pages

### HR Admin
- [ ] Employee list page
- [ ] Add new employee form
- [ ] Appointment letter generate (PDF)
- [ ] Payroll calculation form
- [ ] Payroll history
- [ ] KPI input form
- [ ] KPI dashboard (charts)

### Accounts Admin
- [ ] Expense entry form
- [ ] Expense list / filter
- [ ] Ledger page (income vs expense)
- [ ] Commission approval list
- [ ] Monthly summary report

---

## Phase 8 — Project Management (Kanban)

- [ ] Kanban board layout (3 columns)
- [ ] Task card component
- [ ] Drag & drop (dnd-kit)
- [ ] Create task form
- [ ] Assign task to employee
- [ ] Priority badge
- [ ] Due date picker
- [ ] Task completion → notification to super admin

---

## Phase 9 — Monetization

- [ ] Subscription plan selection page
- [ ] SSLCommerz payment integration
- [ ] Subscription active check on publish
- [ ] Featured listing toggle + payment
- [ ] Agent premium account toggle
- [ ] Subscription renewal reminder notification
- [ ] Payment history page

---

## Phase 10 — Testing & Deployment

### Testing
- [ ] All API endpoints test
- [ ] RBAC access control test
- [ ] Payment flow test
- [ ] Realtime chat test
- [ ] Mobile responsive test
- [ ] File upload test

### Security
- [ ] RLS policies সব table-এ
- [ ] JWT validation check
- [ ] Input validation সব endpoints
- [ ] File upload size/type restriction

### Deployment
- [ ] Vercel — Next.js deploy
- [ ] Railway — NestJS deploy
- [ ] Supabase — production instance
- [ ] Custom domain connect
- [ ] SSL certificate verify
- [ ] Environment variables production-এ set

---

## Progress Summary

| Phase | Status | Completed |
|---|---|---|
| Phase 0 — Setup | 🔄 In Progress | 6/14 |
| Phase 1 — Auth | ⏳ Pending | 0/17 |
| Phase 2 — Property Listing | ⏳ Pending | 0/16 |
| Phase 3 — Booking | ⏳ Pending | 0/14 |
| Phase 4 — Agent & Commission | ⏳ Pending | 0/21 |
| Phase 5 — Projects & Landing Page | ⏳ Pending | 0/14 |
| Phase 6 — Chat & Notifications | ⏳ Pending | 0/14 |
| Phase 7 — Admin ERP | ⏳ Pending | 0/22 |
| Phase 8 — Kanban | ⏳ Pending | 0/9 |
| Phase 9 — Monetization | ⏳ Pending | 0/10 |
| Phase 10 — Testing & Deploy | ⏳ Pending | 0/15 |

**Overall: 6 / 166 tasks completed**

---

## Changelog

| Date | Update |
|---|---|
| 2026-03-30 | Project documentation complete. docs/ folder তৈরি। TRACKING.md শুরু। |
