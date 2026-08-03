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
- Fonts: Inter (sans), JetBrains Mono (mono) via Google Fonts

### Theme

Apollo theme is a git submodule at `themes/apollo/`. Local `templates/` and `sass/` directories override theme defaults. The site config is in `config.toml`.

### Tooling

- **Front Matter CMS** config in `frontmatter.json` (VS Code extension for content management)
- **Obsidian** vault config in `content/.obsidian/` (content editing)
- Site analytics via Umami (configured in `config.toml`)
