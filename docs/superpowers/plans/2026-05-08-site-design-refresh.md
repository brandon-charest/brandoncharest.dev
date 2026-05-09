# Site Design & Code Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address aesthetic incoherence, redundant chrome, and code duplication identified in the deep-dive review — moving the site from "stock dev portfolio" toward a singular, intentional identity.

**Architecture:** Five sequential phases, each independently shippable. Phases ordered low-risk → high-risk: cleanup → chrome reduction → code unification → identity refresh → polish. Each phase ends with a clean `zola build` and a visual QA pass on affected surfaces.

**Tech Stack:** Zola (static site generator), Tera templates, SCSS, vanilla JS. No new dependencies.

---

## Verification Model

Static-site work has no automated test suite. Each task verifies via:
1. `zola build` exits 0 (no template or SCSS errors)
2. `zola serve` and visual check on listed surfaces in dark theme
3. Browser DevTools — no new console errors, no broken links
4. Phase 4 only: light theme visual check (if light is kept)

When a task says "verify visually," do not skip — open the listed URLs and look. Type-checking and builds verify code correctness, not feature correctness.

## Working Principles

- **Token-driven changes only.** No hardcoded colors, font names, or sizes. Every visual value goes through `sass/main.scss` tokens.
- **One concern per commit.** Each task ends with a scoped commit message.
- **DRY:** before adding a class, grep for existing equivalents.
- **YAGNI:** out-of-scope features are listed at the bottom — do not silently expand scope.
- **Frequent commits:** every step that completes a working state gets committed before moving on.

---

## File Map

Files this plan will touch:

| File | Phase | Purpose |
|---|---|---|
| `templates/partials/terminal_header.html` | 1, 2 | Fix dead branch; gated by base.html block |
| `templates/home.html` | 1, 2 | Match pane row counts; opt out of terminal_header |
| `templates/garden.html` | 1 | Drop `data-pinned="false"` noise |
| `templates/section.html` | 1, 3 | Drop `data-pinned="false"`; migrate file-list → hub-table |
| `templates/partials/nav.html` | 1 | Remove unreachable theme-toggle block |
| `templates/base.html` | 2 | Add terminal_header block; rework footer; drop uptime JS |
| `templates/partials/header.html` | 4 | Update font URL, simplify theme link tags |
| `sass/main.scss` | 1, 2, 3, 4, 5 | Token updates, drop dead import, dot-grid pseudo-element |
| `sass/parts/_terminal.scss` | 2 | Recolor traffic lights to monochrome |
| `sass/parts/_footer.scss` | 2 | Convert footer from fixed → static |
| `sass/parts/_filelist.scss` | 3 | **DELETE** after migration |
| `sass/parts/_garden.scss` | 4 | Remove `:root.light` block if light dropped |
| `sass/theme/light.scss` | 4 | **DELETE** if light dropped, or rebuild palette |
| `sass/theme/dark.scss` | 4 | New accent token values |
| `sass/fonts.scss` | 4 | Audit for stale @font-face |
| `config.toml` | 1, 4 | Theme mode |

---

## Phase 1 — Cleanup & Dead Code

**Goal:** Remove obvious noise. Each fix is small, obvious, low-risk. Doing this first means later visual diffs are signal, not noise.

**Estimated time:** ~30 min

### Task 1.1: Fix terminal_header `/posts` dead branch

**Files:**
- Modify: `templates/partials/terminal_header.html:45`

The `/posts` branch references content that lives at `/blog`. Dead code.

- [ ] **Step 1: Edit the routing condition**

In `templates/partials/terminal_header.html` line 45, change:

```jinja
{% elif my_path is starting_with("/posts") %}
```

to:

```jinja
{% elif my_path is starting_with("/blog") %}
```

Also update the contextual values on lines 47 and 49–51 to reference `/blog` instead of `/posts`:

```jinja
{% elif my_path is starting_with("/blog") %}
    {% if page %}
        {% set cmd = "cat ." ~ my_path %}
        {% set path_display = "~/blog" %}
    {% else %}
        {% set cmd = "tail -f /var/log/blog.log" %}
        {% set path_display = "~/var/log" %}
    {% endif %}
```

- [ ] **Step 2: Verify build**

Run:
```bash
zola build
```
Expected: build succeeds with no errors.

- [ ] **Step 3: Verify in browser**

Run `zola serve`. Visit:
- `/blog/` — terminal_header should show `tail -f /var/log/blog.log`
- A blog post — should show `cat ./blog/<slug>/`

- [ ] **Step 4: Commit**

```bash
git add templates/partials/terminal_header.html
git commit -m "fix: terminal_header /blog routing (was /posts, dead branch)"
```

---

### Task 1.2: Match home pane row counts

**Files:**
- Modify: `templates/home.html:30`

