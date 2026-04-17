# Plan: Refactor Hub Pages to Restore the Terminal-Modern Aesthetic

## Context

The site has a strong terminal identity in its chrome (window bars, neofetch, ls-style file listings, status footer, command prompts) but loses that voice on the **hub pages** — the places visitors land most often:

- **`garden.html`** uses a modern card grid with rounded "filter pills" and a 6-item-per-category cap. Reads like a generic portfolio, not a directory.
- **`blog.html`** has no proper listing treatment — it inherits without showing posts in a way that matches the rest of the site.
- **Homepage** opens with neofetch (great), then drops into a card-based "highlights grid" (jarring).
- **`section.html`** is the *only* hub doing terminal right (the `ls -la` table). It should be the reference point.

Meanwhile, real metadata that *would* be interesting to a technical visitor — growth stage (`seedling`/`growing`/`evergreen`), content type (`note`/`project`/`tutorial`), tags, last-touched date — is either hidden behind a card or truncated.

**Goal:** unify the hubs around a single design vocabulary modeled on real engineering tooling (htop, lazygit, git log, tree, fzf), not on generic web cards. Keep the warmth and accessibility of the existing palette, but make every hub feel like it belongs to the same machine.

---

## Design Direction: "Working Terminal"

A real engineer's dashboard, not a costume. The frame is already there — this plan applies it inward.

### Principles

1. **Tables, not cards.** Cards waste vertical space, hide metadata, and don't compose. Monospace tables let visitors skim 40 notes the way they'd skim `ls -la`.
2. **JetBrains Mono leads, Inter supports.** Headers, labels, navigation, table cells → mono. Long-form article prose stays Inter for readability. Today the split is reversed in too many places.
3. **One accent (teal), used assertively.** Add a single secondary accent — muted amber `#d4a25a` — reserved for *signal* states (pinned, "growing now", series indicator). No third color creep.
4. **Filters as flags, not pills.** `--growth=evergreen --type=project` reads like a real CLI invocation. Active flags are highlighted; clicking toggles them. Removes the "rounded pill" web vocabulary.
5. **Density is a feature.** Engineers skim. Show every note on the garden hub. No "View all →" links to a second page that just shows the same thing more.
6. **Activity over curation.** The homepage should feel like `tail -f` / `git log --oneline` of recent work, not a hand-picked highlight reel.

### What stays

- Color tokens in `sass/theme/dark.scss` and `sass/theme/light.scss` (add one amber token only)
- Window chrome / traffic-light controls — they're earned at this point
- Neofetch component on the homepage
- Existing growth/type taxonomy — surface it more, don't change it
- The `section.html` ls-style table (light polish only)

### What changes

The card system (`sass/parts/_cards.scss`, `card-grid`, `card-header`, `card-footer-bar`, `filter-pill`, etc.) gets retired from the hubs. Card SCSS isn't deleted in this pass (still used by a couple of long-form pages), but **no hub page imports it** when this is done.

---

## Changes by File

### 1. Garden hub — `templates/garden.html` + `sass/parts/_garden.scss`

**Today:** Hero with bonsai → stats block → filter pills → category cards (6 items each, truncated descriptions).

**After:** A single "garden filesystem" view.

```
visitor@dev:~/garden$ find . -type f -name '*.md' | wc -l
40

visitor@dev:~/garden$ ls -lah --growth=all --type=all --sort=recent

DRWXR-XR-X  algorithms/    9 notes    last: 2026-03-12
DRWXR-XR-X  concepts/      5 notes    last: 2026-04-01
DRWXR-XR-X  languages/     6 notes    last: 2026-04-09
DRWXR-XR-X  projects/     19 notes    last: 2026-04-15
DRWXR-XR-X  tools/         1 note     last: 2026-02-20

[--growth]  ●all  seedling(12)  growing(18)  evergreen(10)
[--type  ]  ●all  note  project  tutorial  reference  snippet  log

GROWTH  TYPE     UPDATED      TAGS                     NAME
[ever]  [proj]   2026-04-15   rust, lambda, aws        password-roaster
[grow]  [note]   2026-04-09   rust, ownership          ownership-deep-dive
[seed]  [snip]   2026-04-07   shell, tmux              tmux-pane-tricks
...
```

