# Handoff: brandoncharest.dev — terminal-style dev blog & digital garden

## Overview

A redesign of a personal developer blog / digital garden. The concept is a **TUI (terminal
user interface) aesthetic** — a neofetch-style intro card, a `tree`-rendered note index,
`git log`-style recent activity, a tmux-style status bar, and a `⌘K` command palette —
executed with real editorial typography and a warm Gruvbox palette rather than a
stereotypical neon-green terminal.

Five screens: **Home**, **Garden** (note index), **Folder** (category landing page),
**Article** (blog post + garden note), and **Now / About**.

## About the design files

The files in this bundle are **design references created in HTML** — a prototype showing
intended look and behavior. They are **not production code to copy directly**.

`Brandon Charest Site.dc.html` is authored in a bespoke HTML component runtime
(`support.js`), which is included only so the prototype opens and runs in a browser. Do
**not** port that runtime. Ignore `<sc-for>`, `<sc-if>`, `{{ }}` holes, and
`class Component extends DCLogic` — they are prototype scaffolding. The template's inline
styles, exact hex values, spacing, and copy **are** the spec.

Recreate these designs in the target codebase's existing environment (React, Astro, Next,
Eleventy, etc.) using its established patterns. If no codebase exists yet, this design
suits a static site generator well — the content is Markdown-shaped (front-matter with
`title`, `stage`, `tags`, `tended` date) and the whole site is read-only.

## Fidelity

**High-fidelity.** Colors, typography, spacing, and interactions are final. Every hex is
deliberate and governed by the palette rules in `PALETTE.md` — read that file before
changing any color. Recreate pixel-faithfully.

---

## Design tokens

### Color — Gruvbox, one job per color

Exactly 17 hex values are permitted site-wide. Do not introduce others.

**Surfaces**

| Token | Hex | Job |
|---|---|---|
| `bg0-hard` | `#1d2021` | Nav bar + status bar **only** |
| `bg0` | `#282828` | Default page surface (home, garden, folder, tags, about) |
| `bg0-soft` | `#32302f` | Blog post + garden note reading pages (full-bleed), card title bars, code gutter |
| `bg1` | `#3c3836` | Cards, nested panels, code block background, hover row background |
| `bg2` | `#504945` | Borders |
| `bg3` | `#665c54` | Subtle dividers, tag pill borders, breadcrumb separators |

**Foreground**

| Token | Hex | Job |
|---|---|---|
| `fg1` | `#ebdbb2` | Body prose, headings, primary values. The only color for running text. |
| `fg2` | `#d5c4a1` | Small or critical meta — timestamps, read time, descriptions, tags, filenames |
| `fg4` | `#a89984` | Larger or non-critical decorative text — breadcrumbs, TOC items, section labels, nav index numbers |

**Accents — each has exactly one job**

| Token | Hex | Job |
|---|---|---|
| `orange` | `#fe8019` | Primary actionable signal: nav active pill, brand/username, shell prompt user, CTA links, status-bar mode |
| `aqua` | `#8ec07c` | Headings — post `h2`/`h3`, **and directory names** (a directory is the heading of a tree) |
| `yellow` | `#fabd2f` | "growing" maturity badge only |
| `green` | `#b8bb26` | "evergreen" maturity badge — **and** the homepage "online" status dot (documented exception, see `PALETTE.md`) |
| `gray` | `#928374` | "seedling" badge, disabled states, de-emphasized chrome (tree connectors, line numbers, prompt punctuation) |
| `blue` | `#83a598` | Inline prose links **only** — always underlined, never color alone |
| `purple` | `#d3869b` | "FEATURED" label only — must stay bold and ≥14px for contrast |
| `red` | `#fb4934` | Errors and warnings only (currently unused in the UI) |

**Two sanctioned exceptions** (do not "fix" these):
1. **Code blocks** use full multi-hue Gruvbox syntax highlighting.
2. **The neofetch swatch row** paints the accents decoratively — it is literally a palette display.

### Typography

Three families, loaded from Google Fonts:

