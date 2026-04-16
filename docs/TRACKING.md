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
- [x] Next.js project initialize (v16.2.1)
- [x] Tailwind CSS + shadcn/ui setup
- [x] NestJS project initialize
- [x] Supabase project create
- [x] Database schema run (Supabase SQL editor)
- [x] Storage buckets তৈরি (`avatars`, `kyc-docs`, `property-images`, `project-updates`, `receipts`)
- [x] Environment variables (.env) configure
- [x] Git repository initialize

---

## Phase 1 — Authentication System

### Supabase Auth Config
- [ ] OTP (SMS) provider enable — পরে করবো
- [x] Google OAuth provider enable ✅

### Frontend
- [ ] Login page (OTP flow) — পরে করবো
- [x] Google login button ✅
- [ ] OTP verify screen — পরে করবো
- [x] Role selection screen ✅ `/auth/role`
- [x] KYC upload page ✅ `/auth/kyc` (server-side upload via API route)
- [x] Profile setup page ✅ `/auth/profile-setup`
- [x] Auth proxy (route protection) ✅ `proxy.ts`
- [x] Role-based dashboards ✅ `/buyer/dashboard`, `/seller/dashboard`, `/agent/dashboard`, `/admin/dashboard`

### Backend (NestJS)
- [x] Auth module তৈরি ✅
- [x] JWT strategy implement ✅
- [x] RBAC guard তৈরি ✅
- [x] KYC upload endpoint ✅ (via Next.js API route `/api/kyc/upload`)
- [x] Profile update endpoint ✅

### Admin
- [x] KYC approval queue page ✅ `/admin/kyc`
- [x] Approve / Reject KYC ✅
- [x] Verified badge assign ✅

---

## Phase 2 — Property Listing

### Seller
- [x] Property listing form ✅ `/seller/listings/new`
- [x] Image upload (Supabase Storage) ✅
- [x] Unit management (floor/unit numbers) ✅
- [x] Draft save ✅
- [x] Publish (KYC check) ✅
- [x] Edit / delete listing ✅
- [x] Inventory dashboard ✅ `/seller/inventory/[id]`
- [x] Listings management ✅ `/seller/listings`

### Buyer
- [x] Property search page ✅ `/buyer/search`
- [x] Advanced filter sidebar ✅ (Suspense-wrapped)
- [x] Property card component ✅
- [x] Property detail page ✅ `/properties/[id]`
- [x] Image gallery / video player ✅

### Backend (NestJS)
- [x] Property CRUD endpoints ✅
- [x] Image upload endpoint ✅
- [x] Search + filter query ✅
- [x] Unit management endpoints ✅

---

## Phase 3 — Booking & Installment

### Frontend
- [x] Booking request form ✅ `/buyer/bookings/new`
- [x] Booking type selector (full / installment / rent) ✅
- [x] Installment schedule view ✅
- [x] Payment mark করার UI ✅
- [x] Receipt print button ✅ (client component `PrintButton`)
- [x] Print CSS fix ✅ (`#receipt-wrapper`)
- [x] Buyer booking dashboard ✅ `/buyer/bookings`
- [x] Seller booking management ✅ `/seller/bookings`

### Backend (NestJS)
- [x] Booking create endpoint ✅
- [x] Installment schedule auto-generate ✅
- [x] Payment mark endpoint ✅
- [x] Receipt page (print-ready) ✅ `/buyer/bookings/[id]/receipt/[installmentId]`
- [x] Inventory auto-update on booking ✅

---

## Phase 4 — Agent & Commission System

### Frontend — Agent
- [x] Listings browse page ✅ `/agent/listings`
- [x] Apply to listing button ✅ (direct Supabase insert)
- [x] My applications list ✅ (tab in `/agent/listings`)
- [x] Commission deals view ✅ `/agent/commissions`
- [x] Accept / counter deal UI ✅
- [x] Agent dashboard ✅ `/agent/dashboard`
- [x] Wallet balance page ✅ `/agent/wallet`
- [x] Transaction history ✅
- [x] Withdraw request form ✅

