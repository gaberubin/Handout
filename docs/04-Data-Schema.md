# 4. Data Schema — Handout

| | |
|---|---|
| **Product** | Handout |
| **Owner** | Darshil Patel |
| **Last updated** | _edit me_ |
| **Status** | Living document — mirrors `db/schema.sql` |

> Keep this in sync with `db/schema.sql`. 11 tables + 1 storage bucket.

---

## 4.1 Entity overview
```
auth.users (Supabase)
   └─1:1─ users ──1:1─ student_profiles
                  └─1:1─ provider_profiles
users ──1:N─ roommate_listings   (media, listing_type)
users ──1:N─ tiffin_listings     (food / tiffin)
users ──1:N─ service_listings    (services)
users ──1:N─ welcome_packages
users ──1:N─ bookings  (as student_id and as provider_id)
users ──1:N─ messages  (sender / receiver)
users ──1:N─ reviews   (reviewer / reviewee)
users ──1:N─ notifications
```

## 4.2 Tables

### users
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | = auth.users.id |
| email | text unique | |
| full_name | text | |
| role | enum | student \| vendor \| provider \| admin |
| phone | text | |
| address | text | |
| gender | text | |
| avatar_url | text | |
| is_verified | bool | default false |
| verification_status | text | pending / approved |
| created_at | timestamptz | |

### student_profiles
`id, user_id (unique FK), university, major, bio, gender, created_at`

### provider_profiles
`id, user_id (unique FK), business_name, service_area, bio, rating, total_reviews, created_at`

### roommate_listings
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid FK | poster |
| **listing_type** | text | `have` (room available) \| `need` (looking) |
| title, description, location | text | |
| rent | numeric | |
| room_type | text | private/shared/etc. |
| gender_preference | text | |
| available_from | date | |
| **contact_phone** | text | 10 digits |
| **media** | jsonb | array of `{ url, type:'image'\|'video' }` |
| is_active | bool | |
| created_at | timestamptz | |

### tiffin_listings (food)
`id, user_id (FK), name, cuisine, diet_type, description, price_per_meal, price_per_month, location, contact_phone, is_active, created_at`

### service_listings
`id, user_id (FK), title, category, description, rate, rate_type (default 'hour'), location, contact_phone, is_active, created_at`

### welcome_packages
`id, host_id (FK), title, description, price, location, airport_served, is_active, is_verified, created_at`

### bookings
| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| student_id | uuid FK | who booked |
| provider_id | uuid FK | who provides |
| listing_type | text | e.g. `service` |
| listing_id | uuid | the booked listing |
| total_price | numeric | |
| status | text | pending / confirmed / completed / cancelled |
| arrival_date | date | |
| created_at | timestamptz | |

### messages
`id, sender_id (FK), receiver_id (FK), content, is_read, created_at`

### reviews
`id, reviewer_id (FK), reviewee_id (FK), rating (1–5), comment, created_at`

### notifications
`id, user_id (FK), title, message, is_read, created_at`

## 4.3 Storage
- **Bucket `listing-media`** (public read, authenticated upload) — roommate photos/videos. URLs stored in `roommate_listings.media`.

## 4.4 RLS summary
| Table | Read | Write |
|---|---|---|
| users | any signed-in | own row only |
| *_profiles | any signed-in | own row only |
| *_listings, welcome_packages | any signed-in | owner only |
| bookings | the two parties | student inserts; both update |
| messages | the two parties | sender inserts |
| reviews | any signed-in | reviewer inserts |
| notifications | own only | own only |

## 4.5 Triggers
- `handle_new_user()` → on `auth.users` insert, create a matching `public.users` row with role from sign-up metadata (default student).

## 4.6 Migration files
- `db/schema.sql` — full create (drops + recreates).
- `db/upgrade-roommates.sql` — adds `listing_type`, `contact_phone`, `media` without data loss.
- `db/storage-setup.sql` — bucket + policies.
- `db/make-admin.sql` — promote your email to admin.
- `db/reset-all-data.sql` — wipe all rows.
