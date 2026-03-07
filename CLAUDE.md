# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal developer blog and digital garden built with [Zola](https://www.getzola.org/) (Rust-based static site generator). Uses the [Apollo theme](https://github.com/not-matthias/apollo) as a git submodule with heavy customization via local templates and SCSS overrides.

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
