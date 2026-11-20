# Agents Guide - Wifey for Lifey

This document provides context, architecture overviews, and reference data for AI agents and developers working on the **Wifey for Lifey** codebase.

---

## 📖 Project Overview

**Wifey for Lifey** is a comprehensive bilingual (Arabic & English) bridal and wedding planning platform created specifically for Egyptian and Middle Eastern brides and couples. The platform combines physical lifestyle products with digital tools, expert educational guidance, and community access to support brides through two major milestones:

1. **Gehaz Preparation (تجهيز جهاز العروسة):** Guiding brides through home essentials, appliance comparisons, cookware selection, interior design, and budgeting without unnecessary spending or marketing hype.
2. **Wedding Planning (تنظيم الفرح):** Helping couples plan their wedding day, compare vendors, track timelines, manage budgets, and access trusted wedding specialists.

---

### 🌟 Core Features & Modules

- **Subscription Packages & Physical Fulfillment:** Users subscribe to digital packages that bundle an exclusive physical planner (*Gehaz Bestie Planner* or *Wedding Bestie Planner*) shipped directly via **Bosta** logistics.
- **Planner Editions (Arabic vs English):** For *Gehaz Bestie Planner*, users can choose between the **Arabic Edition (النسخة العربية)** with Arabic planner photos and cover, and the **English Edition**. The chosen edition is persisted through the cart, checkout, `subscriptionsModel`, and Bosta delivery notes/admin notifications to ensure warehouse fulfillment accuracy. (*Note: This edition toggle is available strictly for GehazBestiePlanner and is not active for WeddingBestiePlanner*).
- **Curated Educational Video Playlists:** Step-by-step video guides featuring certified experts (OB-GYNs, sex therapists, interior designers, and appliance specialists) with per-user progress tracking.
- **Vendor Directory & Partner Deals:** Comprehensive directory of vetted wedding vendors (photographers, makeup artists, venues, planners, catering) with exclusive discounts for Wifey Club subscribers.
- **Interactive Bridal Tools:**
  - **Wedding Timeline:** Interactive countdown, milestones, and task checklists.
  - **Shopping Bestie:** Gehaz checklist separating "Essentials" from "Nice-to-Haves" with recommended quantities.
  - **Inspirations & Moodboards:** Curated bridal inspiration boards with Pinterest and TikTok integrations.
- **1:1 Expert Consultations:** Booking sessions with relationship counselors, sex educators, and wedding consultants via Calendly with automated email confirmations.
- **Gift Subscriptions:** Capability to gift full or mini packages to a bride-to-be without spoiling the surprise before the physical gift arrives.
- **Loyalty & Points Program:** Earning Wifey Points on package purchases and activities to redeem for discounts and products.

---

### 💻 Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** with **TypeScript** |
| **Styling & UI** | Tailwind CSS, Radix UI, Material Tailwind, Framer Motion, Lucide Icons |
| **Localization (i18n)** | `next-intl` supporting Arabic (`ar`, RTL default) and English (`en`) under `app/[locale]/` |
| **Database & ORM** | **MongoDB** with **Mongoose** (models located in `app/modals/` and `models/`) |
| **Authentication** | **NextAuth.js** (Credentials, Google, Apple) + Mobile JWT token auth (`app/lib/mobileAuth.ts`) |
| **Logistics & Delivery** | **Bosta API** integration for automated order shipment creation and tracking |
| **Payments** | Payment gateway integrations (Paymob, card payments) with webhook status verification |
| **Media & Storage** | UploadThing, Cloudinary |
| **Communications** | Nodemailer with responsive branded HTML email templates |

---

## 📦 Package IDs Reference

All subscriptions and purchases in the platform are tied to packages defined in the MongoDB `packages` collection and mapped to users in `user.subscriptions[].packageID`.