Garden pane shows 6 rows, blog pane shows 5. Asymmetric column heights.

- [ ] **Step 1: Edit the slice**

In `templates/home.html` line 30, change:

```jinja
{% set garden_recent = all_garden | sort(attribute="date") | reverse | slice(end=6) %}
```

to:

```jinja
{% set garden_recent = all_garden | sort(attribute="date") | reverse | slice(end=5) %}
```

- [ ] **Step 2: Verify visually**

Run `zola serve`, visit `/`. Both panes (`tail -f ./blog`, `tail -f ./garden`) should have 5 rows and equal heights.

- [ ] **Step 3: Commit**

```bash
git add templates/home.html
git commit -m "fix: match home pane row counts (5/5, was 5/6)"
```

---

### Task 1.3: Remove `data-pinned="false"` attribute noise

**Files:**
- Modify: `templates/garden.html:164-167`
- Modify: `templates/section.html:124`

The attribute is rendered on every row but only `[data-pinned="true"]` selectors exist. The `="false"` case is dead markup.

- [ ] **Step 1: Edit garden.html**

In `templates/garden.html` lines 164-167, change:

```jinja
<tr class="hub-row"
    data-growth="{{ growth }}"
    data-type="{{ ctype }}"
    data-pinned="{{ pinned }}">
```

to:

```jinja
<tr class="hub-row"
    data-growth="{{ growth }}"
    data-type="{{ ctype }}"
    {% if pinned %}data-pinned="true"{% endif %}>
```

- [ ] **Step 2: Edit section.html**

In `templates/section.html` line 124, change:

```jinja
<tr class="file-row" data-growth="{{ growth_stage }}" data-type="{{ content_type }}" data-pinned="{{ is_pinned }}">
```

to:

```jinja
<tr class="file-row" data-growth="{{ growth_stage }}" data-type="{{ content_type }}"{% if is_pinned %} data-pinned="true"{% endif %}>
```

- [ ] **Step 3: Confirm CSS only references `="true"`**

Run:
```bash
grep -rn 'data-pinned' sass/ templates/
```
Expected: every selector is `[data-pinned="true"]`. No `="false"` selectors.

- [ ] **Step 4: Visual check**

Run `zola serve`. Visit `/garden/` and any section page. Rows with `pinned = true` in their frontmatter still get the amber side-rail.

- [ ] **Step 5: Commit**

```bash
git add templates/garden.html templates/section.html
git commit -m "chore: drop data-pinned=\"false\" attribute noise"
```

---

### Task 1.4: Resolve theme-toggle / config mismatch

**Files:**
- Read: `config.toml:20`
- Modify: `templates/partials/nav.html:76-96` (conditionally)

`config.toml` is set to `theme = "auto"` so the toggle button block in nav.html is unreachable. Confirm the intent and remove dead UI.

- [ ] **Step 1: Confirm `auto` is the desired mode**

Decision required from user: keep `auto` (OS preference wins, no toggle), or switch to `toggle` (user can override)?

If `auto` → continue this task. If `toggle` → skip this task; the existing wiring is correct.

- [ ] **Step 2: Remove unreachable toggle block**

Assuming `auto` is kept, in `templates/partials/nav.html` lines 76-96, delete the entire `{% if config.extra.theme == "toggle" %} ... {% endif %}` block.

- [ ] **Step 3: Audit dead JS/asset references**

Run:
```bash
grep -rn 'toggleTheme\|themetoggle\|dark-mode-toggle\|sun-icon\|moon-icon\|auto-icon' templates/ sass/ static/
```

Inspect remaining references. The `setTheme` script in `header.html:244-260` is still needed for `auto` mode (it sets the class on `<html>` based on `prefers-color-scheme`). Keep it.

The icons (`static/icons/sun.svg`, `moon.svg`, `auto.svg`) are now orphaned — leave them in place for now; deletion is Phase 5 cleanup.

- [ ] **Step 4: Build & smoke check**

```bash
zola build
zola serve
```
Visit `/`. No toggle button in nav. Theme matches OS preference.

- [ ] **Step 5: Commit**

```bash
git add templates/partials/nav.html
git commit -m "chore: remove unreachable theme-toggle UI (config is auto)"
```

---

## Phase 2 — Reduce Competing Chrome

**Goal:** The home page currently has seven framed regions before content. Reduce that to a clear hierarchy: nav → intro → activity → footer.

**Estimated time:** ~1 hr

### Task 2.1: Make terminal_header opt-in via Tera block

**Files:**
- Modify: `templates/base.html:17-19`
- Modify: `templates/home.html` (top of file)

Home page has neofetch as its richer "intro shell" panel. The terminal_header above it is redundant. Solve by making it overridable per page.

- [ ] **Step 1: Wrap terminal_header in a block**

