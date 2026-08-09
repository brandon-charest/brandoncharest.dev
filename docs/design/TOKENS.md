# Design Tokens — type, layout, spacing, motion

Measurements extracted from the handoff README and verified against the prototype's inline
styles. Colors live in [`PALETTE.md`](./PALETTE.md).

---

## Typography

Three families, loaded from Google Fonts in one request.

| Family | Weights | Used for |
|---|---|---|
| IBM Plex Mono | 400, 500, 600, 700 | Two roles. **Display voice at 700** — page `h1`, post `h2`/`h3`, section labels, brand logo, status-bar mode, kind badges, `DIR` badge. **Terminal chrome at 400–600** — prompts, file tree, breadcrumbs, meta, status bar, palette, nav index numbers |
| IBM Plex Sans | 400, 500, 600, 700 | Running prose — article body, intro blurbs, descriptions — **and nav labels** (see below) |
| JetBrains Mono | 400–700 | Code only — code blocks, inline `<code>`, the `// currently` aside, the ASCII coffee cup. Ligatures on. |

**Deviation — nav labels are sans, not mono.** The handoff assigns nav to IBM
Plex Mono as terminal chrome. Monospace forces every glyph to one advance width,
which at 13px flattens the shapes that separate letters (n/h, a/o) and opens
gaps inside words. The nav is five short words read at a glance, so legibility
wins over texture: labels are IBM Plex Sans 14px/500. The index numbers stay
IBM Plex Mono with tabular figures — they are a terminal affordance tied to the
1–5 shortcuts, and fixed-width digits keep the pills from shifting. Same
superfamily and already loaded, so no extra font request. Net effect on layout:
the nav got *narrower* (331px, from ~360px).

```
--font-display: 'IBM Plex Mono', ui-monospace, monospace;
--font-ui:      'IBM Plex Mono', ui-monospace, monospace;
--font-sans:    'IBM Plex Sans', system-ui, sans-serif;
--font-code:    'JetBrains Mono', ui-monospace, monospace;
```

**Why two tokens for one family.** `--font-display` and `--font-ui` resolve to
IBM Plex Mono alike, and that is deliberate: they name a role, not a typeface.
Display is 700 and owns headings, labels and badges; ui is 400–600 and owns the
terminal chrome. Space Mono held display until 2026-08-08, when its uppercase M
and W — the first two letters a reader meets in "About **M**e" and "**W**hy this
Site Exists" — were judged unreadable at 40px. Plex Mono was already downloaded
for chrome, so promoting it removed a family instead of adding one, taking the
budget from twelve variants to eleven. Keeping the tokens separate means the
next change of display voice is one line rather than seventeen call sites.

### Scale

| Role | Spec |
|---|---|
| Page `h1` | 40px / 700 / `-.3px` / lh 1.12 — display, `fg1`, `overflow-wrap: break-word` |
| Post `h2` / `h3` | 26px / 700 / `-.1px` — display, aqua, `scroll-margin-top: 78px`, margin `44px 0 14px` (first: `0 0 14px`) |
| Featured card title | 26px / 700 / `-.2px` / lh 1.15 — display, `fg1` |
| Post-card title | 22px / 700 / `-.15px` — display, `fg1` |
| Lede / intro blurb | 19px / lh 1.65 — sans, `fg1`, 2px `bg3` left rule, 18px left padding |
| Article body | 17px / lh 1.75 — sans, `fg2`; paragraph margin `0 0 20px` |
| Home blurb | 16px / lh 1.7 — sans, `fg1` |
| Folder overview, garden lede, now/about body | 17px / lh 1.7 — sans, `fg1` |
| Row description (folder child) | 15px / lh 1.6 — sans, `fg2` |
| Body default | 13px / lh 1.7 — mono |
| Meta, labels, breadcrumbs, tags | 12px — mono |
| Section label (`:: ON THIS PAGE`) | 12px / ls 1.5px — display, `fg4`, `::` prefix |
| Featured label (`★ FEATURED`) | 14px / 700 / ls 2px — display, purple |
| Code | 14px / lh 1.8 — code |
| Palette type badge | 9.5px / ls .5px |
| Kind badge (child listing) | 10px / ls .5px — display |

