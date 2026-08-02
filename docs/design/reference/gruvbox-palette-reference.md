# Gruvbox Palette — Reference for brandoncharest.dev

Source of truth for color usage across the site. Hand this to whichever tool is implementing changes — Claude Code, Claude Design, or otherwise — as context before it touches styling.

---

## Backgrounds

```css
--bg0-hard: #1d2021;   /* nav bar + status bar ONLY — never content */
--bg0:      #282828;   /* default surface — homepage, garden index, about, and cards on those pages */
--bg0-soft: #32302f;   /* blog post body + garden note body — long-form reading pages */
--bg1:      #3c3836;   /* nested cards, code block background (on any page) */
--bg2:      #504945;   /* borders */
--bg3:      #665c54;   /* subtle dividers */
```

**Note on `bg0-soft`:** Gruvbox ships three contrast tiers (soft/medium/hard) as a general display preference, not as an official "reading mode" — that framing was mine, not Gruvbox's. The reasoning still holds on its own merits: `bg0-soft` is slightly warmer and less stark than `bg0`, which is a reasonable choice for pages that are mostly continuous text. Treat it as our decision, not a documented best practice.

---

## Foreground (text)

```css
--fg1: #ebdbb2;   /* body paragraph text — the only color for running prose */
--fg2: #d5c4a1;   /* small or critical meta text — timestamps, read-time, byline */
--fg4: #a89984;   /* muted, non-critical, larger decorative text only */
```

**Reading rule:** body copy is always `fg1`. Never an accent color.

**Why `fg2` and not `fg4` for timestamps/meta:** `fg4` on `bg0-soft` measures ~4.73:1 — technically passes AA, but that's razor-thin for text that's often rendered at 0.75rem. Small text needs margin, not a number that just barely clears the floor. `fg2` on `bg0-soft` measures ~7.65:1, which holds up regardless of font-weight or rendering quirks. Reserve `fg4` for larger, non-essential text where a borderline ratio isn't a real risk.

---

## Accent colors + assigned roles

```css
--red:    #fb4934;   /* errors, warnings only */
--orange: #fe8019;   /* primary actionable accent — nav active state, CTA buttons, brand/username, standalone UI links (e.g. "browse all tags →") */
--aqua:   #8ec07c;   /* section headings (h2/h3) within posts and notes */
--yellow: #fabd2f;   /* "growing" status badge only */
--green:  #b8bb26;   /* "evergreen" status badge + "online" system status dot */
--gray:   #928374;   /* "seedling" status badge, disabled states, de-emphasized UI */
--blue:   #83a598;   /* links embedded within body prose only — always underlined, never color-alone */
--purple: #d3869b;   /* "featured" label only — bold/≥14px, see contrast note below */
```

**Fixed from v1:** orange previously did three unrelated jobs (nav, CTAs, *and* headings) while the doc claimed "one job per color, no exceptions" — a direct contradiction. Headings now belong to `aqua`, which was otherwise undefined. Orange keeps nav-active-state, CTAs, and brand identity, which are all variations of the same job: "this is the primary interactive/actionable signal."

**Fixed from v1:** all three garden maturity states are now assigned — `seedling` was missing entirely and would have been improvised by Claude Design without direction.

**One intentional exception:** `green` covers both the "evergreen" garden badge and the homepage "online" status dot. Normally that would violate the one-job rule, but the two contexts never appear together (evergreen only shows on garden cards, online status only shows once on the homepage neofetch card) and both convey the same underlying meaning — stable, live, good. This is a deliberate, documented exception, not drift.

**Resolved:** standalone UI links that aren't embedded in paragraph text — "browse all tags →", "Read Story →" — use orange, the same actionable signal as nav and CTAs. Blue is reserved specifically for links inside running prose, where a paragraph needs to point somewhere without shouting.

**Every other color keeps one job. No freelancing outside the assigned role, except code blocks (below) and the green exception above.**

---

## Tags & pills

Tags (`#rust`, `#aws`, `#lambda`) do **not** get individual colors per tag. That recreates the original "every element has its own hue" problem this whole doc exists to prevent.

```css
background: transparent;
border: 1px solid var(--bg3);
color: var(--fg2);
```

Every tag, on every post, looks identical regardless of topic.

---

## Breadcrumbs & table of contents

Not addressed in v1 — added here since both appear in the current mockup.

**Breadcrumb trail** (`~ / blog / post-slug`): `fg4`, no accent color, separators in `bg3`.

**TOC sidebar:** section label ("ON THIS PAGE") follows the same treatment as other section headers — uppercase, `fg4`, letter-spacing. Inactive TOC items in `fg4`. The current/active section (whichever heading is in viewport) uses `orange` — this is consistent with orange's job as "the actionable/current-position signal," not a new use.

---

## File tree / directory listings (Garden page)

Folder names in the `tree ~/garden` view (`systems-and-infrastructure/`, `projects/`, etc.) are differentiated from file entries by **weight, not color** — `fg1`, semibold. This was rendering in a green tint in the last mockup, which isn't a documented role; resolving it this way avoids adding a ninth color job just to distinguish directories from files. The type tags (`[note]`, `[proj]`, `[log]`) and indentation already carry that distinction structurally — weight is enough on top of that.

---

## Code blocks — the one exception

Code blocks use full, saturated, multi-hue Gruvbox syntax highlighting exactly as designed — keywords, strings, functions, comments all distinct. This is the single exception to "one color, one job," and it's a genuine strength for a technical blog. The rules above govern prose *around* code, not the code itself.

---

## Contrast verification (WCAG, calculated against `bg0-soft` #32302f)

| Pairing | Ratio | Verdict |
|---|---|---|
| `fg1` body text | 9.57:1 | Passes AAA |
| `fg2` small/critical meta text | 7.65:1 | Passes AAA — safe replacement for `fg4` at small sizes |
| `aqua` headings | 6.4:1 | Solid |
| `green` evergreen badge | 6.4:1 | Solid |
| `blue` links | 4.88:1 | Passes AA — always pair with underline, don't rely on color alone |
| `purple` featured label | 4.79:1 | Passes AA for normal text; comfortably clears large-text 3:1 floor if kept bold/≥14px |
| `fg4` (restricted to larger, non-critical text only) | 4.73:1 | Passes AA — acceptable now that it's no longer used for small text |

No remaining contradictions between stated rules and actual usage.

---

## Quick rules to check against

- [ ] Body/paragraph text is `fg1` everywhere — no accent colors in running text
- [ ] Blog post / garden note pages use `bg0-soft`; homepage/garden-index/about use `bg0`; nav/status bar use `bg0-hard`
- [ ] Small or critical meta text (timestamps, read-time) is `fg2`, not `fg4`
- [ ] Each accent color appears only in its assigned role — orange (nav/CTA/brand/standalone UI links), aqua (headings), yellow (growing), green (evergreen + online status), gray (seedling), blue (prose-embedded links only), red (errors)
- [ ] On the Garden page specifically: the three maturity states (seedling/growing/evergreen) render as three *visually distinct* hues — gray, yellow, green — in both the filter chips and the per-note status dots. Confirmed bug risk: growing and evergreen have previously both rendered as orange, collapsing the distinction the whole system exists to convey.
- [ ] Tags/pills are uniform — transparent background, `bg3` border, `fg2` text, regardless of tag content
- [ ] Links inside body prose are blue and underlined; standalone UI links ("browse all tags →") are orange
- [ ] Folder names in tree/directory views use `fg1` + semibold weight, not a distinct color
- [ ] Code blocks use full syntax highlighting — the one exception to single-role colors
- [ ] No hex values outside this list