In `templates/base.html` lines 17-19, change:

```jinja
<div class="terminal-container">
    {% include "partials/terminal_header.html" %}
</div>
```

to:

```jinja
{% block terminal_header %}
<div class="terminal-container">
    {% include "partials/terminal_header.html" %}
</div>
{% endblock terminal_header %}
```

- [ ] **Step 2: Override on home**

In `templates/home.html` immediately after `{% extends "base.html" %}` (around line 1-2), add:

```jinja
{% block terminal_header %}{% endblock terminal_header %}
```

- [ ] **Step 3: Verify on home & elsewhere**

Run `zola serve`. Check:
- `/` — sequence is nav → neofetch → home-stats → panes (no terminal_header)
- `/garden/` — terminal_header appears as before
- `/blog/` — terminal_header appears as before
- A post page — terminal_header appears as before

- [ ] **Step 4: Commit**

```bash
git add templates/base.html templates/home.html
git commit -m "refactor: make terminal_header opt-in; drop on home"
```

---

### Task 2.2: Recolor macOS traffic lights to monochrome palette

**Files:**
- Modify: `sass/parts/_terminal.scss:117-131`

Three saturated reds/yellows/greens contradict the monochrome `--accent`-only palette. The amber-rule comment in `main.scss:91-93` says signal colors are reserved for pinned/growing — these decorative dots are not signal.

**Decision required from user:** pick variant A or B.

**Variant A — single subtle dot** (matches `_panes.scss` pane-bar style):

```scss
.window-controls {
    display: flex;
    gap: 8px;
    position: absolute;
    left: 1rem;

    .control:not(:first-child) { display: none; }
}

.control {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    opacity: 0.4;
    box-shadow: 0 0 0 2px var(--primary-a10);
}
```

**Variant B — three monochrome dots, ramped opacity:**

```scss
.control {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary);

    &.close    { opacity: 0.25; }
    &.minimize { opacity: 0.45; }
    &.maximize { opacity: 0.65; }
}
```

- [ ] **Step 1: Get user decision on variant**

- [ ] **Step 2: Apply chosen variant**

Replace the existing block at `sass/parts/_terminal.scss:117-131`:

```scss
.control {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.close { background: #ff5f56; }
    &.minimize { background: #ffbd2e; }
    &.maximize { background: #27c93f; }
}
```

with the chosen variant above.

- [ ] **Step 3: Visual check**

Run `zola serve`. Visit `/garden/`, `/blog/`, a post. Window-bar dots use `--primary` only.

- [ ] **Step 4: Confirm no other hardcoded traffic-light colors**

```bash
grep -rn '#ff5f56\|#ffbd2e\|#27c93f' sass/ templates/
```
Expected: 0 results.

- [ ] **Step 5: Commit**

```bash
git add sass/parts/_terminal.scss
git commit -m "style: recolor terminal window controls to monochrome palette"
```

---

### Task 2.3: Convert system-status footer from fixed → static; trim content

**Files:**
- Modify: `templates/base.html:38-55` (markup), `:59-84` (uptime script)
- Modify: `sass/parts/_footer.scss:1-41`
- Modify: `sass/main.scss:188-197` (layout-wrapper padding)

The fixed footer eats 32px on every page. `MODE: READ_ONLY` is constant, `UPTIME` is the visitor's session not the site's, `GIT: MAIN` is static.

- [ ] **Step 1: Trim footer markup**

In `templates/base.html` lines 38-55, replace the entire `<footer class="system-status">` block with:

```html
<footer class="system-status">
    <div class="status-item">
        <span class="status-label">LOC:</span>
        <span class="status-value">{{ config.extra.location }}</span>
    </div>
    <div class="status-item right">
        <span class="status-label">GIT:</span>
        <span class="status-value">{{ config.extra.branch }}</span>
    </div>
</footer>
```

- [ ] **Step 2: Remove uptime script**

In `templates/base.html` delete the entire `<script>` block on lines 59-84 (the `siteStartTime` / `updateUptime` IIFE).

- [ ] **Step 3: Make footer static**

In `sass/parts/_footer.scss`, replace the entire file with:

```scss
.system-status {
    margin-top: 4rem;
    padding: 0.6rem 1rem;
    background: var(--bg-surface);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
}

.status-item {
    margin-right: 1.5rem;
    display: flex;
    gap: 0.5rem;
}

.status-item.right {
    margin-left: auto;
    margin-right: 0;
}

.status-label {
    font-weight: bold;
    color: var(--text-muted);
}

.status-value {
    color: var(--text-secondary);
}

.status-item.right .status-value {
    color: var(--primary);
}
```

- [ ] **Step 4: Remove fixed-footer padding hack**

In `sass/main.scss:188-197`, change:

```scss
.layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-bottom: 40px;
    ...
}
```

