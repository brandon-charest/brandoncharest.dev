# Gruvbox Palette — reconciled source of truth

This file supersedes both `gruvbox-palette-reference.md` and the color sections of the design
handoff README. Where those two disagreed, the conflict is resolved here and **must not be
reopened during implementation**.

Companion files: [`TOKENS.md`](./TOKENS.md) (type, spacing, radii), [`allowed-hexes.txt`](./allowed-hexes.txt)
(the audit list).

---

## The 18 permitted hex values

Nothing outside this list may appear in `sass/` or `templates/`. Alpha layers (below) and
generated syntax-highlighting CSS are the only exceptions.

### Surfaces

| Token | Hex | Job |
|---|---|---|
| `--bg0-hard` | `#1d2021` | Header bar + status bar **only** — never content |
| `--bg0` | `#282828` | Default page surface: home, garden, folder, tags, now, about |
| `--bg0-soft` | `#32302f` | Article reading surface (full-bleed); card title bars; code-block header + line-number gutter; palette footer |
| `--bg1` | `#3c3836` | Cards, nested panels, code-block body, status-bar segments, search button |
| `--bg2` | `#504945` | Borders, rules, dividers, row separators |
| `--bg3` | `#665c54` | Subtle dividers, tag-pill borders, breadcrumb separators, active-chip borders |
| `--hover` | `#221d18` | Row hover background — **see decision 3** |

### Foreground

| Token | Hex | Job |
|---|---|---|
| `--fg1` | `#ebdbb2` | Prose on index/card surfaces; headings; filenames; primary values; `<strong>`/`<em>` inside article prose |
| `--fg2` | `#d5c4a1` | **Article body prose** (decision 2); small or critical meta — timestamps, read time, descriptions, tag text |
| `--fg4` | `#a89984` | Larger or non-critical decorative text — breadcrumbs, TOC items, section labels, nav index numbers, commit hashes, **un-hued kind badges** |

### Accents — one job each

| Token | Hex | Job |
|---|---|---|
| `--orange` | `#fe8019` | Primary actionable signal: nav active pill, brand **username only** (`brandoncharest`, not `@dev`), shell prompt user, standalone UI links ("browse all tags →"), active TOC item, status-bar mode block |
| `--aqua` | `#8ec07c` | Headings — post `h2`/`h3` — **and directory names** (decision 1) |
| `--yellow` | `#fabd2f` | "growing" maturity badge only |
| `--green` | `#b8bb26` | "evergreen" maturity badge — **and** the home "online" status dot (documented exception) |
| `--gray` | `#928374` | "seedling" badge, disabled states, de-emphasized chrome: tree connectors, line numbers, prompt punctuation |
| `--blue` | `#83a598` | Links inside running prose **only** — always underlined, never color alone |
| `--purple` | `#d3869b` | "FEATURED" label only — must stay bold and ≥14px |
| `--red` | `#fb4934` | Errors and warnings only (unused in UI chrome; appears in syntax highlighting) |

---

## Decisions

1. **Directory names are aqua `#8ec07c`, weight 600.** This applies to the tree root
   (`~/garden/`), directory rows, the `DIR` badge, the `dir` kind badge in child listings, the
   `ls <path>` prompt path, and the `~/blog/` prefix on the featured card. Aqua's job is
   restated as "headings — a directory is the heading of a tree", which keeps one-job-per-color
   intact. This **overrides** the palette reference's "folder names use `fg1` + semibold" rule.

2. **Article body prose is `fg2 #d5c4a1`**, with `<strong>` and `<em>` lifting to
   `fg1 #ebdbb2`. That two-tone hierarchy is deliberate. Every *other* prose surface — the home
   blurb, the garden lede, folder overviews, the article lede, now/about body — stays `fg1`.
   This narrows the palette reference's "body copy is always fg1" rule to non-article surfaces.
   Contrast: `fg2` on `bg0-soft` is 7.65:1 (AAA).

