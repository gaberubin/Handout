# 1. Product Requirements Document (PRD) — Handout

| | |
|---|---|
| **Product** | Handout |
| **Owner** | Darshil Patel (Founder & CEO) |
| **Last updated** | _edit me_ |
| **Status** | Draft / Living document |

> Edit any section freely. This is the source of truth for *what* we're building and *why*.

---

## 1.1 Vision
Handout is the one trusted place an international student turns to in order to **land, settle, and feel at home**. From finding a roommate to getting daily home-cooked meals, an airport ride, or a tutor — everything a student needs in their first months abroad, in one app.

## 1.2 Problem
International students arrive in a new country with no network, no credit history, and no easy way to find trusted help. Today they juggle Facebook groups, WhatsApp chains, Craigslist, and word of mouth — slow, scattered, and unsafe. There is no single, student-only, verified marketplace built for them.

## 1.3 Target users
- **Primary:** Incoming and current international students (starting with Rowan University, Glassboro NJ).
- **Secondary (supply side):** Vendors & hosts — home cooks, drivers, tutors, babysitters, cleaners, current students with a spare room.
- **Internal:** Admin (platform operator — verification, moderation, oversight).

### Personas
- **Aarav, incoming F-1 student** — needs a roommate and meals before he even lands. Wants verified, student-only options.
- **Anaya, home cook** — wants to sell tiffin subscriptions to students nearby. Needs a simple way to list and get orders.
- **Admin (you)** — needs to verify users/vendors, keep the marketplace safe, and watch growth.

## 1.4 Goals & success metrics
| Goal | Metric (early) |
|---|---|
| Marketplace liquidity | # active listings, # bookings/week |
| Two-sided growth | # students, # vendors |
| Trust | % verified vendors, avg rating |
| Engagement | Browse → action conversion, repeat bookings |
| Revenue (later) | GMV, take-rate %, subscription MRR |

> Handout is a **two-sided marketplace** (with subscription elements like tiffin plans), so the north-star is **GMV + liquidity**, not seats.

## 1.5 Core features (MVP)
1. **Browse-first discovery** — guests explore listings freely; sign-up is only required on an action (book, contact, post).
2. **Roommate matching** — "I have a room" (with photos/videos) or "I need a room" (location/area only). Swipeable media gallery, posted date, contact.
3. **Food & tiffin** — vendors list meals (per-meal / per-month); students browse and subscribe.
4. **Trusted services** — tutoring, airport rides, babysitting, cleaning, handyman, moving. Students book; providers receive orders.
5. **Welcome packages** — airport pickup + starter kits from verified hosts.
6. **Accounts & roles** — student, vendor, admin. Role-based dashboards.
7. **Bookings** — student books a service → provider sees the order.

## 1.6 Later / out of scope for now
- Real-time student↔vendor **messaging** (currently a placeholder link).
- **Payments** (Stripe) + payouts — needs business banking and an F-1 host-income legal check via Rowan ISSS.
- Reviews & ratings flow end-to-end.
- Native iOS/Android app.
- Expansion to other universities.

## 1.7 Monetization (planned)
- **Take-rate** (commission) on service bookings and welcome packages.
- **Subscription** revenue share on tiffin plans.
- Possible **featured listings** for vendors later.

## 1.8 Risks & assumptions
- **Chicken-and-egg** (no students without vendors and vice-versa) → mitigated by a **hyper-local Rowan-only launch** to reach density fast.
- **Trust & safety** → verification + admin moderation are essential, not optional.
- **Legal (F-1):** founder and student-host income must be checked against visa rules before payments go live.
- **Assumption:** students will prefer a single verified app over scattered free groups if it's genuinely easier and safer.

## 1.9 Open questions
- _Add your own here (pricing %, verification method, first 50 vendors plan, etc.)_
