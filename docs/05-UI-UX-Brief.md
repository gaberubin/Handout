# 5. UI/UX Brief — Handout ("Midnight Tech")

| | |
|---|---|
| **Product** | Handout |
| **Owner** | Darshil Patel |
| **Last updated** | _edit me_ |
| **Status** | Living document |

> The look, feel, and rules of the interface. Tokens live in `styles/globals.css`.

---

## 5.1 Design direction
**Midnight Tech** — a dark, modern, trustworthy marketplace feel: deep charcoal surfaces, electric-cyan accents, soft glass panels, and subtle neon glow. Premium but friendly; calm, not flashy.

## 5.2 Color tokens
| Token | Hex | Use |
|---|---|---|
| Background | `#121212` | app background |
| Surface | `#1E1E1E` | cards |
| Surface raised | `#2A2A2A` | inputs, raised panels |
| **Primary (cyan)** | `#00E5FF` | buttons, links, key accents |
| Primary hover | `#00DAF3` | hover state |
| Secondary (violet) | `#6305EF` / `#CFBDFF` | category tags, accents |
| Success (green) | `#3CE36A` | confirmations |
| Error | `#FFB4AB` | error text |
| Text primary | `#E5E2E1` | headings/body |
| Text secondary | `#BAC9CC` | sub-text |
| Text muted | `#849396` | hints, meta |
| Border | `rgba(255,255,255,0.08–0.12)` | dividers |

> On cyan buttons, use dark text (`#06303A` / `#121212`) for contrast.

## 5.3 Typography
- **Font:** Inter (single family, sans-serif).
- Headings: heavy weight (800–900), tight letter-spacing (e.g. `-1.5` to `-2`).
- Body: 14–17px, line-height ~1.6.
- Numbers/stats: large (40–64px), weight 900.

## 5.4 Iconography
- Material Symbols + tasteful emoji for category cues (🏠 🍱 ✈️ 📚 ❤️ 🌐).

## 5.5 Components & patterns
- **Cards:** `#1E1E1E`, 16–20px radius, 1px subtle border, 20px padding.
- **Buttons:** pill-shaped (radius 100). Primary = cyan fill; ghost = translucent white; danger = translucent red.
- **Glass panels & auth modal:** blurred translucent surface with neon edge.
- **Media gallery:** swipeable (‹ › arrows, dots, `1/N` counter), images + video, 12px radius.
- **Sidebars:** fixed left nav (248px), active item in cyan tint; account chip at the bottom links to profile.
- **Pills/tags:** small rounded labels; cyan for status, violet for categories.
- **Empty states:** icon + one-line message + a gentle hint (never a blank screen).

## 5.6 Layout
- Sidebar + scrollable main content; main padding ~32–40px.
- Responsive grids: `repeat(auto-fill, minmax(280–290px, 1fr))` for listing cards.
- Landing uses section labels with a number (01, 02, …) and a thin accent line.

## 5.7 Voice & tone
- Warm, direct, student-to-student. "Your home away from home."
- Confident but never salesy. Short sentences. Helpful microcopy.

## 5.8 Accessibility
- Maintain contrast (light text on dark; dark text on cyan).
- Inputs use correct types (`tel` + numeric inputmode for phone).
- Buttons have clear disabled/active states; tap targets ≥ ~40px.
- Don't rely on color alone — pair with labels/icons.

## 5.9 Do / Don't
- ✅ Consistent cyan accents, dark surfaces, generous spacing.
- ✅ Show real data; start counters at zero.
- ❌ No leftover amber/navy ("brown") — all tokenized to Midnight Tech.
- ❌ No blank sections; always provide an empty state.