to:

```scss
.layout-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    @media (min-width: 992px) {
        flex-direction: row;
    }
}
```

- [ ] **Step 5: Verify**

Run `zola serve`. Scroll to bottom of `/`, `/garden/`, a post. Footer sits naturally at content end, not floating.

- [ ] **Step 6: Confirm no broken `#uptime` references**

```bash
grep -rn '#uptime\|siteStartTime\|updateUptime' templates/ sass/ static/
```
Expected: 0 results.

- [ ] **Step 7: Commit**

```bash
git add templates/base.html sass/parts/_footer.scss sass/main.scss
git commit -m "refactor: trim system-status footer; convert from fixed to static"
```

---

## Phase 3 — Code Unification

**Goal:** One table primitive, not two. Reduces SCSS surface and keeps visual language coherent.

**Estimated time:** ~1.5 hr

`hub-table` (in `_hub-table.scss`, used by `garden.html`) and `file-list` (in `_filelist.scss`, used by `section.html`) do nearly the same job with overlapping styles. Pick one, retire the other. The `hub-readme` block in `_filelist.scss` is already dead code (zero template references) and can be deleted with the file.

### Task 3.1: Audit table primitive usage

- [ ] **Step 1: Map current usage**

Run:
```bash
grep -rn 'class="hub-table\|class="file-list\|class="hub-row\|class="file-row\|hub-table-wrap\|file-list-container\|hub-readme' templates/
```
Expected output: `hub-table` in `garden.html`, `file-list` in `section.html`, no `hub-readme` references.

- [ ] **Step 2: Compare column shapes**

Document differences (no commit needed, just for the next task):

`hub-table` columns: PERMS, GROWTH, TYPE, UPDATED, TAGS, NAME (also PERMS, CATEGORY, NOTES, LAST for the directory summary).

`file-list` columns: PERMS, GROWTH, TYPE, SIZE, DATE, NAME.

Functionally identical. `hub-table` has a more complete column primitive system (`col-perms`, `col-growth`, etc.) and is the newer pattern.

- [ ] **Step 3: Confirm direction with user**

Recommendation: keep `hub-table`, retire `file-list`. Confirm before proceeding.

---

### Task 3.2: Migrate `section.html` to hub-table

**Files:**
- Modify: `templates/section.html:81-146` (table markup), `:163` (JS selector)

- [ ] **Step 1: Replace the file-list table with hub-table markup**

In `templates/section.html`, replace lines 81-146 (`.file-list-container` through closing `</table>`) with:

```jinja
            <div class="hub-table-wrap">
                <table class="hub-table">
                    <thead>
                        <tr>
                            <th class="col-perms">PERMS</th>
                            {% if has_growth %}<th class="col-growth hide-sm">GROWTH</th>{% endif %}
                            <th class="col-type hide-sm">TYPE</th>
                            <th class="col-size">SIZE</th>
                            <th class="col-updated">DATE</th>
                            <th>NAME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {# PARENT DIRECTORY LINK #}
                        <tr class="hub-row hub-parent-row">
                            <td class="col-perms">drwxr-xr-x</td>
                            {% if has_growth %}<td class="col-growth hide-sm">—</td>{% endif %}
                            <td class="col-type hide-sm">—</td>
                            <td class="col-size">-</td>
                            <td class="col-updated">-</td>
                            <td class="col-name"><a href="../">.. (Parent Directory)</a></td>
                        </tr>

                        {# LOOP THROUGH SUBSECTIONS (FOLDERS) #}
                        {% for sub_path in section.subsections %}
                        {% set subsection = get_section(path=sub_path) %}
                        <tr class="hub-row">
                            <td class="col-perms">drwxr-xr-x</td>
                            {% if has_growth %}<td class="col-growth hide-sm">—</td>{% endif %}
                            <td class="col-type hide-sm">[dir]</td>
                            <td class="col-size">{{ subsection.pages | length }}</td>
                            <td class="col-updated">-</td>
                            <td class="col-name">
                                <a href="{{ subsection.permalink }}">{{ subsection.title }}/</a>
                            </td>
                        </tr>
                        {% endfor %}

                        {# LOOP THROUGH PAGES (FILES) #}
                        {% for page in section.pages %}
                        {% set growth_stage = page.extra.growth | default(value="seedling") %}
                        {% set content_type = page.extra.type | default(value="note") %}
                        {% set is_pinned = page.extra.pinned | default(value=false) %}
                        <tr class="hub-row" data-growth="{{ growth_stage }}" data-type="{{ content_type }}"{% if is_pinned %} data-pinned="true"{% endif %}>
                            <td class="col-perms">-rw-r--r--</td>
                            {% if has_growth %}
                            <td class="col-growth hide-sm">{% if growth_stage == "seedling" %}[seed]{% elif growth_stage == "growing" %}[grow]{% elif growth_stage == "evergreen" %}[ever]{% else %}[seed]{% endif %}</td>
                            {% endif %}
                            <td class="col-type hide-sm">{% if content_type == "blog" %}[blog]{% elif content_type == "project" %}[proj]{% elif content_type == "reference" %}[ref]{% elif content_type == "tutorial" %}[tut]{% elif content_type == "snippet" %}[snip]{% elif content_type == "log" %}[log]{% else %}[note]{% endif %}</td>
                            <td class="col-size">{{ page.content | length }}b</td>
                            <td class="col-updated"><time>{{ page.date | date(format="%Y-%m-%d") }}</time></td>
                            <td class="col-name">
                                {% if is_pinned %}<span class="badge-pinned" title="Pinned">★</span>{% endif %}
                                <a href="{{ page.permalink }}">{{ page.title }}</a>

                                {% if page.extra and page.extra.status %}
                                <span class="badge-status {{ page.extra.status }}">[{{ page.extra.status }}]</span>
                                {% endif %}
                            </td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
            </div>
```