**Negative tracking was halved on 2026-08-08**, when the display face moved from
Space Mono to IBM Plex Mono. Every value tightening display text came down by
exactly half: `-.6px` → `-.3px`, `-.4px` → `-.2px`, `-.3px` → `-.15px`,
`-.2px` → `-.1px`. Tightening a monospace always fights the face — each glyph
sits on a fixed advance width, so negative tracking pulls letters together
without narrowing the cells they occupy. Space Mono is wide enough that the old
values read as correction; Plex Mono is narrower and the same numbers read as
cramped. The positive values above are untouched: tracking *out* uppercase
labels is a separate concern and unaffected by the swap.

### Prose measures

| Context | Cap |
|---|---|
| Article body column | `max-width: 620px` |
| Home blurb, garden lede, folder overview | `64ch` |
| Now / About body | `68ch` |

---

## Layout

**One content width across every screen: `max-width: 1120px`, centered, 18px side gutters.**
Still exactly one width — the rule the handoff cares about is that content never shifts
sideways between pages, and the site previously had five different widths that made it lurch.

**Raised from the handoff's 920px.** At 920 the article body was 620px, and code blocks wanted
up to 760px of content, so two of the three on a single Rust note scrolled horizontally — while
500px sat empty on either side at 1920. The column is now 1120, which gives the article 824px
and fits every code block with no scroll.

Widening the column does **not** widen prose. Running text is capped at `--measure`
independently, so line length is unchanged; the extra width goes to code, tables and images.

```
--content: 1120px;
--gutter:  18px;
--measure: 62ch;   /* ~69 characters — see below */
```

**On `ch`:** the unit is the width of "0", which in IBM Plex Sans is wider than the average
lowercase letter, so `62ch` measures ~69 actual characters — not 62. That is the same line
length the original 620px column produced. Check characters, not the `ch` number, if this is
ever retuned.

| Element | Width at 1440px |
|---|---|
| Column | 1120 (160px margin each side) |
| Article body | 824 |
| Prose paragraph | 620 (69 characters) |
| Code card | 824 |
| Sidebar | 220, 40px gap |

| Screen | Vertical padding |
|---|---|
| Home, garden, folder, tags | `42px` top / `84px` bottom |
| Article | `38px` top / `84px` bottom |
| Now / About | `50px` top / `84px` bottom |

**Article row:** `display:flex; flex-wrap:wrap; gap:32px 40px; align-items:flex-start`
- body — `flex: 1 1 380px; min-width: 0; max-width: 620px`
- sidebar — `flex: 0 1 220px; min-width: 180px; position: sticky; top: 78px`

**Breakpoints.** Two kinds, kept separate on purpose:

| Query | Governs | Effect |
|---|---|---|
| `max-width: 820px` | space | Hides the TOC / note-info sidebar (the prototype used a JS resize listener; use CSS) |
| `max-width: 760px` | space | Header drops to two rows: brand, then search + a horizontally scrolling nav |
| `max-width: 640px` | space | Tree hides descriptions — brings it from 882px wide to ~402px |
| `max-width: 560px` | space | Page `h1` scales via `clamp(26px, 8vw, 40px)`; reduced top padding |
| `pointer: coarse` | fingers | Hit areas: nav 44px, tree rows 36px, pills 32px |

`pointer: coarse` is deliberately not a width query — a tablet has fingers at 1024px, and a
narrow desktop window does not. Sizing hit areas by viewport width gets both wrong.

**Mobile results** (320-768px): no horizontal overflow at any width; sticky header 89px on
phones, down from 141-165 when it wrapped to three rows; every nav item reachable with `1 home`
anchored at the scroll origin.

---

## Radii

| Value | Used for |
|---|---|
| 3px | nav pill |
| 4px | small badges, `⌘K` chip, inline code, kind badges, `DIR` badge |
| 5px | tree row hover |
| 6px | rows, search field, palette result row |
| 8px | cards, code blocks, tree card, panels |
| 10px | featured card, palette panel |
| 999px | tag pills, filter chips, maturity dots (50%) |

---

## Component measurements

