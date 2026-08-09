# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer blog and digital garden built with [Zola](https://www.getzola.org/) (Rust-based static site generator). Uses the [Apollo theme](https://github.com/not-matthias/apollo) as a git submodule with heavy customization via local templates and SCSS overrides.

## Toolchain

**Zola 0.20.0 locally.** Keep the local binary matched to whatever production
builds with — they drifted once (local 0.17.2 vs prod) and the symptoms were
silent: `generate_feeds`/`feed_filenames` are 0.19+ names, so the local build
produced no Atom feed at all while production was fine.

**Production build is not pinned** (as of 2026-08-03). The Pages project runs a
pre-build script rather than using the native `ZOLA_VERSION`:

```
asdf plugin add zola https://github.com/salasrod/asdf-zola && asdf install zola latest && asdf global zola latest
```

Two problems. It currently *fails*: the v2 build image pre-registers the plugin,
so `asdf plugin add` exits 2 and `&&` aborts the chain before Zola installs. And
`latest` means the toolchain floats — the next green build would take 0.22.x,
which moved every highlighting option into `[markdown.highlighting]` and would
break `config.toml` as written.

Fix is to clear the pre-build script and let `ZOLA_VERSION` (already set) do the
job, or at minimum make it `... || true` and pin the version instead of `latest`.
This lives in the Cloudflare dashboard, not in this repo.

Local install lives at `~/.local/bin/zola`, which precedes `/usr/local/bin` on
PATH. Check with `zola --version` before trusting a build.

When verifying with `zola serve`, confirm which binary is actually serving —
a stale server from an older version will keep the port and silently answer
every request:

```sh
readlink -f /proc/$(pgrep -x zola | head -1)/exe
```

Upgrading past 0.21 is a breaking change: 0.22 replaces syntect with Giallo and
moves all highlighting config into `[markdown.highlighting]`. That would rewrite
`config.toml`'s markdown section and probably retire
`highlight_themes/gruvbox-dark.tmTheme` in favour of Giallo's built-in
`gruvbox-dark`. Bump the Cloudflare variable and the config in the same change.

## Common Commands

- **Dev server:** `zola serve` (hot-reloading at localhost:1111)
- **Build:** `zola build` (outputs to `public/`)
- **New post:** `./new-post.sh <type> <path>` where type is `blog`, `garden`, or `index`
  - `./new-post.sh blog content/blog/2026-01-05-my-post.md`
  - `./new-post.sh garden content/garden/languages/rust/new-topic.md`
  - `./new-post.sh index content/garden/newcategory/_index.md`

## Architecture

### Content Structure

Content uses TOML frontmatter (`+++` delimiters). Two main content areas:

- **`content/blog/`** — Traditional blog posts, date-prefixed filenames
- **`content/garden/`** — Digital garden with nested categories: `algorithms/`, `concepts/`, `languages/`, `projects/`, `tools/`
- **`content/about.md`**, **`content/now.md`** — Standalone pages

### Digital Garden Metadata

Garden pages use `[extra]` frontmatter fields (see `GARDEN_GUIDE.md` for full reference):
- **`growth`**: `"seedling"` | `"growing"` | `"evergreen"` — note maturity stage
- **`type`**: `"note"` | `"blog"` | `"project"` | `"reference"` | `"tutorial"` | `"snippet"` | `"log"`
- **`math`**: `true` loads KaTeX on that page. **Required** — a note with LaTeX
  and no flag renders literal dollar signs, and that is the trap to check first
  when "math isn't rendering". It is opt-in rather than site-wide because `$` is
  not globally safe here: the 6502 notes write hex literals like `$8000` in
  prose, and enabling `$...$` everywhere would eat the text between two of them.

### Templates

All templates extend `base.html`. Key templates:
- **`page.html`** — Individual content pages with floating TOC widget
- **`section.html`** — Directory-style listing (mimics `ls -la` output with file permissions, sizes, dates)
- **`garden.html`** — Garden landing page with growth stage stats/filters and category cards
- **`blog.html`** — Blog listing page

Reusable components live in:
- **`macros/ui.html`** — Window bars, command prompts, card headers, tag displays
- **`macros/meta.html`** — Page metadata headers
- **`macros/toc.html`** — Table of contents tree rendering
- **`partials/`** — Header, nav, terminal header, neofetch, backlinks

### Styling

SCSS compiled by Zola (`compile_sass = true`). Entry point is `sass/main.scss`.
- **`sass/parts/`** — Component-specific styles (24 partial files)
- **`sass/theme/`** — `light.scss` and `dark.scss` theme overrides
- Design uses a terminal/hacker aesthetic with CSS custom properties for theming
- Fonts: three families via Google Fonts — IBM Plex Mono (headings at 700,
  terminal chrome at 400–600), IBM Plex Sans (prose), JetBrains Mono (code).
  `docs/design/TOKENS.md` § Typography is the source of truth; the font URL
  lives in `templates/partials/header.html`. Add a weight to one without the
  other and it silently falls back to `ui-monospace`.

### Theme

Apollo theme is a git submodule at `themes/apollo/`. Local `templates/` and `sass/` directories override theme defaults. The site config is in `config.toml`.

### Tooling

- **Front Matter CMS** config in `frontmatter.json` (VS Code extension for content management)
- **Obsidian** vault config in `content/.obsidian/` (content editing)
- Site analytics via Umami (configured in `config.toml`)

## Syntax highlighting — a trap worth knowing

`highlight_themes/gruvbox-dark.tmTheme` is the source of truth for code colours,
and Zola regenerates `public/syntax-theme-dark.css` from it on every build.

A committed `static/syntax-theme-dark.css` used to shadow that output — static
files are copied over generated ones, so the tmTheme was dead code and edits to
it changed nothing. It was deleted 2026-08-03. **Do not re-add a checked-in copy
of a file Zola generates.**

The tell is the mtime: if `public/syntax-theme-dark.css` is older than the build
you just ran, something is shadowing it.

```sh
zola build && stat -c '%y %n' public/syntax-theme-dark.css
```
