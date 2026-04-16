# 🏛️ UI/UX DESIGN SYSTEM — REAL ESTATE SAAS
### World-Class Design Language | 2026 Standard | সিরাত প্রপার্টিজ

---

## 📐 OVERVIEW & PHILOSOPHY

This document defines the **complete visual identity, component system, animation language, and interaction design** for this Real Estate SaaS. Every screen — landing page, dashboard, property listings, agent portal, analytics — must follow this system without exception.

**Design Philosophy:**
- **Luxury Minimal** — Space, silence, and precision. Like a premium real estate brand.
- **Motion-First** — Every element earns its place through purposeful animation.
- **Trust through Detail** — Micro-interactions, polished states, and refined typography build credibility.
- **2026 Trending** — Bento grid layouts, mesh gradients, scroll-driven animations, frosted glass, Aurora effects.

> ⚠️ RULE: No generic "SaaS bootstrap" look. Every pixel must feel intentional. If it looks like a template, redo it.

---

## 🎨 COLOR SYSTEM

### Primary Palette
```css
:root {
  /* Brand Core */
  --color-primary:        #0A0A0F;   /* Deep Obsidian — main bg */
  --color-surface:        #111118;   /* Card surfaces */
  --color-surface-raised: #16161F;   /* Elevated cards */
  --color-border:         #1E1E2E;   /* Subtle borders */
  --color-border-active:  #2D2D45;   /* Hover borders */

  /* Accent System */
  --color-accent:         #C9A96E;   /* Warm Gold — primary CTA */
  --color-accent-light:   #E2C99A;   /* Gold hover state */
  --color-accent-dark:    #9A7A4A;   /* Gold pressed state */
  --color-accent-glow:    rgba(201, 169, 110, 0.15); /* Gold glow */

  /* Secondary Accent */
  --color-blue:           #3B82F6;   /* Info / data highlights */
  --color-blue-glow:      rgba(59, 130, 246, 0.12);
  --color-emerald:        #10B981;   /* Success / verified */
  --color-rose:           #F43F5E;   /* Alert / price drop */

  /* Text Hierarchy */
  --text-primary:         #F0EDE8;   /* Main headings */
  --text-secondary:       #9E9AA0;   /* Body / descriptions */
  --text-tertiary:        #5C5866;   /* Metadata / captions */
  --text-inverse:         #0A0A0F;   /* Text on gold bg */

  /* Gradients */
  --gradient-gold:        linear-gradient(135deg, #C9A96E 0%, #E2C99A 50%, #A87B3F 100%);
  --gradient-surface:     linear-gradient(180deg, #16161F 0%, #111118 100%);
  --gradient-aurora:      radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.08) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 60%),
                          radial-gradient(ellipse at 60% 80%, rgba(16,185,129,0.04) 0%, transparent 60%);
  --gradient-hero-mesh:   conic-gradient(from 180deg at 50% 50%,
                            #0A0A0F 0deg, #111118 72deg, #0D0D15 144deg,
                            #0A0A0F 216deg, #111118 288deg, #0A0A0F 360deg);
}
```

### Light Mode (Optional — Secondary Theme)
```css
[data-theme="light"] {
  --color-primary:        #FAFAF8;
  --color-surface:        #FFFFFF;
  --color-surface-raised: #F5F3EE;
  --color-border:         #E8E4DC;
  --color-border-active:  #D4CEBF;
  --text-primary:         #1A1611;
  --text-secondary:       #6B6459;
  --text-tertiary:        #9E9690;
  --gradient-aurora:      radial-gradient(ellipse at 20% 50%, rgba(201,169,110,0.12) 0%, transparent 60%),
                          radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 60%);
}
```

---

## 🔤 TYPOGRAPHY SYSTEM

### Font Stack
```css
/* Import in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@400;500&family=Hind+Siliguri:wght@300;400;500;600&display=swap');

:root {
  /* Display / Editorial — for hero headlines, feature titles */
  --font-display:  'Cormorant Garamond', Georgia, serif;

  /* UI / Body — for all interface text, nav, buttons */
  --font-ui:       'DM Sans', system-ui, sans-serif;

  /* Bengali — proper Unicode support */
  --font-bengali:  'Hind Siliguri', 'Noto Sans Bengali', sans-serif;

  /* Data / Code — for prices, stats, property IDs */
  --font-mono:     'DM Mono', 'Courier New', monospace;
}
```