### Frontend — Seller
- [x] Agent applications list ✅ `/seller/agents`
- [x] Approve / reject agent ✅
- [x] Commission deal offer form ✅ (inline in `/seller/agents`)

### Frontend — Admin
- [x] Withdrawal approval queue ✅ `/admin/withdrawals`
- [x] Approve / reject withdraw ✅

### Auto-Branding
- [x] Approved agent info on property detail page ✅ `/properties/[id]`
- [x] WhatsApp deep link button ✅

### Backend (NestJS)
- [x] AgentsModule তৈরি ✅
- [x] Agent apply endpoint ✅ `POST /agent-listings/apply`
- [x] Seller review endpoint ✅ `PUT /agent-listings/:id/review`
- [x] Commission deal create ✅ `POST /commission-deals`
- [x] Agent respond to deal ✅ `PUT /commission-deals/:id/respond`
- [x] Wallet balance + transactions ✅ `GET /wallet`
- [x] Withdraw request ✅ `POST /wallet/withdraw`
- [x] Admin withdraw approval ✅ `PUT /admin/withdraw-requests/:id/review`

---

## Phase 5 — Project Updates & Landing Page Builder

### Project Updates
- [x] Seller project create form ✅ `/seller/projects/new`
- [x] Seller projects list ✅ `/seller/projects`
- [x] Update post form (title + description + type) ✅ `/seller/projects/[id]/updates`
- [x] Progress slider (0–100%) ✅
- [x] Update delete ✅
- [x] Buyer project feed page ✅ `/buyer/projects`
- [x] Update card component (progress / announcement / milestone) ✅

### Landing Page Builder
- [x] Section components (Hero, Gallery, Features, Location, Contact) ✅
- [x] Section reorder (up/down) ✅
- [x] Section content editor ✅ (inline per-section)
- [x] Custom slug input ✅
- [x] Publish / unpublish toggle ✅
- [x] Public landing page route ✅ `/projects/[slug]` (no auth required)

### Backend (NestJS)
- [x] ProjectsModule ✅
- [x] Create/update project ✅
- [x] Post/delete update ✅
- [x] Upsert landing page ✅
- [x] Publish/unpublish ✅
- [x] Public page by slug ✅
- [x] Buyer feed ✅

---

## Phase 6 — Real-time Chat & Notifications

### Chat
- [x] Chat list page ✅ `/buyer/chat`, `/agent/chat`
- [x] Message thread page ✅ `/buyer/chat/[id]`, `/agent/chat/[id]`
- [x] Supabase Realtime subscription ✅ (`ChatThread` client component)
- [x] Send message ✅ (direct Supabase insert from client)
- [x] Read receipt update ✅ (`is_read` auto-mark on receive)
- [x] WhatsApp button on property page ✅ (done in Phase 4)
- [x] Start Chat button on property detail page ✅ (`StartChatButton` client component)

### Notifications
- [x] Notification center page ✅ `/buyer/notifications`, `/agent/notifications`, `/seller/notifications`, `/admin/notifications`
- [x] Unread badge count ✅ (buyer & agent dashboards)
- [x] Booking notification ✅ (seller notified on new booking)
- [x] Commission notification ✅ (agent notified on deal offer & approval; seller on deal response)
- [x] KYC notification ✅ (user notified on approve/reject)
- [ ] Task completion notification — Phase 8-এ করবো

---

## Phase 7 — Admin ERP

### Super Admin
- [x] Overview dashboard (stats) ✅ `/admin/dashboard` (stats + all section links)
- [x] User list + search ✅ `/admin/users`
- [x] User edit / block / delete ✅ (`UserListClient`)
- [x] KYC queue + approval ✅ (done in Phase 1)
- [x] Audit log viewer ✅ `/admin/audit`
- [x] SOP & Policy pages ✅ `/admin/sop`