### Header
- container padding `11px 16px`, `gap: 10px 16px`, wraps
- search button — `bg1`, 1px `bg2`, radius 6px, padding `5px 9px 5px 11px`, 12px `fg2`
- `⌘K` chip — 1px `bg3`, radius 4px, padding `0 5px`, 12px, lh 1.6
- nav item — padding `4px 8px`, 13px, radius 3px, `white-space: nowrap`; active pill orange with `#282828` text at 600/700

### Home terminal card
- `width: fit-content; max-width: 100%`, 1px `bg2`, radius 8px, `bg1`
- shadow `0 24px 60px -34px rgba(0,0,0,.85), inset 0 1px 0 rgba(255,255,255,.02)`
- title bar — `bg0-soft`, 1px `bg2` bottom, padding `9px 14px`, three 11px dots (`gray` / `bg3` / `bg2`) with 7px gap, centered 12px `fg2` label with `.5px` letter-spacing
- screen — padding `20px 24px 14px`, 13px base
- columns — `display:flex; gap:18px 26px; align-items:flex-start; flex-wrap:wrap`
- ASCII art — code font 14px, lh 1.34, orange, `align-self: center`
- identity banner — display 15px 700, ls `.3px`; below it a 1px `bg3` rule, margin `7px 0 11px`
- stat rows — `gap: 10px`, lh 1.5, label column `width: 74px; flex: none; font-weight: 500`
- pane divider — `width: 1px; align-self: stretch; background: bg2`
- swatch row — 7 blocks `19×11px`, `gap: 4px`, `margin-top: 14px`
- prompt line — `margin-top: 22px`; cursor `8×15px`, orange, `margin-left: 7px`, `translateY(2px)`, `animation: 1.1s steps(1) infinite`

### Featured card
- label row — `gap: 12px`, `margin-bottom: 16px`; rule is `flex:1; height:1px; background: bg2`
- card — `bg1`, 1px `bg2`, radius 10px, padding `26px 26px 22px`
- hover — border → orange, `translateY(-2px)`
- path line — 12px, `margin-bottom: 11px`
- lede — `margin: 12px 0 18px`
- tags — `gap: 8px`, pill padding `2px 9px`

### Recent activity rows
- padding `8px 10px`, radius 6px, `gap: 12px`, `align-items: baseline`
- **must clip:** `display:flex; max-width:100%; min-width:0; overflow:hidden`
- hash `flex: none`; kind `flex: none; width: 44px`; title `flex:1; min-width:0` with ellipsis
- arrow — `opacity: 0; transform: translateX(-4px)`, both released on row hover

### Garden tree
- card — `bg1`, 1px `bg2`, radius 8px, padding `20px 22px`, 13px, **lh 1.95**, `overflow-x: auto`
- row — padding `1px 6px`, `margin: 0 -6px`, radius 5px, `align-items: baseline`
- connectors — `white-space: pre`, gray; `├─ ` / `└─ ` on the row, `│  ` / `   ` for ancestors
- top-level directories after the first get `margin-top: 5px`
- note row inner — `gap: 8px`; description `flex:1; min-width:0` with ellipsis
- maturity dot — 7px, `align-self: center`, `title` attribute carries the stage name

### Filter chips
- row `gap: 6px`, `margin-bottom: 18px`; leading `N notes:` label has `margin-right: 8px`
- chip — padding `4px 12px`, radius 999px, `gap: 7px`, 13px; dot 8px
- active — `bg1` fill, `bg3` border, `fg1` text; inactive — transparent, `bg2` border, `fg2`
- count span at `opacity: .55`

### Folder listing
- `DIR` badge — display 12px, ls 1.5px, 1px `bg3`, radius 4px, padding `2px 8px`, aqua
- header row `gap: 12px`, `margin-bottom: 6px`; `h1` margin `0 0 12px`; overview margin `0 0 20px`
- card — `bg1`, 1px `bg2`, radius 8px, `overflow: hidden`
- row — padding `16px 18px`, `gap: 10px 14px`, `align-items: flex-start`, `flex-wrap: wrap`, separator 1px `bg2`
- kind badge — `width: 46px; text-align: center`, padding `3px 0`, radius 4px, 1px outline in the badge color, `opacity: .85`, `margin-top: 2px`
- name/title row `gap: 9px`; description `margin-top: 5px`
- right meta — `gap: 6px`, 12px, `margin-top: 3px`; dot 7px (notes only)

