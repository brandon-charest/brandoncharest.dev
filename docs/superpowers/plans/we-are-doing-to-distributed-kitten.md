# Gruvbox TUI Redesign — Implementation Plan

> **For agentic workers:** Phases are **gated**. Do not start phase N+1 until phase N's exit
> criteria are met and signed off. Steps use checkbox (`- [ ]`) syntax for tracking.

## Context

The site currently runs a monochrome-teal terminal theme at 1400px width, built on Apollo +
24 SCSS partials. A design handoff (`design_handoff_devblog/`) replaces it with a **Gruvbox
TUI aesthetic**: neofetch intro card, `tree`-rendered garden index, `git log` recent activity,
tmux-style status bar, ⌘K command palette — at a **single 920px content width across every
screen**, with real editorial typography (Space Mono / IBM Plex Mono / IBM Plex Sans /
JetBrains Mono) instead of a stereotypical neon terminal.

This is a **re-skin plus layout change**, not a rewrite of the content model. Growth stages
(`seedling|growing|evergreen`) and content types (`note|blog|project|reference|tutorial|
snippet|log`) already exist in frontmatter and map cleanly onto the design's `seed|grow|ever`
and `note|proj|log|snip`.

The handoff's two color documents contradicted each other in several places, and the HTML
prototype contradicted the handoff README in several more. Those are resolved below and must
not be re-litigated mid-implementation.

**Environment:** Zola **0.17.2**, Tera, SCSS (`compile_sass`), vanilla JS. No new runtime
dependencies. Apollo remains a submodule; local `templates/` and `sass/` override it.

---

## Resolved specification

These decisions are final. Phase 0 writes them into the repo so later phases have one source
of truth.

| # | Question | Decision |
|---|---|---|
| 1 | Directory names in tree / `DIR` badge / `ls <path>` | **Aqua `#8ec07c`**, weight 600. Aqua's job widens to "headings — including directory names". Amend the palette reference's tree rule. |
| 2 | Article body prose | **`fg2 #d5c4a1`**, with `<strong>`/`<em>` at `fg1 #ebdbb2`. All other prose surfaces (home blurb, garden lede, folder overview, article lede, now/about) stay `fg1`. |
| 3 | Row hover inside `bg1` cards | **`#221d18`** — sanctioned as an **18th** hex. The "exactly 17" rule becomes "exactly 18". |
| 4 | Light theme | **Dropped.** `theme = "dark"`, delete `sass/theme/light.scss`. |
| 5 | `/blog` and `/tags/<tag>/` | Both use the **Folder listing primitive** (breadcrumbs → badge → h1 → overview → `ls` prompt → bg1 card of child rows). |
| 6 | Command palette | **Custom** palette + compact Tera-emitted JSON index. `build_search_index = false`; elasticlunr's 1.2 MB index removed. |
| 7 | Home terminal card width | **`fit-content`, max 100%** (the README's "~294px dead space" arithmetic corroborates it; the prototype's `width:100%` is stale). |
| 8 | GitHub / LinkedIn | Move to a **status bar segment** as text links. |

### Prototype bugs — fix by the documented rule, do not reproduce

| Where | Bug | Fix |
|---|---|---|
| Featured card tags | `background:#3c3836`, no border → invisible on the bg1 card | transparent + `1px solid bg3`, like every other pill |
| Folder rows, series rows | `border-bottom:1px solid #3c3836` on a `#3c3836` surface → invisible | `bg2 #504945` |
| Code block body | no background set → inherits `bg0-soft`, identical to the article surface | body `bg1`; header bar and gutter stay `bg0-soft` |
| Child-listing `dir` badge | orange, while the folder header's `DIR` badge is aqua | aqua, per decision 1 |
| Subdirectory rows | orange maturity dot next to "N notes" | no dot for directories |
| Tree / folder / series row hover | `#3c3836` on `#3c3836` → no-op | `#221d18`, per decision 3 |

### Colors that need sanctioning (not bugs — write them down)

- Inline `<code>`: orange on `bg1`.
- Code-block filename tab: orange 7px square + `inset 0 2px 0` orange rule.
- Prose list bullets: orange `-`.
- Alpha layers, which are not new hues: `::selection rgba(254,128,25,.30)`, card shadow
  `rgba(0,0,0,.85)`, palette scrim `rgba(12,10,8,.66)`.

---