### HR Admin
- [x] Employee list page ✅ `/admin/hr/employees`
- [x] Add new employee form ✅ (inline form in employees page)
- [x] Appointment letter generate (PDF) ✅ `/admin/hr/employees/[id]/letter` (print-ready)
- [x] Payroll calculation form ✅ `/admin/hr/payroll` (auto net calc)
- [x] Payroll history ✅ (same page, mark paid toggle)
- [x] KPI input form ✅ `/admin/hr/kpi`
- [x] KPI dashboard (charts) ✅ (CSS bar chart leaderboard)

### Accounts Admin
- [x] Expense entry form ✅ `/admin/accounts/expenses`
- [x] Expense list / filter ✅ (category filter)
- [x] Ledger page (income vs expense) ✅ `/admin/accounts/ledger`
- [x] Commission approval list ✅ `/admin/accounts/commissions`
- [x] Monthly summary report ✅ `/admin/accounts/summary`

---

## Phase 8 — Project Management (Kanban)

- [x] Kanban board layout (3 columns) ✅ `/admin/kanban` (Todo / In Progress / Completed)
- [x] Task card component ✅ (inline in `KanbanBoard.tsx`)
- [x] Drag & drop ✅ (native HTML5 drag API — dnd-kit ছাড়া)
- [x] Create task form ✅ (inline form)
- [x] Assign task to employee ✅ (dropdown)
- [x] Priority badge ✅ (Low / Medium / High with color coding)
- [x] Due date picker ✅ (overdue হলে red warning)
- [x] Task completion → notification to super admin ✅

---

## Phase 9 — Monetization

- [x] Subscription plan selection page ✅ `/seller/billing` (Free/Pro/Business, monthly/yearly toggle)
- [x] SSLCommerz payment integration ✅ `lib/sslcommerz.ts` (init, validate, callback, IPN)
- [x] Subscription active check on publish ✅ (PropertyForm checks max_listings before publish)
- [x] Featured listing toggle + payment ✅ `BoostListingButton` (৳500/30 days via SSLCommerz)
- [x] Agent premium account toggle ✅ `/agent/upgrade` (1mo/6mo/12mo plans)
- [x] Payment history page ✅ (integrated in `/seller/billing`)
- [x] Payment API routes ✅ `/api/payments/init`, `/api/payments/callback`, `/api/payments/ipn`
- [x] Monetization DB schema ✅ `docs/migration_monetization.sql` (subscription_plans, subscriptions, payments tables)

---

## Phase UI-1 — World-Class Landing Page (2026 Design)

> Design spec: `docs/UI_UX_DESIGN_SYSTEM.md`
> Stack: Framer Motion, Lenis, Cormorant Garamond + DM Sans, Dark luxury theme

### Setup & Foundation
- [x] Google Fonts import (Cormorant Garamond + DM Sans + DM Mono) → `app/layout.tsx` ✅
- [x] CSS variables (color, spacing, radius, keyframes) → `globals.css` ✅
- [x] Tailwind @theme inline update (font, color, animation) ✅
- [x] Framer Motion + Lenis installed ✅
- [x] Framer Motion variants file → `lib/animations.ts` ✅
- [x] Lenis smooth scroll setup → `components/providers/SmoothScroll.tsx` ✅
- [x] Aurora CSS effects (orbs, spotlight, gradient text) ✅

### Navbar
- [x] Transparent → frosted glass on scroll ✅
- [x] Logo + nav links + CTA buttons ✅
- [x] Mobile hamburger → slide-in drawer (spring animation) ✅
- [x] Active link underline animation ✅

### Hero Section
- [x] Full viewport dark bg with Aurora mesh gradient ✅
- [x] Cursor spotlight effect (mouse-follow radial gradient) ✅
- [x] Headline word-by-word reveal animation (Framer Motion stagger) ✅
- [x] Hero glassmorphism search bar (Location + Type + Budget) ✅
- [x] Floating stat cards (3x glass cards, `float` animation) ✅
- [x] Floating property preview card (building silhouette) ✅
- [x] CTA buttons (gold primary + ghost secondary) ✅
- [x] Scroll indicator (animated chevron) ✅