- [ ] **Step 2: Update JS selector**

In `templates/section.html` line 163, change:

```javascript
document.querySelectorAll('.file-row[data-growth]').forEach(row => {
```

to:

```javascript
document.querySelectorAll('.hub-row[data-growth]').forEach(row => {
```

- [ ] **Step 3: Verify build**

```bash
zola build
```
Expected: build succeeds.

- [ ] **Step 4: Visual regression check on every section**

Run `zola serve`. Visit each section listing page. Confirm: table renders, parent-dir link works, growth filter URL param works, pinned star and status badge render correctly.

Sections to check:
- `/garden/algorithms/`
- `/garden/concepts/`
- `/garden/languages/`
- `/garden/projects/`
- `/garden/tools/`
- Any section with `?growth=evergreen` and `?growth=growing` in URL

- [ ] **Step 5: Commit**

```bash
git add templates/section.html
git commit -m "refactor: migrate section.html from file-list to hub-table primitive"
```

---

### Task 3.3: Delete `_filelist.scss`

**Files:**
- Modify: `sass/main.scss:19`
- Delete: `sass/parts/_filelist.scss`

- [ ] **Step 1: Confirm no remaining template references**

```bash
grep -rn 'file-list\|file-row\|parent-dir\|dir-row\|growth-col\|type-col\|hub-readme\|readme-header\|readme-body' templates/
```
Expected: 0 results.

- [ ] **Step 2: Confirm no remaining SCSS references outside _filelist.scss**

```bash
grep -rn 'file-list\|file-row\|parent-dir\|dir-row\|hub-readme' sass/ | grep -v '_filelist.scss'
```
Expected: 0 results.

- [ ] **Step 3: Remove the import**

In `sass/main.scss` line 19, delete:

```scss
@import "parts/_filelist.scss";
```

- [ ] **Step 4: Delete the file**

```bash
git rm sass/parts/_filelist.scss
```

- [ ] **Step 5: Verify build & visual**

```bash
zola build
zola serve
```
Visit `/garden/algorithms/`. No visual regression.

- [ ] **Step 6: Commit**

```bash
git add sass/main.scss
git commit -m "refactor: delete _filelist.scss (unified into hub-table)"
```

---

## Phase 4 — Identity Refresh

**Goal:** Move off the two biggest "AI portfolio" tells: Inter font and `#4ec9b0` accent (the VS Code Material Dark variable color).

**Estimated time:** ~3-4 hr (after decisions)

**This phase requires three user decisions before implementation. Do not pre-pick.**

### Task 4.1: Decision — light theme keep or drop

The site's identity lives in dark mode. The light theme is `#f5f5f5` bg with `#eeeeee` surfaces — almost no contrast between bg and card; reads as a grayscale demote of the dark theme.

**Options:**
- **(A) Drop light theme.** Set `theme = "dark"` in config.toml, delete `light.scss`, simplify header link tags. Confident dark-only commitment.
- **(B) Recommit to light.** Build a real palette: paper-cream bg, ink-dark text, single accent. Designed independently from dark.

- [ ] **Step 1: Get user decision (A or B)**

If (A) → continue with Task 4.1A.
If (B) → Task 4.1B (separate branch of work — a real light-theme palette redesign requires its own design pass; if user picks B, defer to a follow-up plan rather than rushing it here).

---

### Task 4.1A: Drop light theme (only if user chose A)

**Files:**
- Modify: `config.toml:20`
- Modify: `sass/main.scss:32`
- Delete: `sass/theme/light.scss`
- Modify: `templates/partials/header.html:215-240`
- Modify: `sass/parts/_garden.scss:38-41` (orphaned `:root.light` block)
- Modify: `sass/parts/_hub-table.scss:65` (orphaned `:root.light` block)