## Working principles

- **Tokens only.** No raw hex in component SCSS. Every value resolves through `sass/_tokens.scss`.
- **One screen per phase**, each ending in a clean `zola build` and a commit.
- **Reuse before adding.** Grep for an existing class, macro, or partial first.
- **No content migration** unless a phase explicitly calls for it.
- Branch `gruvbox-redesign` off the current `design-refresh` (keeps its hub-table/footer
  cleanups). Never commit to `main`.

## Verification model

No test suite exists. Every phase verifies by:

1. `zola build` exits 0.
2. `zola serve` → visually check each surface the phase touched, at **1440px, 820px, and 390px**.
3. DevTools: no new console errors, no broken links.
4. `grep -roE '#[0-9a-fA-F]{6}' sass/ templates/ | grep -vf docs/design/allowed-hexes.txt`
   returns nothing.

---

## Phase 0 — Reconcile the spec (docs only) 🚦

No code. Produces the artifact every later phase reads.

- [ ] Create `docs/design/PALETTE.md`: the 18 hexes with their single jobs, decisions 1–8,
      the sanctioned-color list, and the prototype-bug table above.
- [ ] Create `docs/design/allowed-hexes.txt` — one hex per line, used by the grep gate.
- [ ] Copy the handoff's type scale, spacing, and radius tables into `docs/design/TOKENS.md`.

**Gate:** Brandon reads `docs/design/PALETTE.md` and confirms it matches intent. Colors are
not reopened after this point.

---

## Phase 1 — Token foundation + global chrome 🚦

Everything else sits on this. No screen bodies change yet; every page keeps its current
content but gains the new shell.

**Files:** `sass/_tokens.scss` (new), `sass/main.scss`, `sass/parts/_chrome.scss` (new),
`config.toml`, `templates/base.html`, `templates/partials/header.html`,
`templates/partials/nav.html`, `templates/partials/statusbar.html` (new),
`sass/theme/light.scss` (delete), `sass/fonts.scss`.

- [ ] `sass/_tokens.scss`: 18 hexes as semantic custom properties (`--bg0-hard`, `--bg0`,
      `--bg0-soft`, `--bg1`, `--bg2`, `--bg3`, `--hover`, `--fg1`, `--fg2`, `--fg4`, plus the
      8 accents), the four font stacks, radii (3/4/6/8/10/999px), and `--content: 920px`.
- [ ] Keep the old `--accent`/`--text-primary`/… names as aliases pointing at Gruvbox values
      so untouched partials keep compiling. Aliases are deleted in Phase 8.
- [ ] `config.toml`: `theme = "dark"`; add `{ name = "Home", url = "/", weight = 0 }` to
      `extra.menu`; keep `location`/`branch`; keep `socials`.
- [ ] Delete `sass/theme/light.scss` and its `@import`; remove `:root.light` blocks
      (`sass/parts/_garden.scss` has one).
- [ ] `header.html`: replace the Inter + JetBrains Google Fonts link with the handoff's
      four-family link (`Space Mono` 400/700, `IBM Plex Mono` 400–700, `IBM Plex Sans`
      400–700, `JetBrains Mono` 400–700, `display=swap`); drop the light-theme `<link>` and
      the `themetoggle.js` branch; drop `syntax-theme-light.css`.
- [ ] Delete the duplicate self-hosted JetBrains Mono `@font-face` in `sass/fonts.scss` and
      the unused `static/fonts/SpaceGrotesk` + `zed-fonts` directories.
- [ ] `base.html`: 920px centered container with 18px gutters; drop `--page-width: 1400px`,
      `.ambient-shape`, and the html dot-grid background.
- [ ] Sticky header (`bg0-hard`, 1px `bg2` bottom, `backdrop-filter: blur(10px)`): brand
      `brandoncharest@dev:~` + search button (`/ search ⌘K`) + 5-item nav with index numbers.
      Active = solid orange pill with `#282828` text; `garden` stays active on folder and tag
      routes. Row and nav both wrap.
- [ ] `partials/statusbar.html`: orange mode block → `bg1` path segment → spacer →
      `fg4 git:` + branch, `UTF-8`, uptime → `gh:` / `in:` social text links → `bg1` location.
      Uptime accumulates across navigation via `sessionStorage`, ticking `HH:MM:SS`.
- [ ] Retire the old `footer.system-status`.

