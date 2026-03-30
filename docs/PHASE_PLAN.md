# PHASE_PLAN.md — সিরাত প্রপার্টিজ Real Estate OS

## Development Roadmap (12 Weeks)

---

## Phase 0 — Project Setup (Week 1)

### Goals
- Development environment ready
- Supabase project configured
- Base project structure তৈরি

### Tasks

**Frontend (Next.js)**
```bash
npx create-next-app@latest sirat-properties --typescript --tailwind --app
cd sirat-properties
npx shadcn-ui@latest init
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
```

**Backend (NestJS)**
```bash
npm i -g @nestjs/cli
nest new sirat-properties-api
npm install @supabase/supabase-js
npm install @nestjs/config @nestjs/jwt passport passport-jwt
npm install class-validator class-transformer
```

**Supabase Setup**
- New Supabase project create করো
- Database schema গুলো run করো (DATABASE_SCHEMA.md থেকে)
- Storage buckets তৈরি করো: `property-images`, `kyc-docs`, `project-updates`, `avatars`
- RLS (Row Level Security) policies সেট করো
- Realtime enable করো `messages` ও `notifications` table-এ

**Folder Structure**
```
sirat-properties/           (Next.js Frontend)
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── kyc/
│   ├── (buyer)/
│   │   ├── dashboard/
│   │   ├── search/
│   │   ├── bookings/
│   │   └── projects/
│   ├── (seller)/
│   │   ├── dashboard/
│   │   ├── listings/
│   │   ├── inventory/
│   │   ├── agents/
│   │   └── landing-builder/
│   ├── (agent)/
│   │   ├── dashboard/
│   │   ├── listings/
│   │   ├── commissions/
│   │   └── wallet/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── hr/
│   │   ├── accounts/
│   │   └── audit/
│   ├── projects/[slug]/    (Public landing pages)
│   └── api/                (Next.js API routes - light)
├── components/
│   ├── ui/                 (shadcn/ui components)
│   ├── auth/
│   ├── property/
│   ├── agent/
│   └── shared/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
└── types/

sirat-properties-api/       (NestJS Backend)
├── src/
│   ├── auth/
│   ├── users/
│   ├── properties/
│   ├── bookings/
│   ├── agents/
│   ├── commissions/
│   ├── projects/
│   ├── admin/
│   ├── hr/
│   ├── accounts/
│   ├── notifications/
│   └── chat/
```

### Deliverables
- [ ] Next.js project running locally
- [ ] NestJS API running locally
- [ ] Supabase connected
- [ ] Basic folder structure তৈরি

---

## Phase 1 — Auth System (Week 2)

### Goals
Universal Auth system সম্পূর্ণরূপে কাজ করবে।

### Features to Build

**1.1 OTP Login**
- Phone number input
- Supabase OTP send (SMS via Twilio/built-in)
- OTP verify করে login

**1.2 Google OAuth**
- Supabase Google provider enable
- One-tap Google login

**1.3 Role Selection**
- Login-এর পরে যদি role না থাকে, role selection screen দেখাবে
- Roles: Buyer, Seller, Agent

**1.4 KYC Upload**
- Seller ও Agent-এর জন্য NID / Trade License upload
- Supabase Storage-এ save
- Status: Pending → Admin review → Approved/Rejected
- KYC approve না হওয়া পর্যন্ত property publish করতে পারবে না

**1.5 Profile Setup**
- Avatar upload
- Bio, contact info, social links

### API Endpoints (NestJS)
```
POST /auth/verify-otp
POST /auth/google
PUT  /auth/role
POST /auth/kyc
GET  /auth/profile
PUT  /auth/profile
```

### Deliverables
- [ ] OTP login কাজ করছে
- [ ] Google login কাজ করছে
- [ ] Role selection screen
- [ ] KYC upload ও admin approval flow
- [ ] Profile setup page

---

## Phase 2 — Property Listing (Week 3)

### Goals
Seller property list করতে পারবে, Buyer দেখতে পারবে।

### Features to Build

**2.1 Seller: Property Listing Form**
- Property details form (type, price, location, area, amenities)
- Multiple image/video upload (Supabase Storage)
- Unit management (কয়টা flat/unit আছে)
- Draft save ও publish system
- KYC verified না হলে publish block

**2.2 Seller: Inventory Dashboard**
- প্রতিটা property-তে: Total / Sold / Booked / Available counter
- Visual progress bar
- Unit-level status management

**2.3 Buyer: Property Search**
- Advanced search: location, price range, type, amenities
- Filter sidebar
- Property cards (image, price, location)
- Property detail page

### API Endpoints
```
POST   /properties
GET    /properties (with filters)
GET    /properties/:id
PUT    /properties/:id
DELETE /properties/:id
POST   /properties/:id/images
GET    /properties/:id/units
PUT    /properties/:id/units/:unitId
```