| Family | Weights | Used for |
|---|---|---|
| `Space Mono` | 400, 700 | Display voice — page titles (`h1`), post headings (`h2`), section labels, brand logo, status-bar mode |
| `IBM Plex Mono` | 400, 500, 600, 700 | Terminal chrome — nav, prompts, file tree, breadcrumbs, meta, status bar |
| `IBM Plex Sans` | 400, 500, 600, 700 | Running prose — article body, intro blurbs, descriptions |
| `JetBrains Mono` | 400–700 | Code only — code blocks, inline `<code>`, the `// currently` aside. Ligatures on. |

**Type scale**

| Role | Size / weight / spacing |
|---|---|
| Page `h1` | 40px / 700 / `-.6px` / line-height 1.12 — Space Mono |
| Post `h2` | 26px / 700 / `-.2px` — Space Mono, aqua, `scroll-margin-top:78px` |
| Pinned card title | 26px / 700 / `-.4px` — Space Mono |
| Article body | 17px / line-height 1.75 — IBM Plex Sans, `fg2` |
| Intro blurb / lede | 19px / line-height 1.65 — IBM Plex Sans, `fg1`, 2px `bg3` left rule, 18px padding |
| Body default | 13px / line-height 1.7 — IBM Plex Mono |
| Meta, labels | 12px |
| Code | 14px / line-height 1.8 — JetBrains Mono |
| Section labels | 12px / letter-spacing 1.5px, `fg4`, prefixed `::` |

### Layout & spacing

- **One content width across every screen: `max-width: 920px`, centered, 18px side gutters.**
  This is deliberate — the site previously had five different widths and content visibly
  lurched sideways between pages. Do not vary it.
- Article: flex-wrap row, body `flex:1 1 380px; max-width:620px`, sidebar `flex:0 1 220px; min-width:180px`, gap `32px 40px`.
- Vertical page padding: 42px top / 84px bottom (50px top on Now/About, 38px on Article).
- Border radius: 3px (nav pill), 4px (small badges), 6px (rows, search field), 8px (cards, code), 10px (pinned card, palette), 999px (pills/chips).
- Sticky header; sticky sidebar at `top: 78px`.

---

## Screens

### 1. Home

**Purpose:** Introduce Brandon, surface the featured post, list recent activity.

**Terminal card** — `bg1`, 1px `bg2` border, radius 8px, `box-shadow: 0 24px 60px -34px rgba(0,0,0,.85)`, `width: fit-content` (max 100%).
> The card sizes to its content deliberately. Stretching it full-width leaves ~294px of dead space.

- **Title bar:** `bg0-soft`, 1px `bg2` bottom border, 9px/14px padding. Three 11px dots in `gray` / `bg3` / `bg2` (deliberately *not* red-amber-green — those colors have other jobs). Centered 12px `fg2` label: "Welcome".
- **Screen:** 20px/24px/14px padding. Contents:
  - Identity banner: `brandon` (aqua) `@` (gray) `dev` (orange), Space Mono 15px 700; then a 1px `bg3` rule.
  - Three-column row (`flex`, wraps): **ASCII coffee cup** (JetBrains Mono 14px, orange, `align-self:center`) — **stats table** — 1px `bg2` vertical divider — **intro blurb**.
  - Stats: 7 rows, `fg4` label in a 74px fixed column, `fg2` value. Rows: Role, Focus, Garden, Editor ("neovim btw"), 9–5, After-hrs, Location. Plus a Status row with a green `●` and "online".
  - Swatch row: 7 blocks, 19×11px — red, orange, yellow, green, aqua, blue, purple.
  - Blurb: IBM Plex Sans 16px `fg1`; below it a 12px JetBrains Mono aside — gray `//` + `fg2` "currently: building a redis clone, for fun".
  - **Shell prompt, last line, bottom-left:** `margin-top: 22px`. Orange `visitor@dev`, gray `:~$`, then `neofetch`, then an 8×15px orange block cursor blinking at `1.1s steps(1) infinite`.

**Featured section** — label `★ FEATURED` in purple, Space Mono 14px 700, letter-spacing 2px, followed by a 1px `bg2` rule filling remaining width.
Card: `bg1`, 1px `bg2`, radius 10px, 26px padding. Hover: border → orange, `translateY(-2px)`, background `#221d18`→`bg1` lift. Contains aqua `~/blog/` + `fg2` filename + date, 26px title with an arrow that fades in on hover, 17px lede, three uniform tag pills.

