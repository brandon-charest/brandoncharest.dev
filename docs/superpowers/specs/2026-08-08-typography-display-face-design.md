# Typography — replace the display face

**Date:** 2026-08-08
**Status:** Approved, not yet implemented
**Branch:** `gruvbox-redesign` (folds into the unmerged PR #5 rather than shipping Space Mono and replacing it a day later)

---

## Problem

The redesign set the display voice in Space Mono 700. Reviewing the preview at
`/about/`, the uppercase **M** and **W** were the specific objection — the page
leads with "About **M**e" and "**W**hy this Site Exists", so those two glyphs
carry the first impression at 40px and 26px.

Space Mono is a retro-futurist face with splayed, angular sides and a shallow
middle vertex on the M. It is the most opinionated family in the stack and the
only one chosen for character rather than for legibility.

The complaint is a typeface, not a system. An earlier reading of it as
"the whole page feels soft" pointed at a four-family overhaul; isolating the
glyphs collapsed that to a one-token change.

## Decision

Retire Space Mono. `--font-display` becomes **IBM Plex Mono 700**.

IBM Plex Mono is already downloaded on every page for terminal chrome, so this
removes a family rather than adding one. It has upright sides, an even rhythm
and no retro tics, and it shares a superfamily with IBM Plex Sans (the prose
face) — so headings and chrome become one voice separated by weight.

Weight stays **700**, matching what the design was drawn at. IBM Plex Mono
currently loads 400/500/600 only, so Bold is a new file.

**Font budget:** four families → three, 12 variants → 11.

### Rejected alternatives

| Option | Why not |
|---|---|
| Inter + JetBrains Mono, two families | The direction a supplied typography doc argued for. It is also exactly what pre-redesign `main` runs (`main.scss:73-74`), so it would revert the type layer while keeping the new palette and layout. Adds a font request and drops mono headings, discarding the terminal identity to fix two glyphs. |
| JetBrains Mono for display | Also already loaded and equally free of the M/W problem, but it is currently code-only. Promoting it makes headings and code blocks share a face, collapsing a distinction the redesign draws deliberately. |
| IBM Plex Mono at 600 | Genuinely free — 600 is already loaded, keeping the budget at 10 variants. Rejected on looking at it: Plex Mono is narrower and lighter in colour than Space Mono, and SemiBold on top of that leaves the headings not holding the page. |

## Implementation

### `sass/_tokens.scss:65`

```scss
--font-display: 'IBM Plex Mono', ui-monospace, monospace;  /* h1, h2, labels */
```

No other SCSS changes. All 17 consumers of `--font-display` inherit the new
face through the token: article/garden/folder/listing/post-card/prose-page/
featured-card titles, `:: ON THIS PAGE` side labels, kind badges, the `DIR`
badge, the brand mark, status-bar mode, `★ FEATURED`, and the tag cloud.

### `templates/partials/header.html:117`

Drop Space Mono; add 700 to IBM Plex Mono:

```
https://fonts.googleapis.com/css2
  ?family=IBM+Plex+Mono:wght@400;500;600;700
  &family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400
  &family=JetBrains+Mono:ital,wght@0,400;0,700;1,400
  &display=swap
```

The comment at `header.html:107-113` names Space Mono twice and states "four
families". Rewrite it to describe three, and keep the existing note explaining
why the variant list is trimmed.

### Token structure

`--font-display` and `--font-ui` both resolve to IBM Plex Mono after this
change. **Both tokens are kept.** They encode role, not family: display is 700
for headings and labels, chrome is 400/500/600 for prompts, tree, breadcrumbs,
meta and palette. Those roles remain distinct and could diverge again, and
keeping the token means the next display change stays a one-line edit.

Add a comment at the token so the collision reads as deliberate rather than as
a copy-paste error.

### Letter-spacing

`h1` is `-0.6px` and `h2` is `-0.2px`, both tuned against Space Mono's wider
set. IBM Plex Mono sets tighter, so these may now be over-tight.

Implement with the current values, then inspect `/about/` at both sizes and
relax if the fit is cramped. Record whatever lands in `docs/design/TOKENS.md`.
No target value is specified here because it cannot be determined without
looking at it.

### Documentation

**Update:**

- `docs/design/TOKENS.md:10` — "Four families" becomes three
- `docs/design/TOKENS.md:14` — drop the Space Mono row; its "Display voice"
  responsibilities move onto the IBM Plex Mono row, which then covers both
  display (700) and terminal chrome (400/500/600)
- `docs/design/TOKENS.md:30` — the `--font-display` line in the token block
- `CLAUDE.md:95` — currently reads "Fonts: Inter (sans), JetBrains Mono (mono)
  via Google Fonts", which describes pre-redesign `main` and has been wrong
  since the redesign landed. Correct it to the three-family set.

**Already correct, no edit needed:**

- `TOKENS.md:15` lists IBM Plex Mono at "400, 500, 600, 700" while the live URL
  requests only 400/500/600. The doc has been overstating that weight since the
  redesign landed; adding Bold makes the existing claim true.
- The § Scale table names roles ("display", "sans", "code"), not families, so
  every row stays accurate through a face swap.

**Leave unchanged:** `docs/design/reference/HANDOFF.md`,
`docs/design/reference/prototype.dc.html`, and
`docs/superpowers/plans/we-are-doing-to-distributed-kitten.md`. All reference
Space Mono heavily, and all are historical records of what was handed off and
built. Editing them would falsify the record.

## Verification

1. `zola build` completes clean.
2. `grep -rn "Space Mono\|Space+Mono"` over `sass/`, `templates/`, `config.toml`
   and `CLAUDE.md` returns nothing.
3. Visual check on three pages:
   - `/about/` — the h1 and h2 that prompted this; confirm the M and W read
     acceptably and judge the letter-spacing
   - a garden folder — kind badges, `DIR` badge, listing titles
   - a post containing code — confirms JetBrains Mono still owns code blocks
     and was not swept up by the token change
4. Confirm the Google Fonts URL returns 200 and serves Plex Mono 700
   (a malformed weight list fails silently and falls back to `ui-monospace`).

There is no automated test coverage for styling in this repo; the verification
model is `zola build` plus visual inspection, consistent with both prior plans.

## Risks

- **Plex Mono 700 may look heavier or lighter than expected at 40px** once
  rendered in situ rather than in a mockup. Mitigated by the visual check;
  the fallback is 600, already loaded.
- **Headings and chrome sharing one family may read flat.** This is the known
  cost of the choice, accepted deliberately. If it lands badly, the escape
  hatch is pointing `--font-display` at JetBrains Mono — still a one-line edit,
  which is why the token is being kept.