### Article chrome
- breadcrumbs — 12px, `gap: 7px`, `margin-bottom: 26px`, `overflow-wrap: anywhere`
- meta row — `gap: 16px`, 12px, `margin-bottom: 16px`; dot 8px
- lede — `margin: 0 0 32px`
- tag pill — padding `1px 9px`, radius 999px, 12px, transparent + 1px `bg3`
- stub panel — 1px **dashed** `bg3`, radius 8px, `bg1`, padding `18px 20px`, `gap: 13px`; dot 9px with `margin-top: 7px`
- series card — 1px `bg2`, radius 8px, `bg1`; row padding `11px 16px`, `gap: 12px`
- backlinks / related panel — 1px `bg2`, radius 8px, `bg1`, padding `16px 18px`, 13px; `└─` rows padding `5px 0`, `gap: 8px`
- TOC — item padding `5px 0 5px 14px`, `margin-left: -1px`, 1px transparent left border over a 1px `bg2` rail; label `margin-bottom: 12px`
- note-info card — 1px `bg2`, radius 8px, `bg1`, padding `14px 16px`, `gap: 11px`

### Code block
- outer — 1px `bg2`, radius 8px, `overflow: hidden`, `margin: 0 0 24px`
- header — `bg0-soft`, 1px `bg2` bottom; tab padding `9px 18px 8px`, 1px `bg2` right border,
  `box-shadow: inset 0 2px 0 orange`, 7px orange square (radius 2px) + 12px filename
- language label — right-aligned, padding `0 16px`, 11px, ls `.5px`
- gutter — `bg0-soft`, padding `16px 12px`, right-aligned, gray, `user-select: none`,
  1px `bg1` right border, `flex: none`
- code — padding `16px 20px`, `overflow-x: auto`, `flex: 1; min-width: 0`, lh 1.8

### Command palette
- scrim — `position: fixed; inset: 0`, `rgba(12,10,8,.66)`, 3px blur, padding `14vh 20px 20px`
- panel — `max-width: 560px`, `bg1`, 1px `bg3`, radius 10px, shadow `0 30px 80px -20px rgba(0,0,0,.8)`
- input row — padding `13px 16px`, 1px `bg2` bottom, `gap: 10px`; orange `/` at 16px; input 15px; `esc` chip 1px `bg3`, radius 4px, padding `1px 6px`
- results — `max-height: 48vh`, `overflow-y: auto`, padding 6px
- row — padding `9px 11px`, radius 6px, `gap: 12px`; selected row background `bg1`
- type badge — `width: 46px`, 9.5px, ls `.5px`, radius 4px, 1px outline `fg4`, `opacity: .85`
- footer — `bg0-soft`, 1px `bg2` top, padding `9px 14px`, 12px, `gap: 16px`

### Status bar
- `bg0-hard`, 1px `bg2` top; segments padding `6px 14px`, 12px, ls `.5px`
- mode block — orange, `#282828` text, display 700
- path and location segments — `bg1`
- middle group — `gap: 16px`; `git:` label in `fg4`
- wraps rather than overflowing

### Scrollbars
```css
::-webkit-scrollbar        { height: 9px; width: 9px }
::-webkit-scrollbar-track  { background: var(--bg1) }
::-webkit-scrollbar-thumb  { background: var(--bg3); border: 2px solid var(--bg1) }
```

---

## Motion

| Transition | Duration |
|---|---|
| Link / nav color | `.12s` |
| Row background | `.12s` |
| Border color, search button | `.14s` |
| Card hover (border + transform + background) | `.18s` |
| Arrow reveal | `.18s`, `translateX(-4px) → 0`, `opacity 0 → 1` |
| Prompt cursor blink | `1.1s steps(1) infinite` |
| Uptime tick | 1s |

```css
@keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
```

Honor `prefers-reduced-motion`: disable the cursor blink and the hover transform.
