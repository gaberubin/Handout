# 3. App Flow — Handout

| | |
|---|---|
| **Product** | Handout |
| **Owner** | Darshil Patel |
| **Last updated** | _edit me_ |
| **Status** | Living document |

> The journeys each user takes through the app. Update as screens change.

---

## 3.1 Roles
`Guest` → `Student` → `Vendor` (provider) → `Admin`

## 3.2 Browse-first principle
Anyone can explore. The **auth modal appears only on an action** (book, contact, post). This lowers the barrier to entry and lets the marketplace show value before asking for sign-up.

---

## 3.3 Guest flow
```
Landing (/)
  → stats (start at 0, grow with real data)
  → "What we provide" (6 blocks) → Browse all listings
  → Founder section
  → Browse (/browse): tabs = Roommates | Food | Services
       → taps an action (Book / Contact)
           → Auth modal (login / signup)
               → on success: role-based redirect
```

## 3.4 Student flow
```
Sign up (role = student)
  → /student/dashboard
       ├─ Post a roommate listing
       │     ├─ "I have a room": title, rent, location, room type,
       │     │   preference, available-from, contact phone (10 digits),
       │     │   PHOTOS & VIDEOS → swipeable gallery
       │     └─ "I need a room": no photos — location/area + budget
       ├─ Roommates (/student/roommates): others' listings,
       │     filter All | Rooms available | Looking,
       │     gallery + posted date + Contact → Messages
       ├─ Services (/student/services): real vendor services,
       │     search + category filter → "Book now" → booking created
       │     (+ 💬 message provider)
       ├─ Food & Tiffin, Community, Bookings, Membership, Messages
       └─ Account chip → My Profile → Sign out
```

## 3.5 Vendor flow
```
Sign up (role = vendor)
  → /vendor/dashboard
       ├─ Add listing (validated form):
       │     • Food/tiffin → tiffin_listings
       │     • Service     → service_listings
       ├─ Orders (/vendor/orders)        — incoming bookings
       ├─ Earnings (/vendor/earnings)    — live $0 ledger (until payments)
       └─ Account chip → My Profile (editable) → Sign out
```

## 3.6 Vendor → Student loop (the core marketplace loop)
```
Vendor posts a listing  →  saved to Supabase (tiffin_listings / service_listings)
        ↓
Student opens Browse / Services  →  sees the live listing
        ↓
Student taps "Book now"  →  row inserted into `bookings` (status: pending)
        ↓
Vendor sees it in Orders   ← (next step: align Orders to read `bookings`)
```

## 3.7 Admin flow
```
Log in with admin account  →  /admin/...  (every admin page runs an admin check)
  ├─ Users / verification
  ├─ Listings moderation
  └─ Oversight
Non-admins are bounced out. Admin links are NOT shown to students.
```

## 3.8 Navigation map (top level)
- **Public:** `/` landing, `/browse`
- **Student:** `/student/{dashboard, roommates, services, food, community, bookings, membership, messages, profile, notifications, settings}`
- **Vendor:** `/vendor/{dashboard, orders, earnings, profile}`
- **Admin:** `/admin/{users, ...}` (guarded)

## 3.9 Key state transitions
- **Booking status:** `pending → confirmed → completed` (or `cancelled`).
- **Listing:** `is_active = true` shows in browse; soft-delete by setting false (rooms use hard delete today).
- **User verification:** `pending → approved` (admin).