**Recent activity** — a `git log --oneline` prompt line, then rows of: `fg4` 6-char hash, `fg2` kind, `fg2` title (ellipsis truncated), hover-revealed orange arrow. Rows must clip: `max-width:100%; min-width:0; overflow:hidden`.

### 2. Garden

**Purpose:** Browse all notes as a file tree.

- `h1` "The Garden", 17px IBM Plex Sans lede.
- Prompt line: `visitor@dev:~$ tree ~/garden --filter=<active>`; right-aligned "# browse all tags →" link (orange `#`).
- **Filter chips:** `N notes:` then four pills — all / seedling / growing / evergreen — each with a maturity dot and count. Active: `bg1` fill, `bg3` border, `fg1` text. Inactive: transparent, `bg2` border, `fg2`.
- **Tree:** `bg1` card, 1px `bg2`, radius 8px, 20px/22px padding, `overflow-x: auto` (a wide tree scrolls sideways — correct terminal behavior, do not wrap).
  - Root `~/garden/` in aqua 600.
  - Directory rows: gray `├─ └─ │` connectors (`white-space: pre`), aqua 600 name.
  - Note rows: connectors, `fg2` `[kind]` badge, `fg1` filename, `fg2` description (ellipsis), and a right-aligned 7px maturity dot.
  - Row hover: `#221d18` background, radius 5px.
  - Nesting uses real connector prefixes — `│  ` for continuing ancestors, `   ` for the last.

### 3. Folder (category landing page)

**Purpose:** A high-level hub for a category or project, mirroring real URLs like `/garden/projects/6502_emulator/`.

- Breadcrumbs (`fg4`, `bg3` `/` separators), every segment routable.
- Aqua `DIR` badge (Space Mono 12px, letter-spacing 1.5px, `bg3` border, radius 4px), optional maturity dot + label, note count.
- 40px `h1`, 15px overview paragraph, uniform tag pills.
- `visitor@dev:~$ ls <path>` prompt (path in aqua).
- **Child listing:** `bg1` card; each row has a 46px outlined kind badge, `fg2` name, `fg1` Space Mono title, `fg2` description, and right-aligned maturity dot + meta ("N notes" / stage). Rows wrap on narrow screens.

### 4. Article

Two variants driven by whether the entry is a full post or a still-growing note.

- Full-bleed `bg0-soft` background (this is the only screen that changes page surface).
- Breadcrumbs → 40px `h1` → meta row (maturity dot + label, read time, date, tag pills) → 19px lede with `bg3` left rule.
- **Full post:** prose in IBM Plex Sans 17px `fg2`; `h2`s in aqua with `##` omitted (plain text, no markdown sigils); `<strong>`/`<em>` in `fg1`; inline `<code>` in JetBrains Mono 14px on `bg1` with orange text; prose links blue + underlined with 3px offset.
- **Code block:** `bg1` card. Header bar (`bg0-soft`) with a filename tab and a right-aligned language label. Body is a flex row: a `bg0-soft` line-number gutter (gray, `user-select:none`, right-aligned, 1px `bg1` right border) and the scrollable code. Full multi-hue Gruvbox syntax highlighting.
- **Growing note (stub):** a dashed `bg3` panel explaining the note is still growing, plus "related notes" (tag overlap) and, when applicable, a "PART OF A SERIES" list with an ordinal per entry and a "you are here" marker.
- **Backlinks:** a terminal-style panel — "> tracing incoming references…", "> N links found", then `└─` rows.
- **Sidebar (≥820px only):** `:: ON THIS PAGE` (`fg4`) with numbered TOC items in `fg4`, 1px `bg2` left rail; hover/active turns the item and its rail segment orange. Garden notes get `:: NOTE INFO` instead — a `bg1` card with STAGE / LAST TENDED / TAGS.

### 5. Now / About

Simple prose pages: prompt line (`cat ~/now.md`), 40px `h1`, single 17px IBM Plex Sans paragraph capped at 68ch.

### Chrome (all screens)

- **Header:** sticky, `bg0-hard`, 1px `bg2` bottom border, `backdrop-filter: blur(10px)`. Left: brand logo. Right: search button (`bg1`, `bg2` border, `/ search ⌘K`) + nav. Both the row and the nav wrap on narrow screens.
- **Nav:** five items, each an index number + label. Active = solid orange pill, `#282828` text and number. Inactive = transparent, `fg2` label, `fg4` number, hover → `fg1`.
- **Status bar:** `bg0-hard`. Orange mode block (Space Mono 700, `#282828` text) → `bg1` path segment → spacer → `fg4` `git:`+main, UTF-8, `fg2` live uptime → `bg1` "Boston, MA". Wraps rather than overflowing.