**Gate:** every existing route renders with the new header and status bar; nav active state is
correct on `/`, `/blog`, `/garden`, a nested garden note, `/tags/rust/`, `/now`, `/about`;
chrome wraps cleanly at 390px; `zola build` clean.

---

## Phase 2 — Article screen 🚦

The highest-value surface — 45 pages use it.

**Files:** `templates/page.html`, `templates/blog.html`, `templates/macros/meta.html`,
`templates/macros/toc.html`, `templates/partials/backlinks.html`,
`sass/parts/_article.scss` (new).

- [ ] Unify `page.html` and `blog.html` onto one article layout: full-bleed `bg0-soft`,
      920px inner row, `flex-wrap`, body `flex:1 1 380px; max-width:620px`, sidebar
      `flex:0 1 220px; min-width:180px`, gap `32px 40px`, padding `38px 18px 84px`.
- [ ] Breadcrumbs from `page.components` (`fg4`, `bg3` separators, every segment routable) —
      reuse the path-walking loop already in `macros/ui.html::window_bar`.
- [ ] Header: 40px Space Mono `h1` → meta row (maturity dot + label, read time or
      "last tended", date, tag pills) → 19px `fg1` lede with a 2px `bg3` left rule from
      `page.description`.
- [ ] Prose: IBM Plex Sans 17px/1.75 `fg2`; `h2`/`h3` Space Mono 26px aqua with
      `scroll-margin-top:78px`; `<strong>`/`<em>` `fg1`; prose links blue + underline,
      3px offset; inline `<code>` JetBrains Mono 14px orange on `bg1`.
- [ ] TOC sidebar `:: ON THIS PAGE` — numbered items in `fg4` on a 1px `bg2` left rail;
      hover/active turns the item **and its rail segment** orange. Reuse `macros/toc.html`;
      add a scroll-spy observer for the active item.
- [ ] Garden notes get `:: NOTE INFO` instead: a `bg1` card with STAGE / LAST TENDED / TAGS.
      "Last tended" = `page.updated | default(value=page.date)`.
- [ ] Growing-note stub: dashed `bg3` panel, plus "related notes" by tag overlap (max 4) and
      a "PART OF A SERIES" list with ordinals and a "you are here" marker when
      `page.extra.series` is set.
- [ ] Backlinks: restyle `partials/backlinks.html` as the terminal panel
      ("> tracing incoming references…", "> N links found", `└─` rows). `page.backlinks`
      already works on 0.17.
- [ ] Replace the design's JS 820px breakpoint with a CSS media query that hides both sidebars.
- [ ] Preserve the `reference` man-page header variant in `macros/meta.html` or fold it into
      the standard header — decide during implementation, note which.

**Gate:** `/blog/escaping-tutorial-hell/`, a growing garden note, a note with a series, and a
`reference`-type page all render correctly; TOC scroll-spy tracks; backlinks list; sidebars
disappear below 820px; no horizontal scroll at 390px.

---

## Phase 3 — Code blocks & syntax highlighting 🚦

**Files:** `config.toml`, `highlight_themes/gruvbox-dark.tmTheme` (new),
`templates/partials/header.html`, `static/js/codeblock.js` (new local override),
`sass/parts/_code.scss`.

Zola 0.17.2 bundles **no** Gruvbox theme, and `linenos` requires a per-fence flag — 140 fences
across 37 files, so that is not viable without a content migration.

- [ ] Add a Gruvbox `.tmTheme` under `highlight_themes/`; set
      `extra_syntaxes_and_themes = ["highlight_themes"]`, `highlight_theme = "css"`,
      `highlight_themes_css = [{ theme = "gruvbox-dark", filename = "syntax-theme-dark.css" }]`.
      Verify the generated CSS covers keyword/string/function/type/comment distinctly; hand-patch
      the generated file's scope colors to the handoff's values if the theme drifts.
- [ ] `header.html`: link `/syntax-theme-dark.css` unconditionally (no light counterpart).
- [ ] Local `static/js/codeblock.js`, loaded through the **existing** `config.extra.fancy_code`
      hook (set it to `true`): wrap each `<pre>` in the design's card, build the header bar
      (filename tab from a leading `// path` comment when present — 5 blocks today; language
      label from `data-lang`, always), and generate the line-number gutter by splitting on
      newlines.