3. **`#221d18` is sanctioned as an 18th hex**, used solely as the row-hover background. The
   handoff README specifies it in three places; the prototype dropped it and substituted `bg1`,
   which is a no-op for rows that already sit on a `bg1` card (garden tree, folder listings,
   series lists). The rule is now "exactly 18 hex values", not 17.

   **Amended 2026-08-03:** the three `--kind-*` tags below bring the total to **21**. They are
   a deliberate closed set, not an opening — see *Kind tags*, which records why no further hue
   is available. `docs/design/allowed-hexes.txt` is the enforced list; keep it in step.

4. **No light theme.** The `theme` key, both theme stylesheets and the toggle script are gone
   entirely — tokens live on `:root` with no class gate, so nothing has to apply a theme for the
   site to render. Every contrast figure below is computed against dark surfaces; a light mode
   would be undesigned and unverified.

5. **`/blog` and `/tags/<tag>/` use the folder-listing primitive** — breadcrumbs, badge, `h1`,
   overview, `ls` prompt, then a `bg1` card of child rows. No new visual vocabulary.

6. **The ⌘K palette is custom**, fed by a compact Tera-emitted JSON index.
   `build_search_index = false`; elasticlunr and its 1.2 MB index are removed.

7. **The home terminal card is `width: 100%`.** Originally resolved as `fit-content` from the
   README's "~294px of dead space" figure, then settled by the mock, which shows the card
   spanning the full column. With real blurb copy the two resolve identically anyway, so full
   width is simply the predictable spelling.

8. **GitHub and LinkedIn live in the status bar** as text links (`gh:` / `in:`), since the
   redesigned header has no socials slot.

---

## Sanctioned exceptions

Do not "fix" these.

1. **Green does two jobs** — the "evergreen" maturity badge and the home "online" status dot.
   The contexts never co-occur and both mean *stable, live, good*.
2. **The neofetch swatch row** paints red/orange/yellow/green/aqua/blue/purple decoratively.
   It is literally a palette display — the conventional neofetch element.
3. **Code blocks** use full multi-hue Gruvbox syntax highlighting. The rules here govern the
   prose *around* code, not the code itself. Zola 0.17 bundles no Gruvbox theme, so the site
   ships `highlight_themes/gruvbox-dark.tmTheme` and Zola exports it to CSS classes at build
   time (`highlight_theme = "css"`). Every colour in that theme still comes from the 18 —
   keyword red, function and string green, type and constant yellow, variable blue, operator
   aqua, punctuation `fg2`, comment gray, literal purple.
4. **The code-block filename tab** carries an orange 7px square and an `inset 0 2px 0` orange
   top rule — chrome that marks the active file, consistent with orange as the "current
   position" signal.
5. **Prose list bullets are orange `-`.**
6. **Short hashes are orange** — the `260508` on a dev-log entry and the same hash on the
   homepage's `git log` rows. One component, one colour; the homepage used to render these in
   `fg4`, which made the same idea look like two different things.
7. **Alpha layers are not new hues** and are exempt from the 18-hex rule:
   - `::selection` — `rgba(254,128,25,.30)` with `#ebdbb2` text
   - Terminal card shadow — `0 24px 60px -34px rgba(0,0,0,.85)`, `inset 0 1px 0 rgba(255,255,255,.02)`
   - Palette panel shadow — `0 30px 80px -20px rgba(0,0,0,.8)`
   - Palette scrim — `rgba(12,10,8,.66)` + 3px blur

---

## Prototype bugs — fix by rule, do not reproduce

The handoff prototype (`Brandon Charest Site.dc.html`) contains these defects. Implement the
**Fix** column.

| Where | Bug | Fix |
|---|---|---|
| Featured card tag pills | `background:#3c3836`, no border → invisible on the bg1 card | transparent + `1px solid var(--bg3)`, identical to every other pill |
| Folder child rows, series rows | `border-bottom:1px solid #3c3836` on a `#3c3836` surface → invisible | `1px solid var(--bg2)` |
| Code block body | no background set → inherits `bg0-soft`, identical to the article surface, so it stops reading as a panel | body `var(--bg1)`; header bar and gutter stay `var(--bg0-soft)` |
| Child-listing `dir` badge | orange, while the folder header's `DIR` badge is aqua | aqua, per decision 1 |
| Subdirectory rows | orange dot shown next to "N notes" — orange is not a maturity color and directories have no maturity | no dot for directories |
| Tree / folder / series row hover | `#3c3836` on `#3c3836` → no-op | `var(--hover)`, per decision 3 |

