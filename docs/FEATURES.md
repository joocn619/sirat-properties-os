# FEATURES.md — সিরাত প্রপার্টিজ Real Estate OS

## Complete Feature List

---

## 1. Authentication System

- [ ] Mobile OTP login (Supabase Auth)
- [ ] Email OTP login
- [ ] Google One-tap login (OAuth)
- [ ] Role selection screen (Buyer / Seller / Agent)
- [ ] KYC upload: NID বা Trade License (Supabase Storage)
- [ ] Admin KYC review: Approve / Reject
- [ ] Verified badge system
- [ ] Profile: avatar, bio, contact info, social links
- [ ] Block/unblock user (Admin)

---

## 2. Buyer Features

### Property Discovery
- [ ] Advanced search: location, price, type
- [ ] Filters: amenities, area, floor, facing
- [ ] Property type filter: flat, land share, commercial, plot
- [ ] Listing type filter: sale, rent, installment
- [ ] Featured properties at top
- [ ] Property detail page: images, video, map, agent info

### Booking System
- [ ] Full payment booking
- [ ] Installment-based booking
- [ ] Rental request
- [ ] Advance amount set
- [ ] Booking status tracking: Pending → Confirmed
- [ ] Installment schedule view
- [ ] Installment payment mark করা
- [ ] Auto receipt generate (PDF) per installment

### Project Updates
- [ ] Buyer-এর invest করা projects-এর feed
- [ ] Live construction photos/videos দেখা
- [ ] Update types: progress, announcement, milestone

### Interaction
- [ ] In-app chat with agent
- [ ] WhatsApp one-click button (agent-এর সাথে)
- [ ] Notification center

---

## 3. Seller Features

### Listing Management
- [ ] Property listing form (all details)
- [ ] Multiple image upload
- [ ] Video upload
- [ ] Property type selection
- [ ] Amenities checklist
- [ ] Draft save ও publish
- [ ] KYC verified না হলে publish block
- [ ] Edit / delete listing

### Inventory Tracking
- [ ] Unit management (flat numbers, floors)
- [ ] Dynamic counter: Total / Sold / Booked / Available
- [ ] Visual progress bar
- [ ] Unit-level status update
- [ ] Booking history per unit

### Drag & Drop Landing Page Builder
- [ ] Per-project landing page
- [ ] Sections: Header, Gallery, Map, Features, Agent Contact, CTA
- [ ] Drag & drop section reorder
- [ ] Section content edit করা
- [ ] Custom slug URL: domain.com/projects/project-name
- [ ] Publish / unpublish
- [ ] Public access (no login needed)

### Agent Management
- [ ] Agent applications দেখা
- [ ] Approve / reject agent
- [ ] Commission deal offer করা (% বা fixed)
- [ ] Deadline set করা
- [ ] Agent performance দেখা

### Project Updates
- [ ] Construction progress post করা
- [ ] Photos/videos upload
- [ ] Update type set করা

---

## 4. Agent Features

### Listing Access
- [ ] Available listings browse করা
- [ ] Apply / bid করা কোনো listing-এ
- [ ] Application status দেখা

### Commission System
- [ ] Commission deal দেখা (seller-এর offer)
- [ ] Accept / counter-offer করা
- [ ] Deal deadline দেখা
- [ ] Active deals dashboard
- [ ] Auto-branding: property page-এ নিজের ছবি + নম্বর

### Earnings & Wallet
- [ ] Wallet balance দেখা
- [ ] Commission history
- [ ] Transaction details
- [ ] Withdraw request করা (bank details)
- [ ] Withdraw status tracking

### Performance
- [ ] Total sales count
- [ ] KPI score দেখা
- [ ] Monthly performance chart

---

## 5. Wallet & Payments

- [ ] Agent commission wallet
- [ ] Auto credit on deal completion
- [ ] Platform cut auto-deduction
- [ ] Withdraw request with bank details
- [ ] Accounts admin approve/reject
- [ ] Transaction history
- [ ] Seller subscription payment (SSLCommerz)
- [ ] Featured listing payment

---

## 6. Admin System

### Super Admin
- [ ] Overview dashboard (users, properties, revenue)
- [ ] User management (edit, block, delete)
- [ ] KYC approval queue
- [ ] Approve / reject KYC with badge
- [ ] Audit trail (কে কী করেছে, কখন)
- [ ] SOP & Policy management (digital documents)

### HR Admin
- [ ] Employee list ও profiles
- [ ] New employee add করা
- [ ] Appointment letter generate (PDF)
- [ ] Monthly payroll: base + bonus - deductions
- [ ] KPI tracking: leads, sales, tasks per employee
- [ ] Graphical KPI dashboard (monthly comparison)

### Accounts Admin
- [ ] Expense entry (category + amount + receipt)
- [ ] Expense categories: office rent, utilities, salary, marketing
- [ ] Ledger view: income vs expense
- [ ] Commission payment approvals
- [ ] Monthly financial summary
- [ ] Payment approve/reject

---

## 7. Project Management (Internal)

- [ ] Kanban board: To-do / In-progress / Completed
- [ ] Task create করা
- [ ] Task assign করা (specific employee)
- [ ] Priority set করা (low/medium/high)
- [ ] Due date
- [ ] Drag & drop between columns
- [ ] Task completion notification to super admin

---

## 8. Real-time Features

- [ ] In-app chat (Supabase Realtime)
- [ ] Real-time notifications
- [ ] Read/unread message status
- [ ] Unread count badge
- [ ] Live inventory counter update

---

## 9. Security Features

- [ ] RBAC (Role-Based Access Control)
- [ ] JWT authentication
- [ ] Supabase RLS (Row Level Security)
- [ ] Input validation (Zod + class-validator)
- [ ] File upload restriction (type + size)
- [ ] SQL injection protection
- [ ] SSL encryption
- [ ] Audit trail

---

## 10. Monetization Features

- [ ] Seller subscription plans (Basic/Pro/Enterprise)
- [ ] SSLCommerz payment gateway
- [ ] Featured listing upgrade
- [ ] Agent premium account
- [ ] Subscription expiry + renewal reminder
- [ ] Payment history

---

## 11. Public Features (No login required)

- [ ] Project landing pages (domain.com/projects/slug)
- [ ] Property search (limited)
- [ ] Contact agent via WhatsApp