### Trust Bar
- [x] Logo marquee strip (infinite scroll animation) ✅
- [x] "Featured In" label (small caps, gold) ✅

### Features — Bento Grid
- [x] 12-column bento grid layout ✅
- [x] 6 feature cards (AI Matching, Analytics, CRM, Virtual Tours, Reports, Mobile) ✅
- [x] Scroll-triggered reveal (stagger per card) ✅
- [x] Hover: gold border glow + translateY ✅

### Property Showcase Section
- [x] Section heading + filter tabs (All / Sale / Rent / Commercial) ✅
- [x] 3-column property card grid (dark theme, building gradient) ✅
- [x] Card: image hover, price in `font-price` gold, badges ✅
- [x] Filter tab animation (AnimatePresence fade + stagger) ✅
- [x] "View All →" link ✅

### How It Works Section
- [x] 3-step horizontal layout ✅
- [x] Connecting line with gold gradient ✅
- [x] Large background step numbers (low opacity, font-display) ✅
- [x] Scroll-triggered step reveal (stagger) ✅

### Testimonials Section
- [x] 6 testimonial cards grid ✅
- [x] Card: quote (Cormorant italic), name, stars (gold), avatar ✅

### Pricing Section
- [x] 3-column cards (Free / Pro ৳999 / Business ৳2999) ✅
- [x] Monthly/Annual toggle with "Save 20%" badge ✅
- [x] Middle card: gold gradient border + scale(1.03) ✅
- [x] Feature checklist with gold checkmarks ✅

### Final CTA Banner
- [x] Full-width Aurora section ✅
- [x] Floating blur orbs background ✅
- [x] Word-reveal headline + subtext + 2 buttons ✅

### Footer
- [x] 4-column grid (Logo+contact | Product | Company | Legal) ✅
- [x] Gold divider top border ✅
- [x] Social icons + language switcher (EN / বাংলা) ✅
- [x] Bottom copyright strip ✅

### Page-Level Polish
- [x] `app/page.tsx` — landing page composed (redirect removed) ✅
- [x] Build passes (Next.js production build ✅)
- [ ] Mobile responsive test (375px, 768px, 1280px)
- [ ] Lighthouse performance check (target > 90)

---

## Phase UI-2 — World-Class Dashboard Redesign (2026 Design)

> Applies to: Buyer, Seller, Agent, Admin dashboards + all inner pages
> Design spec: `docs/UI_UX_DESIGN_SYSTEM.md` — Dashboard section

### Foundation
- [x] Dark surface layout applied to all dashboard routes
- [x] CSS variables active in dashboard context
- [x] Sidebar component rebuild → `components/layout/Sidebar.tsx`
- [x] Top bar component → `components/layout/TopBar.tsx`
- [x] Dashboard layout wrapper → per-role layout shells (`/buyer`, `/seller`, `/agent`, `/admin`)

### Sidebar
- [x] Dark surface bg, gold active item (left border + text + bg glow)
- [x] Icon + label nav items (Lucide icons, 20px)
- [x] Section group labels (small caps, text-tertiary)
- [x] Collapsed icon-only mode (64px)
- [x] Mobile: slide-out drawer

### Stat Cards
- [x] New `StatCard` component → `components/ui/StatCard.tsx`
- [x] Gold top border on hover (::after animation)
- [x] Count-up animation on mount (Framer Motion or requestAnimationFrame)
- [x] Trend indicator (up = emerald, down = rose)
- [x] Icon slot (colored bg pill)

### Property Cards (Dashboard version)
- [x] Dark theme property card → `components/ui/PropertyCard.tsx`
- [x] Price in `font-mono` + gold color
- [x] Status badges (Active / Pending / Sold) styled
- [x] Hover: translateY(-4px) + shadow intensify

