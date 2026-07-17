# Handout — Database & Backend Setup Guide

## ⚡ Required migrations (run these first)

This app runs on **Supabase**. The SQL that builds and upgrades the database
lives in the `db/` folder. Open the **Supabase SQL editor** and run these files
**in this order** — each one is idempotent (safe to re-run).

| # | File | What it does | Skipping it breaks… |
|---|------|--------------|---------------------|
| 1 | `db/schema.sql` | Core tables + row-level-security policies | everything |
| 2 | `db/storage-setup.sql` | Storage buckets (avatars, media, message attachments) | image/file uploads |
| 3 | `db/public-read-policies.sql` | Public read access for browse/landing | logged-out browsing |
| 4 | `db/admin-and-delete-policies.sql` | Admin + owner-delete policies | admin tools, deleting your own posts |
| 5 | `db/add-notification-type.sql` | `notifications.type` column | typed notifications |
| 6 | `db/notifications-triggers.sql` | Auto-notify on booking made / **accepted** / **declined** | students never hear back after ordering |
| 7 | `db/messages-read-policy.sql` | Lets a receiver mark messages read | **unread badges never clear** |
| 8 | `db/upgrade-bookings-cart.sql` | Cart columns: qty, item_name, fulfillment, delivery_address, payment_method | **vendor can't see quantity / pickup-vs-delivery / address** |
| 9 | `db/upgrade-roommates.sql`, `db/upgrade-roommate-preferences.sql` | Extra roommate-listing fields (house details, lifestyle prefs) | roommate house details / matching |
| 10 | `db/upgrade-vendor-forms.sql` | Extended vendor profile fields | richer vendor profiles |
| 11 | `db/upgrade-welcome-packages.sql` | Welcome-package service columns (tier, nights, meals, per-service flags) | vendors can't create packages; student cards show blank |
| 12 | `db/welcome-requests.sql` | Welcome-request intake table (arrival details, host assignment) + RLS | students can't request packages; admin can't assign hosts |
| 13 | `db/upgrade-verifications-selfie.sql` | `selfie_path` column on verifications (student ID + selfie verification) | student verification submit fails |

**Optional / operational (run only when needed):**
- `db/make-admin.sql` — promote a user to admin (edit the email first)
- `db/backfill-users.sql` — backfill `users` rows for accounts created before triggers existed
- `db/reset-all-data.sql` — ⚠️ wipes all app data (dev only)

After running 1–8 the core flows (auth, browse, orders, messages, notifications)
all work end-to-end. The rest of this document is **legacy reference** for
alternative stacks and predates the Supabase setup above.

---

## Overview (legacy reference)

The sections below describe generic ways to add a database from scratch.
They are kept for reference only — the app already uses Supabase per the
migrations above, so you normally do **not** need them.

---

## Option 1: PostgreSQL + Prisma (Recommended)

### Step 1 — Install packages

```bash
npm install prisma @prisma/client
npx prisma init
```

### Step 2 — Set DATABASE_URL in `.env`

```env
# .env (never commit this file)
DATABASE_URL="postgresql://user:password@localhost:5432/handout_db"

# For Supabase (free):
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# For Neon (free):
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

### Step 3 — Define your schema in `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  role         Role      @default(STUDENT)
  plan         Plan      @default(FREE)
  university   String?
  city         String?
  budget       Float?
  moveInDate   DateTime?
  bio          String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  bookings     Booking[]
  messages     Message[]
  reviews      Review[]
}

enum Role { STUDENT PROVIDER ADMIN }
enum Plan { FREE PLUS PRO }

model ServiceProvider {
  id       String   @id @default(cuid())
  userId   String   @unique
  role     String
  rate     String
  verified Boolean  @default(false)
  rating   Float    @default(0)
  reviews  Int      @default(0)
  tags     String[]
  createdAt DateTime @default(now())

  bookings Booking[]
  reviews  Review[]
}

model FoodProvider {
  id           String   @id @default(cuid())
  name         String
  cuisine      String
  diet         String
  pricePerMeal Float
  pricePerMonth Float
  verified     Boolean @default(false)
  rating       Float   @default(0)
  reviews      Int     @default(0)
  createdAt    DateTime @default(now())
}