- [ ] CSS reserves the gutter width so enhancement causes no layout shift; with JS disabled the
      block still renders as a readable `bg1` card.
- [ ] Card: `bg1` body, `bg0-soft` header bar and gutter, gutter text gray with
      `user-select:none` and a 1px `bg1` right border, 8px radius, `overflow-x:auto`.
- [ ] Regression-check mermaid and MathJax blocks, which also emit `<pre>`.

**Gate:** all 140 fences render with Gruvbox colors, a language label, and a gutter; the 5
`// path` blocks show a filename tab; no layout shift on load; mermaid/MathJax unaffected.

---

## Phase 4 — Garden tree + folder listing 🚦

**Files:** `templates/garden.html`, `templates/section.html`,
`templates/macros/tree.html` (new), `sass/parts/_tree.scss` (new),
`sass/parts/_listing.scss` (new), `static/js/filters.js` (new).

- [ ] `macros/tree.html`: a recursive Tera macro (same `self::` recursion pattern already used
      in `section.html`) that walks sections and pages, passing an `ancestor_prefix` string
      down and emitting real connectors — `├─ ` / `└─ ` for the row, `│  ` for continuing
      ancestors, `   ` for the last. `white-space: pre` on the connector span.
- [ ] Garden page: `h1` "The Garden", 17px `fg1` lede, prompt
      `visitor@dev:~$ tree ~/garden --filter=<active>`, right-aligned "# browse all tags →".
- [ ] Filter chips: `N notes:` then all / seedling / growing / evergreen, each with a maturity
      dot and count. Active = `bg1` fill + `bg3` border + `fg1`; inactive = transparent +
      `bg2` border + `fg2`. Counts derived by walking the tree, not hardcoded.
- [ ] Tree card: `bg1`, 1px `bg2`, 8px radius, 20px/22px padding, `overflow-x:auto` (do **not**
      wrap). Root `~/garden/` aqua 600. Directory rows aqua 600. Note rows: connectors,
      `fg2 [kind]` badge, `fg1` filename, `fg2` description (ellipsis), right-aligned 7px
      maturity dot. Row hover `#221d18`, 5px radius.
- [ ] Description fallback for the 4 pages that lack one (use the title, or suppress the column).
- [ ] `?growth=` and `?tag=` filters compose, and **folders with no surviving children are
      pruned entirely**. Consolidate the two near-identical filter scripts currently inlined in
      `garden.html` and `section.html` into `static/js/filters.js`.
- [ ] `section.html` → folder screen: breadcrumbs, aqua `DIR` badge, optional maturity dot +
      label, note count, 40px `h1`, 15px overview from `section.description`, tag pills,
      `visitor@dev:~$ ls <path>` with the path in aqua, then the `bg1` child-listing card.
- [ ] Child rows: 46px outlined kind badge, `fg2` name, `fg1` Space Mono title, `fg2`
      description, right-aligned maturity dot + meta ("N notes" for dirs — **no dot**;
      stage label for notes). Rows wrap on narrow screens; separators `bg2`.
- [ ] Section `_index.md` bodies carry real markdown (headings, links). Render `section.content`
      as article-styled prose **below** the overview — the design has no slot for it, so this is
      a documented deviation.

**Gate:** the tree renders all ~43 notes at correct depth with correct connectors (spot-check
`garden/projects/systrem-builds/redis/devlog.md`, 4 levels deep); stage and tag filters
compose; empty folders vanish; the tree scrolls horizontally rather than wrapping; every
`_index.md` renders as a folder page.

---

## Phase 5 — Home 🚦

**Files:** `templates/home.html`, `templates/partials/neofetch.html`,
`sass/parts/_home.scss` (new).

- [ ] Terminal card: `bg1`, 1px `bg2`, 8px radius,
      `box-shadow: 0 24px 60px -34px rgba(0,0,0,.85)`, **`width: fit-content; max-width: 100%`**.
- [ ] Title bar: `bg0-soft`, 1px `bg2` bottom, 9px/14px padding, three 11px dots in
      `gray`/`bg3`/`bg2` (deliberately not red-amber-green), centered 12px `fg2` "Welcome".
- [ ] Screen: identity banner `brandon`(orange) `@`(fg2) `dev`(orange) in Space Mono 15px 700,
      then a 1px `bg3` rule; three-column flex row — ASCII coffee cup (JetBrains Mono 14px
      orange, `align-self:center`) / stats table / 1px `bg2` divider / intro blurb.