### Data Tables
- [x] Dark theme table (surface/surface-raised alternating rows)
- [x] Row hover highlight
- [x] Action buttons appear on hover (icon buttons)
- [x] Sortable column headers
- [x] Mobile: card view fallback

### Charts (recharts)
- [x] Custom dark theme recharts config → `lib/chart-theme.ts`
- [x] Colors: gold #C9A96E, blue #3B82F6, emerald #10B981
- [x] Area chart (buyer activity, seller views)
- [x] Bar chart (revenue, KPI)

### Forms (Dashboard)
- [x] Input, Select, Textarea — dark theme
- [x] Gold focus ring (`box-shadow: 0 0 0 3px var(--color-accent-glow)`)
- [x] Label styling (small caps, text-tertiary)
- [x] Error state (rose border + helper text)
- [x] Multi-step form progress bar (seller listing)

### Role-Specific Pages
- [x] Buyer dashboard — search bar prominent, recommended cards horizontal scroll
- [x] Seller dashboard — listings table + performance chart + add property CTA
- [x] Agent dashboard — commission pipeline + chat list
- [x] Admin dashboard — stats grid + user growth chart + recent activity

### Auth Pages (Redesign)
- [x] Login page — dark split screen (brand left / form right)
- [x] Role selection — card grid with gold selected state
- [x] KYC upload — dark dropzone, progress bar
- [x] Profile setup — clean stepped form

### Notifications & Chat
- [x] Notification dropdown — dark glass panel, unread dot
- [x] Chat thread — dark bubbles (sent = gold/dark, received = surface-raised)
- [x] Chat list — dark with unread count badge

### Global Polish
- [x] Loading skeletons (dark shimmer) for all async data
- [x] Toast notifications (dark bg, colored left border)
- [x] Empty states (illustration + CTA, dark themed)
- [x] 404 / error pages (dark themed)
- [ ] Mobile responsive all dashboard pages

---

## Phase 11 — New Features & Production Hardening

### Security & SEO
- [x] KYC auto-approval bug fixed — now pending, requires admin review ✅
- [x] RLS policies written for all 24 tables ✅ `docs/enable_rls.sql`
- [x] Rate limiting on API routes (bookings 5/min, KYC 3/10min) ✅ `lib/rate-limit.ts`
- [x] Dynamic SEO metadata (`generateMetadata`) on `/properties/[id]` and `/projects/[slug]` ✅
- [x] sitemap.ts (auto-generates property + project URLs) ✅
- [x] robots.ts (blocks dashboard/API, allows public) ✅
- [x] Root layout OG + Twitter card metadata ✅
- [x] Title template (`%s | Sirat Properties`) ✅

### Buyer Features
- [x] Wishlist / Saved Properties — API, SaveButton, `/buyer/saved` page, sidebar link ✅
- [x] Property Compare — CompareContext, CompareButton, floating CompareBar, `/buyer/compare` side-by-side grid ✅
- [x] Property Map View — Leaflet + CARTO dark tiles, gold markers, Grid/Map toggle on search page ✅

### Email System
- [x] Resend integration with 7 dark-themed email templates ✅ `lib/email.ts`
- [x] Booking created → buyer + seller emails ✅
- [x] Booking status changed → buyer email ✅
- [x] Installment paid → buyer email ✅
- [x] KYC approved/rejected → user email ✅
- [x] Welcome email on profile setup completion ✅

### Performance & Polish
- [x] next/image optimization (PropertyCard, property detail page) ✅
- [x] next.config.ts configured for Supabase storage images ✅
- [x] Dynamic code splitting for KanbanBoard ✅
- [x] Loading skeletons for /buyer/saved and /buyer/compare ✅
- [x] Property detail page full dark theme rewrite ✅
- [x] Admin KYC page dark theme rewrite ✅
- [x] PropertyCard dark theme fix (was light) ✅
- [x] Features section updated with real features (was fake AI/VR) ✅
- [x] Landing Page Builder showcase section added to homepage ✅