- Drop `category-grid` + `file-card` + `filter-pill` markup.
- Render category list as a top "directory" block (clickable, jumps to that category's section in the same table).
- Render full notes table below with sortable headers (URL params: `?sort=recent|growth|type`).
- Filter row is server-rendered + JS toggles via URL params (no SPA needed; Zola is static, so this is `<a href="?growth=evergreen">` style).
- Bonsai ASCII stays but moves into a small ASCII block at the very top, integrated with the path/prompt — not floating in the background.

**SCSS:** Replace `.category-grid`, `.file-card`, `.filter-pill` rules in `_garden.scss` with `.garden-tree`, `.garden-flags`, `.garden-table` that share styles with the existing `.file-list` rules in `_filelist.scss` (extract shared rules into `_table.scss`).

### 2. Blog hub — `templates/blog.html` + new `sass/parts/_bloglist.scss`

**Today:** No proper listing — inherits and shows little.

**After:** A `git log`-styled stream.

```
visitor@dev:~/blog$ git log --oneline --all

a3f81d2  2026-04-07  ★ Tutorial Hell and How I Escaped It           [meta, learning]      ~8 min
9c2274b  2026-03-22    Why I'm Building a 6502 Emulator             [systems, retro]      ~6 min
...
```

- Mono-spaced "hash" (use the post's slug-hash or first 7 chars of permalink) → date → optional `★` for `pinned: true` → title → bracketed tags → reading time
- Hover: full description appears in a thin row beneath, like `git log --stat`
- Series posts get a vertical bracket connector on the left margin
- No card grid. No "Featured" section — pinned items just show up first with the star

### 3. Homepage — likely `templates/index.html` or `templates/home.html`

**Today:** Neofetch (good) → "highlights" / "recent" card grid (breaks tone).

**After:** Neofetch stays as signature. Below it, two side-by-side panels styled like split-pane terminal output:

```
┌─ tail -f ./blog ─────────────┐  ┌─ tail -f ./garden ────────────┐
│ 2026-04-07  Tutorial Hell... │  │ 2026-04-15  password-roaster  │
│ 2026-03-22  6502 Emulator... │  │ 2026-04-09  ownership-deep... │
│                              │  │ 2026-04-07  tmux-pane-tricks  │
└──────────────────────────────┘  │ 2026-04-01  cqrs-vs-event...  │
                                  └───────────────────────────────┘

┌─ ps -eo growth,name --sort=last_touched | head ─┐
│ growing   ownership-deep-dive    9d ago         │
│ growing   redis-internals-notes  14d ago        │
│ seedling  6502-cycle-counting    21d ago        │
└──────────────────────────────────────────────────┘
```

- Replaces `.highlights-grid` / `.hero-content` cards
- Each panel: window-bar header (existing chrome) + monospace rows + thin divider
- Sources data from existing collections (`get_section`, `get_taxonomy`)
- Activity panel uses the growth taxonomy that's already encoded but currently unsurfaced anywhere

### 4. Section pages — `templates/section.html` (light polish only)

The strongest hub, just minor improvements:

- Add a `[GROWTH]` and `[TYPE]` column (currently only shown via `card_indicators` macro inline with the name — separate them for scannability)
- Add a sticky filter-flag row above the table (same pattern as the garden hub, simpler)
- Sortable column headers (same URL-param approach)
- Tighten zebra-stripe contrast so the eye locks onto rows faster

### 5. Macros — `templates/macros/ui.html`

- Add `flag_bar(filters, active)` macro — renders the `--flag=value` toggle row used by garden + section hubs
- Add `pane(title, command, body)` macro — renders the bordered "tail -f" / "ps" panels for the homepage
- `card_indicators` stays but becomes single-purpose (just growth + type badges in tables)

### 6. SCSS structure

New: `sass/parts/_table.scss` — shared base for any monospace data table (file-list, garden-table, blog-list). Extract from current `_filelist.scss`.

New: `sass/parts/_panes.scss` — homepage side-by-side terminal panes.

New: `sass/parts/_flags.scss` — `--flag=value` filter row component.

Edit: `sass/parts/_garden.scss` — strip card rules, keep ASCII bonsai treatment.

Edit: `sass/parts/_cards.scss` — leave intact for now (used elsewhere); mark with a header comment that it's not for hubs.

Edit: `sass/theme/dark.scss` and `sass/theme/light.scss` — add `--accent-amber` token (`#d4a25a` dark / `#a87a3d` light) for pinned/series highlights.

Edit: `sass/main.scss` — register the new partials.

### 7. Typography pass (in scope, light touch)

- Audit hub templates: any header/label/nav element currently in Inter that should be JetBrains Mono → switch
- Tighten letter-spacing on uppercase labels (1.5px → 2px for the `[PERMISSIONS]`-style headers)
- Keep article body in Inter — no change to long-form reading experience

No new fonts added. JetBrains Mono is characterful enough when used assertively; adding a third face is scope creep that risks visual chaos.

---

## Files to Modify

```
templates/garden.html                    rewrite
templates/blog.html                      rewrite (add real listing)
templates/index.html (or home.html)      rewrite the section under neofetch
templates/section.html                   light polish (columns, filter row)
templates/macros/ui.html                 add flag_bar, pane macros
sass/parts/_garden.scss                  strip cards, keep ASCII bonsai
sass/parts/_filelist.scss                extract shared rules
sass/parts/_table.scss                   NEW — shared table base
sass/parts/_panes.scss                   NEW — homepage split panes
sass/parts/_flags.scss                   NEW — filter flag row
sass/theme/dark.scss                     add --accent-amber
sass/theme/light.scss                    add --accent-amber
sass/main.scss                           register new partials
```

No changes to `config.toml`, content frontmatter, or the Apollo theme submodule.

---

## Considered Alternatives

**A. Full terminal commit.** Convert everything (including article pages) to monospace + bordered ASCII boxes. Rejected: long-form prose suffers in mono, and the `page.html` reading experience is currently good — don't break what works.

**B. Lean modern, demote terminal to flavor.** Keep cards, treat terminal chrome as a header decoration only. Rejected: the user explicitly said the terminal direction is what they want; the cards are what feels lost. Reverse direction would discard their actual identity.

**C. Hybrid (recommended, this plan).** Terminal vocabulary takes over hubs (the working surfaces), Inter + clean typography stays in articles (the reading surfaces). Each surface uses the right tool.

---

## Verification

1. `zola serve` and confirm hot reload works.
2. Visit each hub and confirm visual consistency:
   - `/` — neofetch + two terminal panes, no cards
   - `/blog` — git-log-style listing
   - `/garden` — single ls-la table with category jump-block + flag filters
   - `/garden/projects/` etc. — section.html polished, filter row works
3. Toggle filter flags via URL params on garden + section hubs; confirm correct subset renders and active flag is visually distinct.
4. Toggle the dark/light theme; confirm the new amber token reads well in both.
5. Resize to 768px and 375px; confirm tables degrade gracefully (horizontal scroll on tablet, condensed columns on mobile — drop GROWTH/TYPE columns under 480px and merge them into the name cell).
6. Run `zola build` and check for template errors / broken links.
7. Spot-check a long-form article page (`page.html`) to confirm reading experience is untouched.

---

## Out of Scope (intentionally)

- Adding new fonts
- Restructuring content directories or frontmatter schema
- Adding search, comments, or webmentions
- Rewriting the Apollo submodule
- Touching the article reading view (`page.html` content area)