- [ ] Stats: 7 rows, `fg4` label in a fixed 74px column, `fg2` value — Role, Focus, Garden,
      Editor, 9–5, After-hrs, Location — plus a Status row with a green `●` and "online".
      **Garden counts are derived** from the section walk already implemented in `home.html`,
      not the handoff's hardcoded "14 notes · 1 post".
- [ ] Swatch row: 7 blocks 19×11px — red, orange, yellow, green, aqua, blue, purple.
- [ ] Blurb: IBM Plex Sans 16px `fg1`; below it a 12px JetBrains Mono aside with a gray `//`.
- [ ] Shell prompt as the last line, `margin-top:22px`: orange `visitor@dev`, gray `:~$`,
      `neofetch`, then an 8×15px orange block cursor blinking `1.1s steps(1) infinite`.
- [ ] FEATURED section: purple `★ FEATURED` label (Space Mono 14px 700, letter-spacing 2px)
      followed by a 1px `bg2` rule filling the remaining width. Card from the newest
      `extra.pinned` blog post: aqua `~/blog/` + `fg2` filename + date, 26px title with an
      arrow fading in on hover, 17px lede, three uniform tag pills. Hover: border → orange,
      `translateY(-2px)`.
- [ ] Recent activity: `git log --oneline ~/recent` prompt, then rows of `fg4` 6-char hash
      (derive from the slug, as `bloglist.html` already does), `fg2` kind, `fg2` ellipsised
      title, hover-revealed orange arrow. Rows must clip:
      `max-width:100%; min-width:0; overflow:hidden`.

**Gate:** all counts derived; the card sizes to its content and never exceeds 920px; long
titles truncate rather than overflow; hover states visible on every row; 390px clean.

---

## Phase 6 — Blog index, tags, now/about 🚦

**Files:** `templates/bloglist.html`, `templates/taxonomy_list.html` (new local override),
`templates/taxonomy_single.html` (new local override), `templates/prose.html` (new),
`content/about.md`, `content/now.md` frontmatter.

- [ ] `bloglist.html` → the folder-listing primitive from Phase 4 (`ls ~/blog`), keeping the
      pinned-first ordering.