---

## Interactions & behavior

**Routing** — single-page state machine. `screen ∈ {home, garden, folder, article, now, about, tags}`. Every navigation resets scroll to top. Nav highlights `garden` when on `folder` or `tags`.

**Keyboard**
| Key | Action |
|---|---|
| `1`–`5` | Jump to home / garden / blog / now / about |
| `/` | Open command palette |
| `⌘K` / `Ctrl+K` | Toggle palette |
| `↑` `↓` | Move palette selection (wraps) |
| `Enter` | Open selection |
| `Esc` | Close palette |

Number and `/` shortcuts must be suppressed while focus is in an `input`/`textarea`, and while the palette is open.

**Command palette** — fixed overlay, `rgba(12,10,8,.66)` + 3px blur, panel max 560px, opens at `14vh`. Indexes pages, notes, folders, and tags. Empty query shows pages + first 4 notes.

*Search ranking* — substring match scores `1000 - index*2 - lengthPenalty`; otherwise subsequence match scores `200 - lengthPenalty`; a description match is penalized 60 versus a title match. Top 9 results. Rows show a uniform `fg4` type badge, label, sub-label, and `↵`.

**Tag filtering** — clicking any tag routes to Garden filtered by that tag, showing a "filtering by <tag> ✕ clear" bar. Stage filter and tag filter compose. Folders with no surviving children are pruned from the tree entirely.

**Hover** — rows shift background to `#221d18`; the pinned card lifts 2px and borders orange; arrows translate in from `-4px` at `.18s`; nav/link color transitions `.12–.14s`.

**Live** — uptime counter ticks each second, formatted `HH:MM:SS`. Prompt cursor blinks `1.1s steps(1) infinite`.

**Responsive** — no CSS media queries; the layout wraps. One JS breakpoint at **820px** (`resize` listener) hides the TOC and note-info sidebars, which would be dead weight stacked under an article on a phone. Verified clean at 390px. In a real codebase, prefer a CSS media query or container query over the JS listener.

---

## State

| Key | Type | Notes |
|---|---|---|
| `screen` | string | Active view |
| `activeNote` | string | Note/post id for the article view |
| `activeFolder` | string | Folder id for the folder view |
| `filter` | `all\|seed\|grow\|ever` | Maturity filter |
| `tagFilter` | string \| null | Active tag |
| `misc` | `now\|about` | Which prose page |
| `paletteOpen` / `query` / `active` | bool / string / int | Command palette |
| `secs` | int | Uptime tick |
| `isNarrow` | bool | Viewport < 820px |

**Content model** — the garden is a recursive tree of folders and notes. A folder has `id`, `name` (URL segment), `title`, `overview`, optional `stage`/`tags`, and `children`. A note has `id`, `name` (filename), `title`, `desc`, `kind` (`note|proj|log|snip`), `stage` (`seed|grow|ever`), `tags[]`, `tended`, and optional `series`. Breadcrumbs, paths, counts, and backlinks are all derived by walking this tree — no path strings are hardcoded. This maps cleanly onto a content directory with front-matter.

## Assets

No images. The coffee cup is inline ASCII art (kept as text so it recolors with the palette and stays crisp at any zoom). Fonts come from Google Fonts. No icon library — the two social glyphs in an earlier revision were inline SVG; current chrome uses text symbols (`★ ↵ ✕ ● → ├─ └─`).

## Files

| File | What it is |
|---|---|
| `Brandon Charest Site.dc.html` | The full design prototype — all five screens. Open directly in a browser. |
| `support.js` | Prototype runtime. Required only to view the file. **Do not port.** |
| `PALETTE.md` | Palette rules and the documented exceptions. Authoritative for color. |

## Known constraints carried over

- The prototype's article content is a single real post ("Escaping tutorial hell") plus 14 garden notes; other notes render the "still growing" stub. Real content should come from the CMS/content directory.
- Note counts in the neofetch stats block are hardcoded strings; derive them in the real build.
