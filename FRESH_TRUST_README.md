# Handout — Fresh Trust redesign (full project)

This is your complete Handout codebase re-themed end-to-end from the old
**Midnight Tech** look (dark charcoal / electric-cyan) to **Fresh Trust**:
a light mint canvas, green primary (`#12A150`), indigo secondary, and a
Bricolage Grotesque + Plus Jakarta Sans type pairing. Every screen — landing,
student, vendor, provider, admin, auth — was updated.

## Run it

```bash
cd handout-fresh-trust
npm install
npm run dev
```

Open http://localhost:3000. (Your `.env.local` was carried over, so Supabase
auth/data work as before.)

## What was changed

1. **`styles/globals.css`** — the design tokens in `:root` were remapped to the
   Fresh Trust palette (same variable names, so every `var(--…)` cascades), the
   font imports swapped to Bricolage Grotesque + Plus Jakarta Sans, and a
   `FRESH TRUST THEME (v5)` override layer was appended that re-colors the
   intentionally-dark surfaces (sidebar, topbar, mobile nav, cards, glass, auth
   modal, form fields, buttons, pills, progress bars) so nothing renders
   dark-on-dark.
2. **`tailwind.config.ts`** — `amber` → green `#12A150`, `navy` → ink `#12241C`,
   brand colors updated.
3. **Every `.tsx` screen & component (~135 files)** — hardcoded inline colors
   from the old theme were remapped: cyan `#00E5FF` → green, dark surfaces
   `#121212/#1E1E1E/#2A2A2A` and `rgba(30,30,30,…)` glass → light/white, dark
   text-on-accent → white, light-on-dark text → ink, white-tint borders → dark
   hairlines, and the older light-page blues/slates → Fresh Trust neutrals.

## v2 — full component redesign (not just colors)

Beyond the re-theme, the core screens were **rebuilt to the approved mockup
designs**:

- **Dashboard** — 👋 greeting, solid-green upgrade banner with white CTA,
  icon-tile stat cards with big Bricolage numbers, emoji booking rows with
  status pills, 3-column Explore grid with colored icon tiles.
- **Roommate cards** — avatar + green compatibility % and gradient bar,
  💰/📅/📍 meta rows, mint pill tags, pill-shaped View profile / Connect buttons.
- **Food cards** — emoji banner headers, ✓ Verified, star meta line, pill tags,
  Bricolage price + green Subscribe pill.
- **Service provider cards** — avatar header + Top Rated badge, green Bricolage
  rate + Book now pill.
- **Booking rows** — white rounded rows, emoji tiles, Bricolage price, colored
  status pills (confirmed / pending / completed / cancelled).
- **Membership** — mock pricing design: solid-green featured Plus card, ink
  "Most Popular" badge, Bricolage prices, mint CTAs.
- **globals.css** — added a `FRESH TRUST v6` utility layer (`.ft-card`,
  `.ft-btn`, `.ft-tag`, `.ft-bar`, `.ft-stt-*`, `.ft-num`) so any screen can
  use the mock components.
- Codebase-wide: remaining old accent colors normalized, `Inter` headings →
  Bricolage Grotesque, weight 900 → 800.

## Worth a second look

The color remap is thorough and consistent, but a handful of very custom
inline treatments (unusual gradients, one-off badges) may want a human eye. If
you spot any element that still looks off, note the screen + element and it can
be fixed in a couple of minutes.

Nothing about app logic, routing, data, or Supabase wiring was touched — this
was purely a visual re-theme.
