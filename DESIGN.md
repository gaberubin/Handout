# Handout — Design System (Midnight Tech)

A dark, premium look: charcoal canvas, electric-cyan primary, indigo-violet
secondary, Inter type, glassmorphism + subtle neon.

## Colors (CSS variables in styles/globals.css — change once, applies everywhere)
| Token        | Hex / value           | Use                          |
|--------------|------------------------|------------------------------|
| --navy       | #121212               | App background               |
| --navy2      | #1E1E1E               | Cards / surfaces             |
| --navy3      | #2A2A2A               | Raised surfaces              |
| --amber      | #00E5FF (cyan)        | PRIMARY accent / CTAs        |
| --amber2     | #00DAF3               | Accent hover                 |
| --purple     | #CFBDFF / #6305EF     | Secondary (indigo-violet)    |
| --green      | #3CE36A               | Success / verified           |
| --red        | #FFB4AB               | Errors                       |
| --white      | #E5E2E1               | Primary text                 |
| --light      | #BAC9CC               | Secondary text               |
| --muted      | #849396               | Dim text                     |

> The old token NAMES are kept on purpose — every page that used `var(--amber)`
> etc. now picks up the new palette automatically.

## Type
- **Inter** for everything (400–900). `.font-display`, `.text-display-xl/lg/md/sm` are Inter.
- Material Symbols Outlined available via `.material-symbols-outlined` / `.ms-fill`.

## Utility classes (added at bottom of globals.css)
- `.glass`, `.glass-strong` — frosted cards / bars
- `.neon-cyan`, `.neon-purple`, `.glow-hover` — glows
- `.btn-cyan`, `.btn-ghost`, `.btn-violet` — buttons
- `.pill` — chips
- `.bg-pattern`, `.glow-blob` — ambient background
- `.auth-overlay`, `.auth-card`, `.fld*` — the glass sign-up modal + form fields

## Changing the accent later
Edit `--amber` (and `.btn-cyan` background) in `styles/globals.css`. One change re-skins the app.
