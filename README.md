# সিরাত প্রপার্টিজ — Real Estate OS SaaS

## Project Files

| File | Description |
|---|---|
| `PRODUCT_CONTEXT.md` | Product overview, target users, value proposition, monetization |
| `FEATURES.md` | Complete feature checklist (all modules) |
| `ARCHITECTURE.md` | System architecture, tech stack, data flow, security |
| `DATABASE_SCHEMA.md` | All 29 PostgreSQL tables with full SQL schema |
| `PHASE_PLAN.md` | 12-week development roadmap, phase-by-phase tasks |

## Quick Start

```bash
# Frontend
npx create-next-app@latest sirat-properties --typescript --tailwind --app
cd sirat-properties
npx shadcn-ui@latest init
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers

# Backend
npm i -g @nestjs/cli
nest new sirat-properties-api
npm install @supabase/supabase-js @nestjs/config @nestjs/jwt passport passport-jwt
npm install class-validator class-transformer
```

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS + shadcn/ui
- **Backend:** NestJS
- **Database:** PostgreSQL via Supabase
- **Auth:** Supabase Auth (OTP + Google)
- **Realtime:** Supabase Realtime
- **Storage:** Supabase Storage
- **Deploy:** Vercel + Railway + Supabase