- [ ] **Step 1: Update config**

In `config.toml` line 20, change:

```toml
theme = "auto"
```

to:

```toml
theme = "dark"
```

- [ ] **Step 2: Drop light import**

In `sass/main.scss` line 32, delete:

```scss
@import "theme/light.scss";
```

- [ ] **Step 3: Delete light.scss**

```bash
git rm sass/theme/light.scss
```

- [ ] **Step 4: Simplify header theme-link logic**

In `templates/partials/header.html` lines 215-240, replace the entire theme-mode `if/elif` chain with the single dark branch:

```jinja
<link rel="stylesheet" type="text/css" href="{{ get_url(path='theme/dark.css') }}" />
```

(Also delete lines 244-260 — the `setTheme` script block — since `auto`/`toggle` are no longer in play.)

- [ ] **Step 5: Find & remove orphaned `:root.light` selectors**

```bash
grep -rn ':root\.light\|root\\.light' sass/
```

For each match, delete the `:root.light & { ... }` block (do NOT delete its enclosing parent rule).

Known locations to verify:
- `sass/parts/_garden.scss:38-41` (bonsai light-mode blend mode)
- `sass/parts/_hub-table.scss:65` (light-mode row striping)

- [ ] **Step 6: Confirm**

```bash
grep -rn ':root\.light\|class="light\|<body class="light' sass/ templates/
```
Expected: only the `<body class="light dark">` in `base.html:10` — that's a default-class fallback. Update it:

In `templates/base.html:10`, change:
```html
<body class="light dark">
```
to:
```html
<body class="dark">
```

- [ ] **Step 7: Build & smoke check every surface**

```bash
zola build
zola serve
```

Visit: `/`, `/garden/`, `/garden/algorithms/`, `/blog/`, a blog post, a garden post, `/about/`, `/now/`. No light-mode flash, no unstyled elements.

- [ ] **Step 8: Commit**

```bash
git add config.toml sass/main.scss sass/parts/ templates/partials/header.html templates/base.html
git rm sass/theme/light.scss
git commit -m "refactor: drop light theme; commit fully to dark identity"
```

---

### Task 4.2: Decision & swap — accent color

Move off `#4ec9b0` (VS Code Material Dark variable color, very recognizable as default).

**Candidate palette** (all readable on `#0d0d0d` bg, all "terminal-feeling"):

| Direction | Hex | Vibe |
|---|---|---|
| Cooler cyan | `#5ce4f0` | Sharper, bluer, blade-runner |
| Warmer sage | `#7ec699` | Organic, garden-friendly |
| Richer teal | `#39bda7` | Saturated cousin of current |
| CRT amber-green | `#a3d977` | Old-CRT phosphor throwback |
| Alternative phosphor | `#b8c25b` | Olive-green, late-80s terminal |

- [ ] **Step 1: Get user decision (one accent)**

User picks ONE value. Note: the chosen color is also used for `--accent-dim` (a darker shade for borders) and the alpha ramps. Compute the dim variant by reducing lightness ~30%.

- [ ] **Step 2: Update tokens**

The accent appears in three files. Update all three with the chosen hex.

In `sass/main.scss` lines 40-41:
```scss
--accent:        <CHOSEN_HEX>;
--accent-dim:    <COMPUTED_DIM>;
```

In `sass/main.scss` lines 83-89, recompute the alpha ramps. For accent `rgb(R, G, B)`:
```scss
--primary-a05: rgba(R, G, B, 0.05);
--primary-a08: rgba(R, G, B, 0.08);
--primary-a10: rgba(R, G, B, 0.10);
--primary-a15: rgba(R, G, B, 0.15);
--primary-a20: rgba(R, G, B, 0.20);
--primary-a25: rgba(R, G, B, 0.25);
--primary-a30: rgba(R, G, B, 0.30);
```

In `sass/theme/dark.scss` lines 3-4 (same `--accent` / `--accent-dim` values).

In `sass/theme/dark.scss` lines 46-52 (same alpha ramps).

- [ ] **Step 3: Confirm no remaining literals**

```bash
grep -rn '#4ec9b0\|4ec9b0\|78, 201, 176\|78,201,176\|2a8a76\|42, 138, 118' sass/ templates/ static/
```
Expected: 0 results.

- [ ] **Step 4: Visual walk every surface**

Run `zola serve`. Walk: `/`, `/garden/`, a section, a post, `/about/`. Look for any element that visually "still looks teal" — that's a hardcoded literal you missed.

- [ ] **Step 5: Commit**

```bash
git add sass/
git commit -m "style: swap accent from #4ec9b0 (VS Code default) to <chosen>"
```

---

### Task 4.3: Decision & swap — typography