### Deliverables
- [ ] Seller listing form সম্পূর্ণ
- [ ] Image/video upload কাজ করছে
- [ ] Buyer search page কাজ করছে
- [ ] Property detail page

---

## Phase 3 — Booking & Installment System (Week 4)

### Goals
Buyer property book করতে পারবে, installment track করতে পারবে।

### Features to Build

**3.1 Booking Engine**
- Full payment booking
- Installment-based booking
- Rental request
- Advance payment amount সেট করা

**3.2 Installment Management**
- Installment schedule তৈরি (কত কিস্তি, কতদিন পর পর)
- Due date tracking
- Payment mark করা
- Auto receipt generate করা (PDF)

**3.3 Booking Status**
- Buyer: আমার সব booking দেখা
- Seller: কোন unit কে book করেছে দেখা
- Status update: Pending → Confirmed → Completed

### API Endpoints
```
POST /bookings
GET  /bookings (buyer's own)
GET  /bookings/:id
PUT  /bookings/:id/status
GET  /bookings/:id/installments
PUT  /installments/:id/pay
GET  /installments/:id/receipt
```

### Deliverables
- [ ] Booking form কাজ করছে
- [ ] Installment schedule দেখাচ্ছে
- [ ] Receipt generate হচ্ছে
- [ ] Buyer booking dashboard

---

## Phase 4 — Agent & Commission System (Week 5-6)

### Goals
Agent ecosystem সম্পূর্ণরূপে কাজ করবে।

### Features to Build

**4.1 Agent Apply/Bid System**
- Agent সব available listing দেখবে
- Apply করবে একটা listing-এ
- Seller approve/reject করবে

**4.2 Commission Deal Negotiation**
- Seller deal offer করবে: % commission বা fixed amount
- Deadline set করবে (e.g., 90 দিন)
- Agent accept/counter করবে

**4.3 Auto-Branding**
- Agent approved হলে property landing page-এ agent-এর ছবি + নম্বর automatically দেখাবে
- "Contact Agent" section

**4.4 Commission Calculation**
- Deal সফল হলে auto-calculate: sale amount × commission %
- Platform cut বাদ দিয়ে agent-এর wallet-এ জমা

**4.5 Agent Earnings Wallet**
- Wallet balance দেখা
- Transaction history
- Withdraw request করা (bank details সহ)

**4.6 Admin: Withdraw Approval**
- Pending withdraw requests দেখা
- Approve → payment করা → status update

### API Endpoints
```
POST /agent-listings/apply
PUT  /agent-listings/:id/approve
POST /commission-deals
PUT  /commission-deals/:id/accept
POST /commissions/calculate
GET  /wallet/balance
GET  /wallet/transactions
POST /wallet/withdraw
PUT  /wallet/withdraw/:id/approve
```

### Deliverables
- [ ] Agent apply flow সম্পূর্ণ
- [ ] Commission deal negotiation
- [ ] Auto-branding property page-এ
- [ ] Wallet ও withdraw system

---

## Phase 5 — Project Updates & Landing Page Builder (Week 7)

### Goals
Seller project update post করতে পারবে, landing page বানাতে পারবে।

### Features to Build

**5.1 Project Update Feed**
- Seller construction update post করবে (title + description + photos/videos)
- Buyer নিজের invest করা project-এর updates feed দেখবে
- Update types: progress, announcement, milestone

**5.2 Landing Page Builder**
- Drag & drop sections: Header, Gallery, Map, Features, Contact
- Section content edit করা
- Custom slug set করা (domain.com/projects/project-name)
- Publish/unpublish toggle
- Public page কোনো login ছাড়াই দেখা যাবে

### API Endpoints
```
POST /projects/:id/updates
GET  /projects/:id/updates
GET  /projects/:slug/public
POST /landing-pages
PUT  /landing-pages/:id
PUT  /landing-pages/:id/publish
GET  /p/:slug (public landing page)
```

### Deliverables
- [ ] Project update post ও feed
- [ ] Buyer project feed dashboard
- [ ] Landing page builder UI
- [ ] Public landing page দেখা যাচ্ছে

---

## Phase 6 — Real-time Chat & Notifications (Week 8)

### Goals
Real-time communication সম্পূর্ণ।

### Features to Build

**6.1 In-App Chat**
- Buyer ↔ Agent chat
- Supabase Realtime দিয়ে live messages
- Chat list ও message thread
- Read/unread status

**6.2 WhatsApp Bridge**
- Property page-এ "WhatsApp করুন" button
- Agent-এর WhatsApp number-এ deep link