### Landing Page Builder Upgrade
- [x] 3 pre-built templates (Luxury Dark, Modern Clean, Minimal) + Blank Canvas ✅
- [x] 12 section types (was 5): hero, stats, gallery, video, features, floor_plan, pricing, testimonials, faq, location, cta, contact ✅
- [x] HTML5 drag & drop section reordering ✅
- [x] Dark theme builder UI with categorized sidebar ✅
- [x] Public page renderer fully dark luxury themed ✅
- [x] Builder page shell dark themed ✅

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
| Phase 0 — Setup | ✅ Complete | 14/14 |
| Phase 1 — Auth | ✅ Complete (OTP ছাড়া) | 15/17 |
| Phase 2 — Property Listing | ✅ Complete | 16/16 |
| Phase 3 — Booking | ✅ Complete | 14/14 |
| Phase 4 — Agent & Commission | ✅ Complete | 21/21 |
| Phase 5 — Projects & Landing Page | ✅ Complete | 16/16 |
| Phase 6 — Chat & Notifications | ✅ Complete (task notif ছাড়া) | 12/13 |
| Phase 7 — Admin ERP | ✅ Complete | 21/21 |
| Phase 8 — Kanban | ✅ Complete | 8/8 |
| Phase 9 — Monetization | ✅ Complete | 8/8 |
| Phase UI-1 — Landing Page Redesign | ✅ Complete | 37/37 |
| Phase UI-2 — Dashboard Redesign | ✅ Complete | 49/49 |
| Phase 11 — New Features | ✅ Complete | 12/12 |
| Phase 10 — Testing & Deploy | ⏳ Pending | 0/15 |

**Overall: 226 / 261 tasks completed (87%)**

---

## Changelog