Move off Inter (most-overused dev portfolio sans).

**Pairing options:**

**Option 1 — All-mono (strongest aesthetic commitment):**
- Departure Mono (free, retro pixel-style) + JetBrains Mono fallback
- Commit Mono (free, programmer-focused) — single family for everything
- Monaspace Neon (free, GitHub Next) — variable axes for body vs chrome
- Berkeley Mono (paid $75) — premium, distinctive

**Option 2 — Editorial pairing (best for long-form posts):**
- JetBrains Mono (chrome) + Newsreader (body, Google Fonts free)
- JetBrains Mono (chrome) + Fraunces (body, Google Fonts free)
- JetBrains Mono (chrome) + IBM Plex Sans (body, Google Fonts free)
- JetBrains Mono (chrome) + Geist (body, Vercel font, free)

**Option 3 — Refined dev (incremental):**
- JetBrains Mono (chrome) + Geist Sans (body)

- [ ] **Step 1: Get user decision**

User picks ONE pairing. Confirm fonts, weights, license.

- [ ] **Step 2: Update font URL in header**

In `templates/partials/header.html` lines 263-266, replace:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet">
```

with the new families (preserving preconnect tags). Use ONLY the weights actually used in SCSS — typically 400, 500, 700.

For self-hosted fonts (Berkeley Mono, etc.) — add `@font-face` declarations to `sass/fonts.scss` and link the `fonts.css` from header (already wired via the `use_cdn` toggle).

- [ ] **Step 3: Update font tokens**

In `sass/main.scss` lines 73-74:
```scss
--font-sans: '<chosen-body>', system-ui, sans-serif;
--font-mono: '<chosen-mono>', 'JetBrains Mono', 'Consolas', monospace;
```

- [ ] **Step 4: Audit `sass/fonts.scss`**

Open `sass/fonts.scss`. Remove `@font-face` blocks for fonts no longer used. Add new ones if self-hosting.

- [ ] **Step 5: Visual walk every surface**

Pay attention to:
- Headers (h1-h6 use `--font-mono` per `_header.scss:122-124`) — do they still feel right?
- Body text legibility at 14px base
- Long-form post readability (visit a real blog post)
- Code blocks and inline code

- [ ] **Step 6: Tune if needed**

If new font is taller/wider, may need `--line-height` or `--font-size-base` adjustments in `main.scss:107-109`. Adjust by 1-2 units only — small tweaks.

- [ ] **Step 7: Commit**

```bash
git add templates/partials/header.html sass/main.scss sass/fonts.scss
git commit -m "style: swap typography from Inter+JetBrains Mono to <chosen pair>"
```

---

### Task 4.4: Drop unused font weights

**Files:**
- Modify: `templates/partials/header.html:265`
- Modify: `sass/fonts.scss` (if self-hosted)

- [ ] **Step 1: Audit which weights are used**

```bash
grep -rhn 'font-weight' sass/ | grep -oE 'font-weight:\s*[0-9]+' | sort -u
```

- [ ] **Step 2: Trim Google Fonts URL**

Update the `family=...:wght@...` query string to only requested weights.

- [ ] **Step 3: Verify visually**

Quick walk of all surfaces; nothing renders in a default-fallback weight.

- [ ] **Step 4: Commit**

```bash
git add templates/partials/header.html
git commit -m "perf: drop unused font weights"
```

---

## Phase 5 — Polish & Performance

**Goal:** Final cleanup pass. Performance, accessibility, dead assets.

**Estimated time:** ~1 hr

### Task 5.1: Fix dot-grid scroll repaint

**Files:**
- Modify: `sass/main.scss:112-138`

`background-attachment: fixed` causes scroll repaints on iOS Safari (and weaker GPUs). Move grid to a pseudo-element with `position: fixed`.

- [ ] **Step 1: Refactor html background**

In `sass/main.scss`, replace lines 112-138 (the `html { ... }` block) with:

```scss
html {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  line-height: var(--line-height);
  min-height: 100%;
  position: relative;

  @media (max-width: 992px) { font-size: calc(var(--font-size-base) * 0.97); }
  @media (max-width: 768px) { font-size: calc(var(--font-size-base) * 0.95); }
  @media (max-width: 576px) { font-size: calc(var(--font-size-base) * 0.92); }
}