### Type Scale
```css
:root {
  --text-xs:   0.75rem;    /* 12px — badges, metadata */
  --text-sm:   0.875rem;   /* 14px — captions, labels */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — card titles */
  --text-xl:   1.25rem;    /* 20px — section leads */
  --text-2xl:  1.5rem;     /* 24px — sub-headings */
  --text-3xl:  1.875rem;   /* 30px — page titles */
  --text-4xl:  2.25rem;    /* 36px — hero sub */
  --text-5xl:  clamp(2.5rem, 5vw, 3rem);       /* 48px — hero headline */
  --text-6xl:  clamp(3rem, 6vw, 3.75rem);      /* 60px — landing hero */
  --text-7xl:  clamp(3.5rem, 8vw, 4.5rem);     /* 72px — maximum impact */
}
```

### Typography Rules
- **Hero Headlines** — `font-display`, `font-weight: 300`, `letter-spacing: -0.02em`, `line-height: 1.05`
- **Section Titles** — `font-display`, `font-weight: 500`, `letter-spacing: -0.01em`
- **UI Text / Body** — `font-ui`, `font-weight: 400`, `line-height: 1.6`
- **Bengali Text** — `font-bengali`, `font-weight: 400`, `line-height: 1.8`
- **Navigation** — `font-ui`, `font-weight: 500`, `letter-spacing: 0.02em`, `text-transform: uppercase`, `font-size: 0.75rem`
- **Prices / Stats** — `font-mono`, `font-weight: 500`, color: `var(--color-accent)`
- **CTAs / Buttons** — `font-ui`, `font-weight: 600`, `letter-spacing: 0.04em`, `text-transform: uppercase`

---

## 📏 SPACING & LAYOUT

### Spacing Scale
```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### Layout Grid
```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

.container-wide {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-8);
}