model Booking {
  id         String        @id @default(cuid())
  userId     String
  providerId String
  name       String
  date       DateTime
  status     BookingStatus @default(PENDING)
  price      Float
  createdAt  DateTime      @default(now())

  user     User            @relation(fields: [userId], references: [id])
  provider ServiceProvider @relation(fields: [providerId], references: [id])
}

enum BookingStatus { PENDING CONFIRMED COMPLETED CANCELLED }

model Message {
  id         String   @id @default(cuid())
  fromId     String
  toId       String
  content    String
  read       Boolean  @default(false)
  createdAt  DateTime @default(now())

  from User @relation(fields: [fromId], references: [id])
}

model Review {
  id         String   @id @default(cuid())
  userId     String
  providerId String
  rating     Int
  comment    String
  createdAt  DateTime @default(now())

  user     User            @relation(fields: [userId], references: [id])
  provider ServiceProvider @relation(fields: [providerId], references: [id])
}
```

### Step 4 — Push schema to database

```bash
npx prisma db push
# or for migrations:
npx prisma migrate dev --name init
```

### Step 5 — Create Prisma client singleton in `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Step 6 — Replace mock data with real queries

**Before (mock data):**
```typescript
// app/student/roommates/page.tsx
import { roommates } from '@/lib/data';
```

**After (real database):**
```typescript
// app/student/roommates/page.tsx
import { prisma } from '@/lib/prisma';

// This is a Server Component — fetch directly
const roommates = await prisma.user.findMany({
  where: { role: 'STUDENT' },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

---

## Option 2: Supabase (Easiest — No Setup)

### Step 1 — Create a free project at supabase.com

### Step 2 — Install

```bash
npm install @supabase/supabase-js
```

### Step 3 — Add to `.env`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 4 — Create client in `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Step 5 — Replace mock data

```typescript
// Fetch roommates from Supabase
const { data: roommates, error } = await supabase
  .from('users')
  .select('*')
  .eq('role', 'student')
  .order('created_at', { ascending: false });
```

### Supabase Auth (replaces login/signup forms)

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@university.edu',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@university.edu',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();
```

---

## Option 3: MongoDB + Mongoose

```bash
npm install mongoose
```

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/handout
```

```typescript
// lib/mongoose.ts
import mongoose from 'mongoose';

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise = mongoose.connect(process.env.MONGODB_URI!);
  cached.conn = await cached.promise;
  return cached.conn;
}
```

---

## Authentication — NextAuth.js

```bash
npm install next-auth
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Replace with real auth logic
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });
        if (user) return user;
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/onboarding',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## API Routes — Example

```typescript
// app/api/bookings/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET all bookings for current user
export async function GET(request: Request) {
  const bookings = await prisma.booking.findMany({
    include: { provider: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(bookings);
}

// POST create booking
export async function POST(request: Request) {
  const body = await request.json();
  const booking = await prisma.booking.create({ data: body });
  return NextResponse.json(booking, { status: 201 });
}
```

---

## Environment Variables Summary

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."

# Uploads (Cloudinary or S3)
CLOUDINARY_URL="..."
```

---

## Recommended Free Database Hosts

| Service    | Type       | Free Tier          | URL                    |
|------------|------------|--------------------|------------------------|
| Supabase   | PostgreSQL | 500MB, 2 projects  | supabase.com           |
| Neon       | PostgreSQL | 512MB              | neon.tech              |
| PlanetScale| MySQL      | 5GB                | planetscale.com        |
| MongoDB Atlas | MongoDB | 512MB              | cloud.mongodb.com      |
| Railway    | PostgreSQL | $5 credit/month    | railway.app            |

---

## Summary: Steps to Go Live

1. Pick a database (recommend **Supabase** for easiest setup)
2. Create `.env.local` with your credentials
3. Replace `lib/data.ts` imports with real database queries
4. Add NextAuth for real authentication
5. Deploy to **Vercel** (free): `npx vercel`