- [ ] `taxonomy_list.html` → weighted tag cloud: `bg1` card, Space Mono 700, **uniform `fg2`**
      (the prototype's `tagPalette` is a single color — size varies, hue does not),
      `15 + round(count/max * 17)` px, count suffix in IBM Plex Mono 12px `fg2`. Prompt line
      `ls ~/tags | sort -rn  # N tags`. Counts from `get_taxonomy(kind="tags")`.
- [ ] `taxonomy_single.html` → the folder-listing primitive (`ls ~/tags/<tag>`).
- [ ] `prose.html` for `/now` and `/about`: prompt line (`cat ~/now.md`), 40px `h1`, then the
      **full markdown body** styled with the Phase 2 prose rules on a `bg0` surface, capped at
      68ch. The handoff specifies a single paragraph; the real pages have headings, lists,
      links, and a blockquote — documented deviation.
- [ ] Point `now.md` and `about.md` at `template = "prose.html"`.

**Gate:** every URL in `public/sitemap.xml` renders in the new system; nothing still shows old
chrome; tag links from articles, tree rows, and the palette all resolve.

---

## Phase 7 — Command palette & keyboard 🚦

**Files:** `templates/search-index.html` (new, emits JSON), `static/js/palette.js` (new),
`templates/partials/nav.html`, `config.toml`, `sass/parts/_palette.scss` (new).

- [ ] A Tera template writes `/search-index.json` — pages, notes, folders, and tags with
      `type`, `label`, `sub`, `url` only (no body text). Expect ~25 KB.
- [ ] `build_search_index = false`; delete the elasticlunr modal markup from `nav.html` and the
      `searchElasticlunr` script tags from `header.html`. This removes a 1.2 MB payload.
- [ ] `palette.js` implements the handoff's ranking exactly: substring match scores
      `1000 − index*2 − lengthPenalty`; otherwise subsequence match scores
      `200 − lengthPenalty`; a description match is penalized **60** versus a title match;
      top **9** results. Empty query shows pages + the first 4 notes.
- [ ] Overlay `rgba(12,10,8,.66)` + 3px blur, panel max 560px opening at `14vh`, `bg1` panel
      with `bg3` border and 10px radius. Rows: uniform `fg4` type badge (46px, outlined),
      label, sub-label, `↵`. Footer hint bar on `bg0-soft` with a result count.
- [ ] Keyboard: `⌘K`/`Ctrl+K` toggle, `/` open, `↑`/`↓` move with wraparound, `Enter` open,
      `Esc` close, `1`–`5` jump to home/garden/blog/now/about. Number and `/` shortcuts are
      **suppressed while focus is in an `input`/`textarea` and while the palette is open**.
- [ ] Focus trap and `aria-*` on the dialog; restore focus to the trigger on close.

**Gate:** full keyboard matrix verified by hand, including suppression inside the palette
input; index under 50 KB; no console errors; palette usable with keyboard only.

---

## Phase 8 — Cleanup, content hygiene, final QA 🚦

- [ ] Delete SCSS partials with no surviving references. Candidates, each confirmed by grep
      first: `_cards`, `_character`, `_flags`, `_panes`, `_highlights`, `_talks`,
      `_growth-indicators`, `_garden-meta`, `_hub-table`, `_neofetch`, `_terminal`, `_footer`,
      `_search`, `_misc`.
- [ ] Remove the backward-compat token aliases added in Phase 1.
- [ ] Delete `templates/macros/ui.html` macros no longer called (`window_bar`, `cmd`,
      `pane_*`, `flag_*`, `card_*`) — grep before each deletion.
- [ ] Content metadata fixes: `type = "notes"` → `"note"`; `type="resource"` ×2 → a valid type;
      strip trailing spaces from `growth = "growing" ` ×3; `about.md`'s stray
      `status = "evergreen"` → `[extra] growth = "evergreen"`; add `description` to the 4 pages
      missing one.
- [ ] `content/garden/projects/systrem-builds/_index.md` combines `sort_by = "weight"` with
      `transparent = true`, so the 4 bubbled redis/http notes have no `weight` and Zola drops
      them from that section's page list (build warning on every run). Set `sort_by = "date"`
      to match every other section. Harmless today — the garden index sources those notes from
      their own subsections — but it will bite any future listing that reads
      `systrem-builds.pages`.
- [ ] Ten `Highlight language text not found` warnings come from ```` ```text ```` fences.
      Switch them to ```` ```txt ```` (a real Syntect name) or drop the language.
- [ ] Palette audit: the grep gate returns nothing outside the 18 hexes.
- [ ] Contrast spot-check the handoff's table against the shipped CSS.
- [ ] Confirm RSS (`atom.xml`), `sitemap.xml`, `robots.txt`, favicon, and the Umami snippet all
      survive.
- [ ] Side-by-side visual QA against the prototype: open `Brandon Charest Site.dc.html` in one
      window and `zola serve` in another; walk all five screens at 1440 / 820 / 390px.

**Gate:** clean build, empty palette-grep, no console errors, side-by-side sign-off.

---

## Out of scope

- Porting the prototype's `support.js` runtime or its SPA state machine (the site stays an MPA;
  scroll-reset and routing are the browser's job).
- Client-side tag filtering of the garden as the *primary* tag UX — real `/tags/<tag>/` pages
  serve that, with `?tag=` retained only as a garden-page refinement.
- A light theme.
- Any new npm/cargo dependency.
- Rewriting note content; only the frontmatter fixes listed in Phase 8.

## Key files

| File | Phase | Role |
|---|---|---|
| `docs/design/PALETTE.md` | 0 | Reconciled color source of truth |
| `sass/_tokens.scss` | 1 | 18 hexes, fonts, radii, 920px width |
| `templates/base.html`, `partials/statusbar.html` | 1 | Global chrome |
| `templates/page.html`, `blog.html` | 2 | Article screen |
| `static/js/codeblock.js`, `highlight_themes/` | 3 | Code blocks + Gruvbox syntax |
| `templates/macros/tree.html`, `garden.html` | 4 | Recursive tree |
| `templates/section.html` | 4, 6 | Folder listing primitive (reused by blog + tags) |
| `templates/home.html`, `partials/neofetch.html` | 5 | Home |
| `templates/taxonomy_list.html`, `taxonomy_single.html` | 6 | Tag cloud + tag pages |
| `static/js/palette.js`, `templates/search-index.html` | 7 | ⌘K palette |