---

## Uniform treatments

**Tags and pills** get no per-tag color — that recreates the "every element has its own hue"
problem this document exists to prevent.

```css
background: transparent;
border: 1px solid var(--bg3);
color: var(--fg2);
border-radius: 999px;
```

**Kind badges** carry a hue for exactly three kinds; see *Kind tags* below. **The tag cloud**
varies size only — `15 + round(count / max * 17)` px — never hue.

### Surfaces and contrast — from the full-site audit, 2026-08-03

A sweep of all 104 routes measuring every text node against its real backdrop
found **102 unique contrast failures**. Two root causes accounted for nearly all
of them, and both were surface choices rather than colour choices.

**1. Code blocks sat on `bg1`, the lightest surface on the site.** That single
decision dragged four syntax colours under AA at once. They now sit on
`bg0-hard`:

| token | on `bg1` | on `bg0-hard` |
|---|---|---|
| red — keywords | 3.37 | **4.77** |
| purple — constants | 4.23 | **5.98** |
| blue — parameters | 4.31 | **6.09** |
| gray — comments | 3.16 | 4.47 → moved to `fg4` |

**2. `--gray #928374` clears 4.5:1 on no surface we have** — 3.16 on `bg1`, 3.58
on `bg0-soft`, 4.02 on `bg0`, 4.47 on `bg0-hard`. Treat it as **decoration
only**, exactly as its row in the table above says. Anything that carries
information uses `fg2`.

`--fg4 #a89984` likewise fails on `bg1` (4.17) while passing on every darker
ground. Small text on a `bg1` card wants `fg2`.

**Sanctioned decorative exceptions** — the three the audit still reports. All are
non-informational glyphs, exempt under WCAG 1.4.3 "pure decoration":

| Selector | Ratio | Why it stands |
|---|---|---|
| `.tree__pre` | 3.16 | Box-drawing connectors. Raising them to pass would make the scaffolding as loud as the filenames. |
| `.neofetch__comment` | 3.16 | The `//` glyph before a comment. |
| `.prompt__punct` (terminal card only) | 4.17 | `:~$`. The whole prompt is `aria-hidden="true"`. |

**Touch targets.** WCAG 2.5.8 wants 24×24 minimum. The audit found 17 unique
failures at 412px — breadcrumbs, brand, tag pills, footer links — all now at 24px
or more. Note that a desktop-width audit reports false positives here: the
`pointer: coarse` rules that size targets for touch do not apply to a fine
pointer, so **measure touch targets at mobile width**.

**The audit has one blind spot:** it resolves backgrounds by walking ancestors
for `background-color`, so SVG `fill` is invisible to it. Mermaid diagrams
passed the audit while rendering cream labels on near-white nodes. Check SVG by
eye.

### Kind tags — supersedes the original "uniformly fg2" rule

Reversed 2026-08-03 at Brandon's direction. Uniform `fg2` produced a badge column that read as
undifferentiated grey against an otherwise orange-heavy page.

| Token | Hex | Kind | Canonical Gruvbox? |
|---|---|---|---|
| `--kind-proj` | `#659a9c` | `[proj]` | No — see below |
| `--kind-log` | `#689d6a` | `[log]` | Yes (`neutral_aqua`) |
| `--kind-snip` | `#be7d9b` | `[snip]` | No — see below |

These form a **dimmed tier below the accents**, one step down from the accent that owns each
family, so `[proj]` cannot be read as a prose link nor `[snip]` as the FEATURED label.

`dir` keeps `--aqua` per decision 1 — the same job, not a fourth kind hue. **Every other kind**
(`note`, `blog`, `ref`, `tut`) renders `fg4`. Splitting the un-hued kinds across `fg2`/`fg4` was
tried and rejected: at 8.6:1 the neutrals out-shouted the three hues at 4.6:1, inverting the
hierarchy. One neutral, three hues.

