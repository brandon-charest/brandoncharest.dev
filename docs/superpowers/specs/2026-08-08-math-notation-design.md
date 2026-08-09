# Math notation — KaTeX, per-page opt-in

**Date:** 2026-08-08
**Status:** Approved, not yet implemented
**Branch:** new branch off `main` (the gruvbox redesign merged as `6f030a7`)

---

## Problem

Garden notes write complexity as `$O(V + E)$` and it renders as literal dollar
signs. Seven files contain 35 real math expressions:

| File | Instances |
|---|---|
| `garden/algorithms/dynamic_programming.md` | 11 (incl. `$$` display blocks) |
| `garden/algorithms/distributed_rate_limiter.md` | 5 (incl. `$$` display blocks) |
| `garden/algorithms/leetcode/01-two-sum.md` | 5 |
| `garden/algorithms/leetcode/207-course-schedule.md` | 4 |
| `garden/algorithms/leetcode/210-course-schedule-2.md` | 4 |
| `garden/algorithms/leetcode/295-median-from-data-stream.md` | 4 |
| `garden/algorithms/leetcode/443-string-compression.md` | 2 |

The Apollo theme scaffolds MathJax in `templates/partials/header.html`, but it
is doubly disabled: `config.extra.mathjax` is unset, and the block additionally
requires page content to contain `$$`, `\(` or `\[`. Five of the seven files use
inline `$…$` only, so even enabling the flag would leave them unrendered. That
gate is the specific reason `$O(V + E)$` shows nothing today.

## The constraint that shapes everything

**`$` is not a safe global delimiter on this site.** The 6502 emulator notes
write hex literals in prose, outside backticks:

- `garden/projects/6502_emulator/nestesting.md` — 7 occurrences
- `garden/projects/6502_emulator/devlog.md` — 3 occurrences

Examples: `$8000`, `$C000`, `$00`, `($8000) and the upper bank ($C000…)`.
Enabling `$…$` site-wide would treat the span between two hex literals as a
formula and mangle the prose. A `$` also appears in the DOM of every page
rendered through `prose.html`, where `.prompt__punct` emits `:~$`.

## Decision

**KaTeX 0.16.11 from jsDelivr, loaded only on pages that opt in via
`[extra] math = true`.**

Per-page opt-in makes the 6502 notes safe structurally rather than by
remembering to escape things, and keeps 77 KB off the ~40 pages with no math.

### Rejected alternatives

| Option | Why not |
|---|---|
| Enable `$…$` globally, fix the 6502 notes | Simplest config, but every future `$` written in prose anywhere on the site becomes a latent rendering bug, and the prompt's `:~$` stays a standing hazard. |
| Avoid `$` entirely; convert all math to `\(…\)` | Zero collision surface, but 35 content edits and `\(` is awkward to type while drafting in Obsidian. |
| MathJax from CDN | 258 KB gzipped vs KaTeX's 77 KB, and renders async so formulas pop in after paint. Its advantage is exotic LaTeX packages, none of which this content uses — the hardest expression present is `\text{tokens}(t)`. |
| KaTeX self-hosted | No third-party origin and immune to upstream change, but costs vendoring the woff2 font set into `static/` and manual version bumps. Reconsider if a second external dependency becomes a problem. |

## Implementation

### Frontmatter

Add to the seven files listed above:

```toml
[extra]
math = true
```

### `templates/partials/header.html`

Replace the MathJax block with a KaTeX block gated on the flag. Subresource
integrity is included because this is a third-party origin; hashes verified
against jsDelivr on 2026-08-08:

```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
      integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5+"
      crossorigin="anonymous" />
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"
        integrity="sha384-7zkQWkzuo3B5mTepMUcHkMB5jZaolc2xDwL6VFqjFALcbeS9Ggm/Yr2r3Dy4lfFg"
        crossorigin="anonymous"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
        integrity="sha384-43gviWU0YVjaDtb/GhzOouOXtZMP/7XUzwPTstBeZFe/+rCMvRwr4yROQP43s0Xk"
        crossorigin="anonymous"></script>
```

The Tera guard must tolerate `page` being undefined — `header.html` also renders
for sections and taxonomy pages. Verify the chosen form builds on a section page
before assuming `page.extra.math | default(value=false)` is safe.

### auto-render configuration

```js
renderMathInElement(document.body, {
  delimiters: [
    { left: '$$',  right: '$$',  display: true  },
    { left: '\\[', right: '\\]', display: true  },
    { left: '$',   right: '$',   display: false },
    { left: '\\(', right: '\\)', display: false }
  ],
  ignoredTags: ['script','noscript','style','textarea','pre','code','option'],
  ignoredClasses: ['prompt'],
  throwOnError: false
});
```

`$$` must precede `$` in the list or display math is parsed as two empty inline
formulas. `pre` and `code` are skipped by default, so hex inside backticks stays
safe even on an opt-in page. `ignoredClasses: ['prompt']` guards the shell
prompt; it is precautionary, since `prose.html` is the only template that emits
a prompt and no math page uses it. `throwOnError: false` renders a malformed
expression in red instead of blanking the page.

### Styling

Delete `sass/parts/_mathjax.scss` and add `sass/parts/_katex.scss` carrying the
same overflow treatment, updating the `@import` in `sass/main.scss`:

```scss
.katex-display {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}
```

KaTeX renders in its own serif math faces (KaTeX_Main and friends), which will
read as foreign against the IBM Plex / JetBrains Mono stack. This is
conventional for mathematics and is accepted as-is; revisit only if it looks
wrong in place.

### Documentation

- `GARDEN_GUIDE.md` — add a Math section documenting `math = true` and, more
  importantly, *why* it is opt-in rather than global
- `CLAUDE.md` — one line, since "why isn't my math rendering" is precisely the
  trap that costs an hour

## Verification

1. `zola build` completes clean.
2. Each of the seven opt-in pages contains the three KaTeX tags.
3. A 6502 page, a no-math garden note, a section page and `/about/` contain
   **none** of them — confirming both the gate and that the Tera guard does not
   error where `page` is undefined.
4. `$8000` still renders as literal text on the 6502 pages.
5. The three SRI hashes match what jsDelivr currently serves.
6. Visual check on `207-course-schedule.md` (inline only) and
   `dynamic_programming.md` (inline plus `$$` display blocks).

No automated test coverage exists for styling or templates here; verification is
`zola build` plus inspection, consistent with prior plans.

## Risks

- **jsDelivr is a second external origin** alongside Google Fonts. SRI protects
  integrity but not availability; if the CDN is unreachable, math degrades to
  raw LaTeX source rather than breaking the page.
- **Pinning 0.16.11 means manual updates.** Deliberate — an unpinned CDN URL is
  the same floating-dependency mistake as `asdf install zola latest`, which this
  repo already has one instance of.
- **Authors must remember the flag.** A new note with math and no `math = true`
  renders dollar signs. Mitigated by documenting it in `GARDEN_GUIDE.md`; if it
  recurs, a build-time check comparing math-looking content against the flag
  would catch it.