In TypeScript, these IDs are exported as a constant in [`app/modals/userModel.ts`](file:///d:/next.js/wifeyBolt/project/app/modals/userModel.ts):

```typescript
export const PACKAGE_IDS = {
  FULL_EXPERIENCE: "687396821b4da119eb1c13fe",
  MINI: "68bf6ae9c4d5c1af12cdcd37",
  MINI_WEDDING: "6a2d9aec3def6ce76dc7babc",
  WEDDING_PLANNING_BESTIE: "6965e63c6df4503dda02c12b",
} as const;
```

---

### Package Summary Table

| Package ID (`_id`) | Constant Name | Name (EN) | Name (AR) | Slug | Tier | Price (EGP) | Status | Physical Item Delivered | Arabic Edition Toggle |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `687396821b4da119eb1c13fe` | `PACKAGE_IDS.FULL_EXPERIENCE` | The Full Wifey Experience | تجربة وايفي الكاملة / رحلة جهازك الكاملة مع وايفي | `GehazBestiePlanner` | `full` | 2,500 | Active | Gehaz Bestie Planner | **Yes (Arabic / English)** |
| `68bf6ae9c4d5c1af12cdcd37` | `PACKAGE_IDS.MINI` | Wifey’s Mini Experience | تجربة وايفي المصغرة / رحلة جهازك المصغّرة | `GehazBestiePlanner` | `mini` | 1,500 | Active | Gehaz Bestie Planner | **Yes (Arabic / English)** |
| `6965e63c6df4503dda02c12b` | `PACKAGE_IDS.WEDDING_PLANNING_BESTIE` | Full Wedding Experience | فرحك مع وايفي الكاملة | `WeddingBestiePlanner` | `full` | 2,700 | Inactive | Wedding Bestie Planner | **No (Not Available)** |
| `6a2d9aec3def6ce76dc7babc` | `PACKAGE_IDS.MINI_WEDDING` | Mini Wedding Experience | فرحك مع وايفي المصغرة | `WeddingBestiePlanner` | `mini` | 1,700 | Inactive | Wedding Bestie Planner | **No (Not Available)** |

---

## 🔍 Detailed Package Profiles

### 1. The Full Wifey Experience (`687396821b4da119eb1c13fe`)
- **Key Constant:** `PACKAGE_IDS.FULL_EXPERIENCE`
- **Category / Slug:** `GehazBestiePlanner` (Tier: `full`)
- **Price:** 2,500 EGP
- **Duration:** 12 Months
- **Planner Edition Support:** Available in **Arabic Edition (النسخة العربية)** and **English Edition**. Arabic photos display when the Arabic edition is selected.
- **Inclusions:**
  - Physical Gehaz Bestie Planner shipped via Bosta
  - Full access to bridal and gehaz video guide playlists
  - The Wifeys Community, WhatsApp support circle & monthly check-ins
  - Exclusive Wifeys-only discounts on bridal vendors, home appliances, and partner services
  - Special discounts on 1:1 expert consultations
  - 2,500 Wifey bonus points

### 2. Wifey’s Mini Experience (`68bf6ae9c4d5c1af12cdcd37`)
- **Key Constant:** `PACKAGE_IDS.MINI`
- **Category / Slug:** `GehazBestiePlanner` (Tier: `mini`)
- **Price:** 1,500 EGP
- **Duration:** 12 Months
- **Planner Edition Support:** Available in **Arabic Edition (النسخة العربية)** and **English Edition**.
- **Inclusions:**
  - Physical Gehaz Bestie Planner shipped via Bosta
  - Core playlists and planner guidance
  - Targeted benefits for brides focusing strictly on essentials

### 3. Full Wedding Experience (`6965e63c6df4503dda02c12b`)
- **Key Constant:** `PACKAGE_IDS.WEDDING_PLANNING_BESTIE`
- **Category / Slug:** `WeddingBestiePlanner` (Tier: `full`)
- **Price:** 2,700 EGP
- **Planner Edition Support:** Currently **not available** (English/Standard only).
- **Inclusions:**
  - Physical Wedding Bestie Planner shipped via Bosta
  - Complete wedding planning playlists, budgeting tools, and timeline trackers
  - Full access to wedding vendor directory and venue guides
  - WhatsApp bridal community support

### 4. Mini Wedding Experience (`6a2d9aec3def6ce76dc7babc`)
- **Key Constant:** `PACKAGE_IDS.MINI_WEDDING`
- **Category / Slug:** `WeddingBestiePlanner` (Tier: `mini`)
- **Price:** 1,700 EGP
- **Planner Edition Support:** Currently **not available** (English/Standard only).
- **Inclusions:**
  - Physical Wedding Bestie Planner shipped via Bosta
  - Essential wedding planning video guides and worksheets

---

## 🛠️ Key Code References for Agents

- **Constants Definition:** [`app/modals/userModel.ts`](file:///d:/next.js/wifeyBolt/project/app/modals/userModel.ts) (exports `PACKAGE_IDS`)
- **Package Schema:** [`app/modals/packageModel.ts`](file:///d:/next.js/wifeyBolt/project/app/modals/packageModel.ts) (supports `arabicImages`, `arabicImgUrl`, and `translations.ar.images`)
- **User Subscription Schema:** [`app/modals/subscriptionsModel.ts`](file:///d:/next.js/wifeyBolt/project/app/modals/subscriptionsModel.ts) (tracks `edition` and `editionName`)
- **Subscription Payment Schema:** [`app/modals/subscriptionPaymentModel.ts`](file:///d:/next.js/wifeyBolt/project/app/modals/subscriptionPaymentModel.ts)
- **Package Detail Page:** [`app/[locale]/package/[slug]/page.tsx`](file:///d:/next.js/wifeyBolt/project/app/[locale]/package/[slug]/page.tsx) (controls edition switcher and image gallery swapping)
- **NextAuth Session Subscription Mapping:** [`app/api/auth/[...nextauth]/authOptions.ts`](file:///d:/next.js/wifeyBolt/project/app/api/auth/[...nextauth]/authOptions.ts)
- **Mobile Auth Subscription Mapping:** [`app/lib/mobileAuth.ts`](file:///d:/next.js/wifeyBolt/project/app/lib/mobileAuth.ts)
- **Arabic / English Localization:** [`utils/subscriptionLocalization.ts`](file:///d:/next.js/wifeyBolt/project/utils/subscriptionLocalization.ts)
- **Bosta Delivery Creation:** [`app/services/bostaService.ts`](file:///d:/next.js/wifeyBolt/project/app/services/bostaService.ts) (includes edition in parcel description and notes)