**No more hues are available.** Yellow is `growing` and green is `evergreen`, and a kind badge
sits inches from a maturity dot on every listing row. A yellow `[tut]` beside a yellow growing
dot is precisely the collapse this system exists to prevent.

**The `bg0` chip under `.badge-kind` is load-bearing.** The three hues measure **3.65:1** on a
bare `bg1` card and only reach AA (**4.63–4.67:1**) once they sit on `bg0`. Deleting the
background silently drops them below WCAG AA. `.badge-kind--boxed` therefore carries no
`opacity`: it composites chip and text together onto the card and gives the contrast back.

Lightening the hues instead was measured and rejected — it lands `[proj]` at ΔE 0.030 from
`--blue` and `[snip]` at 0.026 from `--purple`. Clearing both the contrast and the separation
bars by hue alone requires pastels (`#b4e6e7`), which leave Gruvbox altogether.

**Breadcrumbs** are `fg4` with `bg3` separators, no accent. **TOC** section label and inactive
items are `fg4`; the active item and its rail segment turn orange.

**Maturity is always three visually distinct hues** — gray / yellow / green — in filter chips,
per-note dots, meta rows, and the note-info card. A previous revision collapsed growing and
evergreen to the same color; that is the single most important thing to check.

Never hand-render a stage. Every surface goes through one of three macros in
`templates/macros/ui.html`, all resolving to `parts/_badges.scss`:

| Macro | Renders | Use for |
|---|---|---|
| `ui::growth_state(growth)` | coloured dot **+ coloured word** | Anywhere the stage is *stated*: article byline, note-info card |
| `ui::growth_dot(growth)` | dot only | Where a label already sits beside it: tree rows, filter chips |
| `ui::growth_badge(growth)` | `[seed]` / `[grow]` / `[ever]` | *(retired — nothing renders dense stage columns any more)* |

`growth_state` colours the label and lets the dot inherit via `currentColor`, so word and dot
cannot disagree. An 8px dot alone is genuinely hard to read — Gruvbox yellow `#fabd2f` next to
Gruvbox orange `#fe8019` is a close call at that size — which is why stated stages carry the
colour in text too.

**Inline `<code>` is neutral** — `fg1` on `bg1`. The bg1 panel is enough to mark it as a
distinct object. It was orange in an earlier revision, which put an actionable-looking box
around quoted product names and other plain nouns.

---

## Contrast (WCAG, against `bg0-soft` `#32302f`)

| Pairing | Ratio | Verdict |
|---|---|---|
| `fg1` | 9.57:1 | AAA |
| `fg2` — article body and small meta | 7.65:1 | AAA |
| `aqua` headings | 6.4:1 | Solid |
| `green` evergreen badge | 6.4:1 | Solid |
| `blue` prose links | 4.88:1 | AA — always pair with an underline |
| `purple` FEATURED label | 4.79:1 | AA — keep bold and ≥14px |
| `fg4` — larger, non-critical text only | 4.73:1 | AA — do not use below 12px |

---

## Audit gate

Every phase must end with this returning nothing:

```sh
grep -rhoE '#[0-9a-fA-F]{6}' sass/ templates/ \
  | tr 'A-F' 'a-f' | sort -u \
  | grep -vxFf docs/design/allowed-hexes.txt
```

Generated syntax CSS (`static/syntax-theme-dark.css`) is excluded by scope — it is exception 3.

## Checklist

- [ ] Article body is `fg2`; every other prose surface is `fg1`; no accent in running text
- [ ] Article pages use `bg0-soft`; home/garden/folder/tags/now/about use `bg0`; header and status bar use `bg0-hard`
- [ ] Small or critical meta is `fg2`, not `fg4`
- [ ] Each accent stays in its assigned role
- [ ] Seedling / growing / evergreen render as gray / yellow / green everywhere
- [ ] Tags and pills are uniform regardless of content
- [ ] Prose links blue + underlined; standalone UI links orange
- [ ] Directory names aqua 600
- [ ] Row hover is visible on every hoverable row, on both `bg0` and `bg1` surfaces
- [ ] No hex outside `allowed-hexes.txt`