| Date | Update |
|---|---|
| 2026-03-30 | Project documentation complete. docs/ folder তৈরি। TRACKING.md শুরু। |
| 2026-03-30 | Phase 0 Dev Setup: Next.js 16.2.1 + shadcn/ui, NestJS, folder structure, env files, git init complete। |
| 2026-03-30 | Phase 1 Auth: Google OAuth, KYC upload (server-side API route), role selection, profile setup, proxy.ts, dashboards সব complete। |
| 2026-03-30 | Phase 2 Property Listing: seller form, image upload, inventory, buyer search + filters, property detail — সব complete। |
| 2026-03-30 | Phase 3 Booking: booking form, installment schedule, receipt (PrintButton fix, print CSS fix), seller booking management — সব complete। |
| 2026-03-30 | Phase 4 Agent & Commission: agent listings browse, apply flow, seller approve/reject, commission deal negotiation, wallet, withdraw request, admin approval, auto-branding — সব complete। |
| 2026-03-31 | Phase 5 Projects & Landing Page: seller project create/manage, update post (progress/announcement/milestone), progress slider, buyer feed, landing page builder (5 section types, reorder, slug, publish), public page — সব complete। |
| 2026-03-31 | Phase 8 Kanban: 3-column board (Todo/In Progress/Completed), task card with priority badge + overdue warning, native HTML5 drag & drop, create task form, assign to employee, due date picker, task completion → super admin notification — সব complete। |
| 2026-03-31 | Phase 7 Admin ERP: user list+block+delete, audit log, SOP page, employees+appointment letter, payroll+history, KPI dashboard (CSS bar chart), expenses+filter, ledger summary, commission release queue, monthly summary report, NestJS HrModule+AccountsModule — সব complete। |
| 2026-03-31 | Phase 6 Chat & Notifications: buyer+agent chat list & thread, Supabase Realtime subscription, StartChatButton on property detail, mark-as-read, notification center (all 4 roles), unread badge on dashboards, KYC/booking/commission notification triggers — সব complete। |
| 2026-03-30 | Bug fixes: Next.js 16 route conflicts fixed (auth/, admin/, buyer/, seller/ prefixes), middleware→proxy.ts migration, TypeScript errors fixed। |
| 2026-03-31 | UI/UX Design System তৈরি: `docs/UI_UX_DESIGN_SYSTEM.md` — dark luxury theme, Cormorant Garamond typography, gold accent, aurora effects, bento grid, framer motion variants, role-specific dashboard specs, anti-patterns, quality checklist। |
| 2026-03-31 | Phase UI-1 (Landing Page) + Phase UI-2 (Dashboard) TRACKING-এ যোগ করা হয়েছে। মোট 72টি নতুন task। |
| 2026-03-31 | Phase UI-1 Landing Page build complete: Navbar (glass scroll), HeroSection (aurora + cursor spotlight + word reveal + floating card), TrustBar (marquee), FeaturesSection (bento grid), PropertyShowcase (filter tabs + dark cards), HowItWorks (3-step), Testimonials, PricingSection (toggle), CTABanner, Footer. Fonts: Cormorant Garamond + DM Sans + DM Mono. Framer Motion + Lenis installed. Build passes. |
| 2026-03-31 | Phase UI-2 dashboard redesign started: shared dark dashboard shell shipped for buyer/seller/agent/admin routes, Sidebar + TopBar + StatCard + dashboard PropertyCard built, auth flow redesigned (login/role/KYC/profile setup), dark chat list/thread shipped, and production build passes. |
| 2026-03-31 | Phase UI-2 polish continued: recharts-based dashboard charts added (buyer activity, seller performance, admin user growth/revenue), topbar notification dropdown shipped, route-level loading skeletons added, dark toast system wired, and custom 404/global error pages added. Build passes. |
| 2026-03-31 | Phase UI-2 seller operations polish: sortable seller listings table shipped with mobile card fallback, listing creation flow redesigned into a stepped dark experience with progress tracking, inventory manager refreshed, and seller bookings/agent management pages aligned to the new dashboard system. Build passes. |
| 2026-04-09 | Auth pages redesigned: AuthShell with decorative property card mockup, aurora orbs, step progress bar. GoogleLoginButton shimmer. RoleSelector color-coded cards. ProfileSetupForm streamlined. KYC form updated. |
| 2026-04-09 | Booking system dark theme: BookingForm, InstallmentSchedule rewritten to dark dashboard classes. |
| 2026-04-09 | Landing Page Builder upgraded: 3 pre-built templates, 12 section types (stats, pricing, FAQ, video, floor_plan, testimonials, CTA + original 5), drag & drop, dark theme builder UI, dark luxury public renderer. |
| 2026-04-09 | Features section fixed: replaced fake features (AI Matching, Virtual Tours) with real product features (Agent Commission, Booking, ERP, Chat, KYC, Landing Pages). |
| 2026-04-09 | LandingPageBuilderSection added to homepage — browser mockup showing builder in action. |
| 2026-04-09 | Security: KYC auto-approval bug fixed (now pending), RLS policies for 24 tables, rate limiting on API routes. |
| 2026-04-09 | SEO: generateMetadata on property/project pages, OG+Twitter cards, sitemap.ts, robots.ts, title template. |
| 2026-04-09 | Buyer features: Wishlist (save/unsave API + /buyer/saved page), Property Compare (CompareContext + floating bar + /buyer/compare grid), Map View (Leaflet + CARTO dark tiles + Grid/Map toggle). |
| 2026-04-09 | Email system: Resend integration, 7 templates (booking, status, installment, KYC, welcome), wired into all API routes. |
| 2026-04-09 | Performance: next/image on PropertyCard + detail page, dynamic code splitting for KanbanBoard, loading skeletons for new pages. |
| 2026-04-09 | Property detail page + Admin KYC page full dark theme rewrite. PropertyCard dark theme fix. |