html::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, var(--grid-color) 0.75px, transparent 0.75px);
  background-size: 32px 32px;
  pointer-events: none;
  z-index: -1;
}
```

- [ ] **Step 2: Verify visually**

Run `zola serve`. Scroll a long blog post — should feel smooth. Dot grid should still appear behind content.

- [ ] **Step 3: Verify in Safari/Chrome DevTools mobile preview**

Open a long post in DevTools mobile emulation, scroll, watch the FPS counter. Should hit 60fps.

- [ ] **Step 4: Commit**

```bash
git add sass/main.scss
git commit -m "perf: move dot grid to pseudo-element to avoid scroll repaint"
```

---

### Task 5.2: Accessibility audit & contrast fixes

**Files:**
- Possibly modify: `sass/theme/dark.scss` (token values)

- [ ] **Step 1: Run Lighthouse on three pages**

Run Lighthouse (DevTools → Lighthouse → Accessibility) on:
- `/`
- `/blog/<a real post>/`
- `/garden/`

Note any Accessibility issues flagged.

- [ ] **Step 2: Manual keyboard test**

- Tab from address bar onto `/`. The skip-link should reveal at top.
- Continue tabbing — focus rings should be visible on every interactive element (`:focus-visible` defined in `main.scss:182-185`).
- Tab into a hub-table row's link, hit enter — should navigate.

- [ ] **Step 3: Check WCAG contrast for `--text-muted`**

`#555555` text on `#0d0d0d` background = ~3.1:1. WCAG AA requires 4.5:1 for body text, 3:1 for large/UI text. The token is mostly used in chrome/labels (acceptable at 3:1) but verify any body-text use.

If body text uses `--text-muted`, lift to `~#7a7a7a` (~5.0:1) by editing `sass/theme/dark.scss:10`:
```scss
--text-muted:    #7a7a7a;  /* was #555555 */
```

If it's only chrome, leave as is.

- [ ] **Step 4: Fix any issues found**

Tokens only — no hardcodes.

- [ ] **Step 5: Commit (only if changes made)**

```bash
git add sass/
git commit -m "a11y: lift --text-muted contrast to meet WCAG AA"
```

---

### Task 5.3: Delete orphaned static assets

**Files:**
- Possibly delete: `static/icons/sun.svg`, `moon.svg`, `auto.svg`, `static/js/themetoggle.js`

(Only if Phase 4 dropped light theme.)

- [ ] **Step 1: Confirm no references**

```bash
grep -rn 'sun.svg\|moon.svg\|auto.svg\|themetoggle' templates/ sass/ static/
```
Expected: only intra-`themetoggle.js` references and self-references inside the SVG files themselves.

- [ ] **Step 2: Delete**

```bash
git rm static/icons/sun.svg static/icons/moon.svg static/icons/auto.svg static/js/themetoggle.js
```

- [ ] **Step 3: Build & smoke check**

```bash
zola build
```
Expected: clean build. No 404s on the home page (DevTools → Network).

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: delete orphaned theme-toggle assets"
```

---

### Task 5.4: Build size & link check

- [ ] **Step 1: Inspect build output**

```bash
zola build
du -sh public/
ls -lah public/main.css
```

Compare to a pre-refresh baseline (run `git stash; zola build; du -sh public/; git stash pop` if needed). Expect smaller (deleted `_filelist.scss`, possibly `light.scss` and theme assets).

- [ ] **Step 2: Run link checker**

```bash
zola check
```

Expected: zero broken links. If any fail, fix and re-run.

- [ ] **Step 3: Commit any final fixes**

```bash
git add config.toml content/
git commit -m "fix: resolve broken links found by zola check"
```

---

## Out of Scope — Tracked for Future Work

These came up in review but are larger directional bets, not refactors:
- Vim-style keybindings (`g h`, `g g`, `/` to focus search)
- Editorial mode for long-form posts (drop terminal chrome on `/blog/<post>/` for reading-first treatment)
- Make `tail -f` real — fetch live timestamps via JSON for home pane rows
- ASCII bonsai redesign or contextual labeling
- Custom OG image generator per post

If the user wants any of these, brainstorm separately — they're features, not fixes.

---

## Self-Review Checklist

- ✅ Spec coverage: every issue called out in the review maps to a task (terminal_header dead branch → 1.1; pane row asymmetry → 1.2; data-pinned noise → 1.3; toggle/config mismatch → 1.4; redundant home chrome → 2.1; traffic lights → 2.2; fixed footer → 2.3; table dedup → 3.1-3.3; light theme decision → 4.1; accent color → 4.2; typography → 4.3; weight trim → 4.4; dot-grid perf → 5.1; a11y → 5.2; orphan assets → 5.3; size check → 5.4)
- ✅ No placeholders. Every code block has the actual edit.
- ✅ Type/name consistency: `hub-table` / `hub-row` / `col-*` used consistently across Phase 3 tasks.
- ✅ Decisions are explicit and gate downstream work (Tasks 1.4, 2.2, 4.1, 4.2, 4.3).
- ✅ Each phase ends in a working `zola build`.
- ✅ Frequent, scoped commits per task.
- ⚠ Static-site work has no automated tests — verification is `zola build` + visual check. Documented in "Verification Model" up front.
