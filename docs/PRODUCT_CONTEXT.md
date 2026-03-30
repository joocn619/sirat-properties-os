# PRODUCT_CONTEXT.md — সিরাত প্রপার্টিজ Real Estate OS

## Overview

সিরাত প্রপার্টিজ Real Estate OS হলো একটি **Full-Stack SaaS Platform** যা একটি real estate company-র সম্পূর্ণ business operation digitally পরিচালনা করতে সক্ষম।

এটি শুধু property listing site নয় — এটি একটি **Unified Operating System** যেখানে:
- Property Marketplace (Buyer side)
- Seller & Developer Dashboard
- Agent Commission Ecosystem
- Internal ERP (HR + Accounts + Operations)
- Project & Task Management Tool

সবকিছু **একটি platform-এ** integrated।

---

## Product Type

- **SaaS Model:** B2B + Marketplace Hybrid
- **Architecture:** Multi-tenant
- **Revenue Model:** Subscription (Sellers) + Commission per sale + Featured listings + Agent premium accounts
- **Primary Market:** Bangladesh real estate companies
- **Secondary Market:** Global emerging markets

---

## Target Users

### 1. Buyer
- Property search ও filter করা
- Book / rent করা
- Installment track করা
- Project construction progress live দেখা
- Agent-এর সাথে chat করা

### 2. Seller / Developer
- Property list করা
- Inventory track করা (Sold / Booked / Available)
- Agent assign করা
- প্রতিটা project-এর জন্য custom landing page বানানো

### 3. Agent
- Property listing-এ apply / bid করা
- Commission deal negotiate করা
- Property বিক্রি করা
- Commission earn করা ও withdraw করা

### 4. Admin / Company
- সব user manage করা
- Finance track করা (Ledger, Expenses)
- HR operations চালানো (Recruitment, Payroll, KPI)
- Audit trail দেখা

---

## Core Value Proposition

1. Manual real estate operations replace করা
2. Complete digital workflow provide করা
3. Live tracking ও transparency নিশ্চিত করা
4. Commission-based agent ecosystem enable করা
5. Scalable SaaS solution হিসেবে কাজ করা

---

## Unique Selling Points

- **Agent Bidding System** — Agent নিজে apply করে, seller approve করে
- **Auto-Branding** — Agent assign হলে তার ছবি + নম্বর property page-এ automatically দেখায়
- **Landing Page Builder** — প্রতিটা project-এর জন্য আলাদা public URL (domain.com/projects/project-name)
- **Project Update Feed** — Buyer তার invest করা project-এর construction progress live দেখতে পায়
- **Built-in ERP** — HR + Accounts + Operations সব এক জায়গায়
- **Unified Platform** — Buyer, Seller, Agent, Admin সবাই একই app-এ

---

## Tech Stack (Final)

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend     | NestJS (separate API server)        |
| Database    | PostgreSQL via Supabase             |
| Auth        | Supabase Auth (OTP + Google OAuth)  |
| Realtime    | Supabase Realtime                   |
| Storage     | Supabase Storage                    |
| Deployment  | Vercel (Frontend) + Railway/Render (NestJS) + Supabase |

---

## Monetization

| Source | Details |
|---|---|
| Monthly Subscription | Seller-রা মাসিক সাবস্ক্রিপশন দেবে |
| Commission per Sale | প্রতিটা সফল deal-এ platform cut |
| Featured Listings | Seller extra pay করে top-এ listing দেখাবে |
| Agent Premium | Agent premium account নিলে বেশি listing access |