/* Bento Grid — Use for Features, Stats, Property Cards */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Common Bento Patterns */
.bento-hero    { grid-column: span 8; grid-row: span 2; }
.bento-tall    { grid-column: span 4; grid-row: span 2; }
.bento-wide    { grid-column: span 8; grid-row: span 1; }
.bento-square  { grid-column: span 4; grid-row: span 1; }
.bento-full    { grid-column: span 12; }
```

### Border Radius
```css
:root {
  --radius-sm:   6px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-xl:   24px;
  --radius-2xl:  32px;
  --radius-full: 9999px;
}
```

---

## ✨ ANIMATION & MOTION SYSTEM

### Core Easing Curves
```css
:root {
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out:     cubic-bezier(0.45, 0, 0.55, 1);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy */
  --ease-smooth:     cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Animation Durations
```css
:root {
  --duration-fast:    150ms;
  --duration-normal:  300ms;
  --duration-slow:    500ms;
  --duration-xslow:   800ms;
  --duration-hero:    1200ms;
}
```

### Page Load Sequence (Landing Page)
```
Timeline:
0ms    → Navbar fades in (opacity 0→1, translateY -8px→0)
200ms  → Hero eyebrow badge slides in
400ms  → Hero headline reveals word-by-word (stagger 80ms per word)
700ms  → Hero subtext fades up
900ms  → CTA buttons scale in (0.92→1 with spring)
1100ms → Hero property card floats in from right
1300ms → Floating badges animate in (stagger 100ms each)
1600ms → Scroll indicator appears
```

### Scroll-Driven Animations (Required)
Use `IntersectionObserver` or Framer Motion `whileInView`:
```css
/* Fade Up — Default for all section entries */
.animate-fade-up {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity var(--duration-slow) var(--ease-out-expo),
              transform var(--duration-slow) var(--ease-out-expo);
}
.animate-fade-up.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* Scale In — for cards and bento items */
.animate-scale-in {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity var(--duration-slow) var(--ease-out-expo),
              transform var(--duration-slow) var(--ease-out-expo);
}
.animate-scale-in.in-view {
  opacity: 1;
  transform: scale(1);
}
```

### Framer Motion Variants (TypeScript — Reusable)
```typescript
// lib/animations.ts

export const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
}

export const slideFromLeft = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const pageTransition = {
  initial:   { opacity: 0, y: 16 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
}
```

### Hover States (All Interactive Elements)
```css
/* Card hover */
.card {
  transition: transform var(--duration-normal) var(--ease-out-expo),
              box-shadow var(--duration-normal) var(--ease-out-expo),
              border-color var(--duration-normal) var(--ease-smooth);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--color-border-active);
}

/* Button hover */
.btn-primary:hover  { transform: scale(1.02); box-shadow: 0 8px 24px var(--color-accent-glow); }
.btn-primary:active { transform: scale(0.98); }
```

### Special Effects
```css
/* Aurora Background — use on hero section */
.aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-aurora);
  animation: aurora-shift 8s ease-in-out infinite alternate;
}
@keyframes aurora-shift {
  0%   { opacity: 0.6; transform: scale(1) rotate(0deg); }
  100% { opacity: 1;   transform: scale(1.05) rotate(2deg); }
}

/* Floating animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
.float          { animation: float 4s ease-in-out infinite; }
.float-delayed  { animation: float 4s ease-in-out 1s infinite; }
.float-delayed2 { animation: float 4s ease-in-out 2s infinite; }

/* Shimmer loading skeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    var(--color-border) 25%,
    var(--color-border-active) 50%,
    var(--color-border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Infinite marquee */
@keyframes marquee {
  0%   { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}
.marquee { animation: marquee 30s linear infinite; }

/* Gradient border glow on focus/hover */
.glow-border { position: relative; }
.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: var(--gradient-gold);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-smooth);
  z-index: -1;
}
.glow-border:focus-within::before,
.glow-border:hover::before { opacity: 1; }
```

---

## 🧩 COMPONENT LIBRARY

### 1. Buttons
```css
/* Primary — Gold CTA */
.btn-primary {
  background: var(--gradient-gold);
  color: var(--text-inverse);
  padding: 14px 32px;
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--color-accent-glow);
  transition: transform 150ms var(--ease-spring), box-shadow 300ms var(--ease-smooth);
}

/* Secondary — Ghost */
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  padding: 13px 31px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-active);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: 0.04em;
  backdrop-filter: blur(8px);
}

/* Icon Button */
.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--duration-fast) var(--ease-smooth);
}
.btn-icon:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-glow);
}
```

### 2. Cards
```css
/* Base Card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
}

/* Frosted Glass Card */
.card-glass {
  background: rgba(22, 22, 31, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-xl);
}

/* Property Card */
.property-card { cursor: pointer; }
.property-card__image { aspect-ratio: 4/3; overflow: hidden; }
.property-card__image img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 600ms var(--ease-out-expo);
}
.property-card:hover .property-card__image img { transform: scale(1.05); }
.property-card__badge {
  position: absolute; top: 12px; left: 12px;
  background: var(--gradient-gold);
  color: var(--text-inverse);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
}
.property-card__price {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  color: var(--color-accent);
  font-weight: 500;
}
.property-card__title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  color: var(--text-primary);
  font-weight: 500;
}

/* Stat Card — for dashboard */
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--gradient-gold);
  opacity: 0; transition: opacity var(--duration-normal);
}
.stat-card:hover::after { opacity: 1; }
.stat-card__value {
  font-family: var(--font-mono);
  font-size: var(--text-3xl);
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}
.stat-card__label {
  font-size: var(--text-sm); color: var(--text-tertiary);
  margin-top: var(--space-2);
  text-transform: uppercase; letter-spacing: 0.06em;
}
.stat-card__trend {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: var(--text-xs); font-weight: 600;
  padding: 4px 10px; border-radius: var(--radius-full);
  margin-top: var(--space-3);
}
.stat-card__trend--up   { background: rgba(16,185,129,0.1); color: #10B981; }
.stat-card__trend--down { background: rgba(244,63,94,0.1);  color: #F43F5E; }
```

### 3. Navigation
```css
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  padding: var(--space-4) var(--space-8);
  display: flex; align-items: center; justify-content: space-between;
  transition: background var(--duration-normal), backdrop-filter var(--duration-normal), border-color var(--duration-normal);
}
/* Scrolled state — frosted glass */
.navbar.scrolled {
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--color-border);
}
.navbar__logo {
  font-family: var(--font-display);
  font-size: var(--text-xl); font-weight: 600;
  color: var(--text-primary); letter-spacing: -0.02em;
}
.navbar__logo span { color: var(--color-accent); }

.navbar__link {
  font-size: var(--text-sm); font-weight: 500;
  color: var(--text-secondary); text-decoration: none;
  letter-spacing: 0.02em;
  transition: color var(--duration-fast);
  position: relative;
}
.navbar__link::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  width: 0; height: 1px; background: var(--color-accent);
  transition: width var(--duration-normal) var(--ease-out-expo);
}
.navbar__link:hover { color: var(--text-primary); }
.navbar__link:hover::after { width: 100%; }
```

### 4. Form Elements
```css
.input {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  font-family: var(--font-ui);
  font-size: var(--text-base);
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
}
.input::placeholder { color: var(--text-tertiary); }
.input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-glow);
}

/* Hero Search Bar */
.search-hero {
  display: flex; align-items: center; gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-active);
  border-radius: var(--radius-2xl);
  padding: var(--space-3) var(--space-4);
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.search-hero:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px var(--color-accent);
}
```

### 5. Badges & Tags
```css
.badge {
  display: inline-flex; align-items: center; gap: var(--space-1);
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: var(--text-xs); font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.badge--gold    { background: var(--color-accent-glow);   color: var(--color-accent);  border: 1px solid rgba(201,169,110,0.2); }
.badge--blue    { background: var(--color-blue-glow);     color: var(--color-blue);    border: 1px solid rgba(59,130,246,0.2); }
.badge--green   { background: rgba(16,185,129,0.1);       color: #10B981;              border: 1px solid rgba(16,185,129,0.2); }
.badge--outline { background: transparent; border: 1px solid var(--color-border-active); color: var(--text-secondary); }
```

### 6. Dividers
```css
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border) 30%, var(--color-border) 70%, transparent);
  margin: var(--space-16) 0;
}
.divider--gold {
  background: linear-gradient(90deg, transparent, var(--color-accent) 30%, var(--color-accent) 70%, transparent);
  opacity: 0.3;
}
```

---

## 🖥️ LANDING PAGE STRUCTURE

### Section Order & Design Intent

---

#### SECTION 1: HERO
**Goal:** Capture attention in 2 seconds. Luxury real estate energy.

**Layout:**
- Full viewport height (`100dvh`)
- Dark Aurora background with mesh gradient + cursor spotlight effect (mouse-follow radial gradient)
- Centered content layout
- Large editorial headline (display font, weight 300)
- Animated word-by-word text reveal on load
- Hero search bar floating below headline
- Property stat badges floating (animated)
- One large property image card floating on the right with parallax

**Content:**
```
[Badge] ✦ Trusted by 2,000+ Agents Worldwide

[Headline - font-display, 72px, weight 300]
Find Your Next
Premium Property

[Subtext - font-ui, 18px, text-secondary]
The smartest real estate platform for modern agents.
Listings, analytics, and CRM — all in one place.

[Search Bar - glassmorphism pill]
[ 📍 Location ] [ 🏠 Type ] [ 💰 Budget ] [ Search → ]

[Floating Stats — glass cards, animated]
  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐
  │ 12,400+      │  │ 98% Client    │  │ ৳850Cr+      │
  │ Active Lists │  │ Satisfaction  │  │ Deals Closed │
  └──────────────┘  └───────────────┘  └──────────────┘

[Scroll indicator — animated chevron]
```

**Animation:**
- Aurora background continuously shifts (8s loop)
- Property card floats: `animation: float 4s ease-in-out infinite`
- Headline words stagger-reveal on load (80ms per word)
- Stats count up when in view

---

#### SECTION 2: TRUST BAR
**Layout:** Horizontal scrolling logo strip (auto-scroll marquee, infinite loop)
```
[Forbes] [Bloomberg] [The Real Deal] [Daily Star] [Prothom Alo Business]
```
- Grayscale logos → gold tint on hover
- Text above: "Featured In" — small caps, gold accent
- `animation: marquee 30s linear infinite`

---

#### SECTION 3: FEATURES — BENTO GRID
**Goal:** Show what makes this platform powerful.

**Layout:** 12-column Bento grid, 3 rows

```
┌──────────────────────────────┬─────────────────┐
│  AI Property Matching        │  Live Analytics  │
│  (8 cols, 2 rows)            │  Chart preview   │
│  Large hero feature          │  (4 cols, 1 row) │
├──────────────────┬───────────┴─────────────────┤
│  Smart CRM       │  360° Virtual Tours          │
│  (4 cols, 1 row) │  (8 cols, 1 row)             │
├──────────────────┼──────────────┬───────────────┤
│  Auto Reports    │  Mobile App  │  Team Workspace│
│  (4 cols, 1 row) │  (4 cols)   │  (4 cols)      │
└──────────────────┴──────────────┴───────────────┘
```

Each bento card:
- Icon (24px, gold color)
- Title (font-display, 20px)
- Description (font-ui, 14px, text-secondary)
- Hover: border-color → gold, subtle glow, translateY(-4px)

---

#### SECTION 4: PROPERTY SHOWCASE
**Goal:** Show real listings. Builds credibility immediately.

**Layout:**
- Section heading left-aligned: "Featured Properties"
- Filter tabs: All | For Sale | For Rent | Commercial
- 3-column property card grid (2 col tablet, 1 col mobile)
- "View All Properties →" link below

**Animation:** Cards stagger-animate in on scroll (100ms delay each)

---

#### SECTION 5: HOW IT WORKS
**Layout:** Horizontal 3-step flow with connecting line

```
① Create Account    ②  List or Search    ③  Close Deals
[Icon]              [Icon]               [Icon]
[Title]             [Title]              [Title]
[Text]              [Text]               [Text]
    ─────────────────────────────────────────
```
- Connecting line draws on scroll (SVG path animation or CSS width transition)
- Step numbers: large, low-opacity background number (font-display)

---

#### SECTION 6: TESTIMONIALS
**Layout:** Horizontal auto-scroll cards (pause on hover) OR dual-column opposite-speed scroll

Card contains:
- Quote text (font-display, italic, 18px)
- Agent name + company
- Star rating (gold stars)
- Agent photo (circular, 48px)

---

#### SECTION 7: PRICING
**Layout:** 3-column pricing cards

```
┌──────────┐  ┌──────────────────────┐  ┌──────────┐
│ Starter  │  │  Professional ⭐      │  │  Agency  │
│ Free     │  │  ৳999/mo  POPULAR    │  │ ৳2999/mo │
│          │  │  [gold border]       │  │          │
└──────────┘  └──────────────────────┘  └──────────┘
```

- Middle card: gold gradient border, `scale(1.03)`, slight elevation
- Toggle: Monthly / Annual with "Save 20%" badge
- Feature list with ✓ checkmarks in gold

---

#### SECTION 8: CTA BANNER
**Layout:** Full-width dark section with Aurora effect + floating orbs

```
[Large headline - font-display, weight 300]
Ready to Find Your Dream Property?

[Subtext - font-ui, text-secondary]
Join 12,000+ users already on the platform.

[btn-primary: Get Started Free]  [btn-secondary: Watch Demo]
```

---

#### SECTION 9: FOOTER
**Layout:** 4-column grid

```
[Logo + tagline + social]  [Product]  [Company]  [Contact + Language]
```

- Border top: 1px gold divider
- Bottom strip: copyright + legal links
- Background: slightly darker than page bg
- Language switcher: EN / বাংলা

---

## 🖥️ DASHBOARD UI DESIGN

### Sidebar Navigation
```
Width:        260px (desktop) / icon-only 64px (collapsed)
Background:   var(--color-surface)
Border-right: 1px solid var(--color-border)

Active item:  gold left border (3px) + gold text + rgba(gold,0.05) bg
Hover item:   var(--color-surface-raised)
Icons:        Lucide, 20px
Groups:       labeled sections (small caps, text-tertiary, text-xs)
```

### Dashboard Layout
```
┌────────────────────────────────────────────────────┐
│ SIDEBAR (260px)  │  MAIN CONTENT                   │
│                  │  ┌──────────────────────────────┐│
│ ○  Overview      │  │  PAGE HEADER                 ││
│ 🏠 Properties    │  │  Title + breadcrumb          ││
│ 👥 Clients       │  │  + action buttons            ││
│ 📈 Analytics     │  └──────────────────────────────┘│
│ 📊 Reports       │  ┌──────────────────────────────┐│
│ 🔔 Alerts        │  │  STAT CARDS ROW (4 cols)     ││
│ ⚙️  Settings      │  └──────────────────────────────┘│
│                  │  ┌─────────────────┬────────────┐│
│                  │  │  Main Panel     │ Side Panel ││
│                  │  │  (8 cols)       │ (4 cols)   ││
│                  │  └─────────────────┴────────────┘│
└────────────────────────────────────────────────────┘
```

### Role-Specific Dashboard Design

#### Buyer Dashboard
```
Stats row:   Saved Properties | Active Bookings | KYC Status | Wallet Balance
Hero:        Property search bar (prominent, large) + filter chips
Sections:    Recently Viewed (horizontal scroll) | Recommended | Active Bookings
Extras:      "Why this?" tooltip on recommended cards
```

#### Seller Dashboard
```
Stats row:   Total Listings | Active | Under Review | Total Inquiries
Hero:        "+ Add Property" CTA (full-width on empty state, gold gradient)
Table:       My Listings — status badges, edit/view/delete actions
Chart:       Property views over time (area chart, gold line)
```

#### Agent Dashboard
```
Stats row:   Assigned Listings | Active Deals | Commission Earned | Rating
Main:        Commission queue + deal pipeline (kanban view)
Sections:    Buyer inquiries list | Recent chat messages
Extras:      Rating display (gold stars) + earnings trend
```

#### Admin Dashboard
```
Stats row:   Total Users | New Today | Pending KYC | Total Revenue
Sections:    Quick actions grid | Recent registrations | System health indicators
Charts:      User growth (area) + Revenue by month (bar) — gold/blue palette
Table:       Recent activity log
```

### Dashboard Color Usage
- **Stat cards:** Surface bg, gold accent top border on hover
- **Charts:** recharts custom theme — gold `#C9A96E`, blue `#3B82F6`, emerald `#10B981`
- **Tables:** alternating `var(--color-surface)` / `var(--color-surface-raised)`
- **Map:** Dark tile (Mapbox Dark style or Leaflet CartoDB dark_all)

---

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
--bp-sm:  640px;   /* Large mobile */
--bp-md:  768px;   /* Tablet */
--bp-lg:  1024px;  /* Laptop */
--bp-xl:  1280px;  /* Desktop */
--bp-2xl: 1536px;  /* Wide screen */
```

### Rules
- **Mobile:** Single column, stacked cards, bottom nav bar (56px height)
- **Tablet:** 2-column grid, sidebar → bottom sheet on mobile
- **Desktop:** Full layout as designed
- **Touch targets:** Minimum 44×44px for all interactive elements
- **Responsive type:** Use `clamp()` for hero/display sizes

---

## ⚡ PERFORMANCE RULES

1. **Images:** Always use `next/image`. WebP format. Blur placeholder. Lazy load.
2. **Fonts:** `font-display: swap`. Preload critical fonts in `<head>`.
3. **Animations:** Use `transform` and `opacity` only (GPU-composited). Never animate `width`, `height`, `top`, `left`.
4. **Code splitting:** Lazy load all dashboard routes. Landing page loads < 2s.
5. **Skeletons:** Show skeleton loaders for all async data (property cards, stats, tables).
6. **Scroll:** Use `Lenis` for smooth scroll on landing page.

---

## 🧠 COMPONENT NAMING CONVENTIONS

```
Components:  PascalCase        → PropertyCard, StatWidget, HeroSearch
CSS classes: kebab-case        → .property-card, .stat-widget, .hero-search
JS vars:     camelCase         → propertyData, activeFilter, isLoading
Files:       kebab-case        → property-card.tsx, use-properties.ts
Constants:   SCREAMING_SNAKE   → MAX_RESULTS, API_BASE_URL
```

---

## 🚫 DESIGN ANTI-PATTERNS (NEVER DO THESE)

- ❌ White background with purple/blue gradient — generic SaaS look
- ❌ Stock photo hero sections with overlay text
- ❌ Inter / Roboto / Arial as the ONLY font (use Cormorant for display)
- ❌ Generic card grid with no visual hierarchy
- ❌ Bootstrap or Material UI default components unmodified
- ❌ Flat colored buttons without hover states
- ❌ No animation or motion whatsoever
- ❌ Inconsistent spacing (not using the spacing scale)
- ❌ Tables without hover states or proper data formatting
- ❌ Price displayed without `font-mono`
- ❌ Map component without dark theme
- ❌ Light background on dashboard (use dark surface palette)
- ❌ Emoji icons as UI icons (use Lucide consistently)

---

## ✅ QUALITY CHECKLIST

Before marking any page/component as done:

- [ ] All colors use CSS variables from this system
- [ ] All fonts use the defined font stack (Cormorant for display, DM Sans for UI, Hind Siliguri for Bengali)
- [ ] All spacing uses the spacing scale
- [ ] Every interactive element has hover + active + focus state
- [ ] All cards have hover animation (translateY + shadow)
- [ ] All section entries have scroll-triggered animations (Framer Motion `whileInView`)
- [ ] Loading skeletons exist for all async data
- [ ] Mobile layout works and is tested at 375px
- [ ] No hardcoded hex colors outside of this system
- [ ] Navbar becomes frosted glass on scroll
- [ ] Property prices use `font-mono` + `color: var(--color-accent)`
- [ ] Dark theme is default, light mode is optional
- [ ] Bengali text uses `font-bengali` with proper line-height (1.8)
- [ ] Page transitions use Framer Motion `pageTransition` variant

---

## 🔧 TAILWIND CONFIG

```javascript
// tailwind.config.ts additions
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        ui:      ['DM Sans', 'system-ui', 'sans-serif'],
        bengali: ['Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
        mono:    ['DM Mono', 'Courier New', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#111118',
          raised:  '#16161F',
        },
        accent: {
          DEFAULT: '#C9A96E',
          light:   '#E2C99A',
          dark:    '#9A7A4A',
        },
      },
      animation: {
        'fade-up':  'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'shimmer':  'shimmer 1.5s linear infinite',
        'float':    'float 4s ease-in-out infinite',
        'aurora':   'aurora-shift 8s ease-in-out infinite alternate',
        'marquee':  'marquee 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'aurora-shift': {
          '0%':   { opacity: '0.6', transform: 'scale(1) rotate(0deg)' },
          '100%': { opacity: '1',   transform: 'scale(1.05) rotate(2deg)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
}
```

---

## 📦 IMPLEMENTATION STACK

```json
{
  "framer-motion":          "^11.x",   // Page transitions, scroll animations, variants
  "lenis":                  "^1.x",    // Smooth scroll on landing page
  "@radix-ui/react-*":      "latest",  // Accessible UI primitives
  "class-variance-authority":"latest", // Component variant management
  "tailwind-merge":         "latest",  // Tailwind class conflict resolution
  "lucide-react":           "latest",  // Icon system
  "recharts":               "^2.x",   // Dashboard charts
  "react-hot-toast":        "^2.x",   // Toast notifications
  "next-themes":            "^0.x"    // Dark/light mode
}
```

---

## 🗓️ IMPLEMENTATION PRIORITY

| Priority | Surface | Notes |
|----------|---------|-------|
| **P0** | Landing Page — hero, navbar, property cards | First impression, conversion |
| **P0** | Auth pages — login, register, role, KYC | Conversion funnel |
| **P1** | Buyer Dashboard | Primary user volume |
| **P1** | Property listing & detail page | Core feature |
| **P2** | Seller Dashboard | Second highest volume |
| **P2** | Agent Dashboard | Commission flow |
| **P3** | Admin ERP (internal tool) | Lower visual priority |
| **P3** | Chat UI | Functional over beautiful |

---

*This design system is the single source of truth. Any component, page, or feature built for this Real Estate SaaS must adhere to every rule defined here. When in doubt — go more premium, not less.*

*Last updated: 2026-03-31 | Version 2.0 | সিরাত প্রপার্টিজ Design System*