**6.3 Push Notifications**
- Booking confirmed হলে buyer-কে notification
- Commission approved হলে agent-কে notification
- Task completed হলে admin-কে notification
- KYC approved/rejected হলে user-কে notification

### Deliverables
- [ ] Real-time chat কাজ করছে
- [ ] WhatsApp button property page-এ
- [ ] Notification center
- [ ] Unread count badge

---

## Phase 7 — Admin ERP (Week 9-10)

### Goals
Internal company management সম্পূর্ণ।

### Features to Build

**7.1 Super Admin Dashboard**
- Total users, properties, bookings, revenue overview
- User management (edit, block, delete)
- KYC approval queue
- Audit trail (কে কী করেছে)
- SOP & Policy pages manage করা

**7.2 HR Admin**
- Employee list ও profile
- Recruitment form (new employee add)
- Appointment letter generate (PDF)
- Monthly payroll calculation (base + bonus - deductions)
- KPI tracking (leads, sales, tasks per month)
- Graphical KPI dashboard

**7.3 Accounts Admin**
- Expense entry (category + amount + receipt)
- Ledger view (income vs expense)
- Commission payment approvals
- Monthly financial summary

### API Endpoints
```
GET  /admin/overview
GET  /admin/users
PUT  /admin/users/:id/block
GET  /admin/kyc/queue
PUT  /admin/kyc/:id/approve
GET  /admin/audit-logs

POST /hr/employees
GET  /hr/employees
POST /hr/payroll/generate
GET  /hr/payroll
GET  /hr/kpi/:userId

POST /accounts/expenses
GET  /accounts/ledger
GET  /accounts/summary
```

### Deliverables
- [ ] Super admin dashboard
- [ ] KYC approval panel
- [ ] Audit log viewer
- [ ] HR management module
- [ ] Payroll ও KPI system
- [ ] Accounts/ledger module

---

## Phase 8 — Project Management & Kanban (Week 10)

### Goals
Internal task management system।

### Features to Build

**8.1 Kanban Board**
- To-do, In-progress, Completed columns
- Drag & drop tasks between columns
- Task cards (title, assignee, due date, priority)

**8.2 Task Management**
- HR/Admin নতুন task create করবে
- নির্দিষ্ট employee-কে assign করবে
- Priority set করবে (low/medium/high)
- Due date দেবে

**8.3 Completion Notification**
- Task completed হলে super admin-এর কাছে push notification

### Deliverables
- [ ] Kanban board drag & drop কাজ করছে
- [ ] Task create ও assign
- [ ] Completion notification

---

## Phase 9 — Monetization & Subscription (Week 11)

### Goals
Revenue system implement করা।

### Features to Build

**9.1 Seller Subscription**
- Plan selection: Basic / Pro / Enterprise
- Payment gateway: SSLCommerz (Bangladesh)
- Subscription active না হলে listing publish block

**9.2 Featured Listing**
- Seller extra pay করে property "Featured" করবে
- Featured listings search-এর top-এ দেখাবে

**9.3 Agent Premium**
- Agent premium নিলে বেশি listings-এ apply করতে পারবে

### Deliverables
- [ ] Subscription plan page
- [ ] SSLCommerz payment integration
- [ ] Featured listing system
- [ ] Agent premium toggle

---

## Phase 10 — Testing, Polish & Deployment (Week 12)

### Goals
Production-ready করা।

### Tasks

**Testing**
- [ ] All API endpoints test করা
- [ ] Role-based access test করা (buyer can't access seller routes)
- [ ] Payment flow test করা
- [ ] Realtime features test করা
- [ ] Mobile responsive check করা

**Security**
- [ ] RLS policies সব table-এ enable
- [ ] JWT token validation
- [ ] Input validation সব endpoints-এ
- [ ] File upload size/type restriction

**Performance**
- [ ] Image optimization (Next.js Image)
- [ ] Database indexes add করা
- [ ] API response caching

**Deployment**
- [ ] Vercel-এ Next.js deploy
- [ ] Railway/Render-এ NestJS deploy
- [ ] Supabase production instance
- [ ] Custom domain connect
- [ ] SSL certificate

---

## Summary Timeline

| Phase | Week | Module |
|-------|------|--------|
| 0 | 1 | Project Setup |
| 1 | 2 | Auth System |
| 2 | 3 | Property Listing |
| 3 | 4 | Booking & Installment |
| 4 | 5-6 | Agent & Commission |
| 5 | 7 | Project Updates & Landing Page |
| 6 | 8 | Chat & Notifications |
| 7 | 9-10 | Admin ERP |
| 8 | 10 | Kanban & Task Management |
| 9 | 11 | Monetization |
| 10 | 12 | Testing & Deployment |

**Total: ~12 weeks (3 months)**
