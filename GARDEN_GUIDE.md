# Digital Garden Growth Stages & Content Types

## Growth Stages

Use the `growth` field in your frontmatter to indicate note maturity:

```toml
[extra]
growth = "seedling"  # 🌱 New idea, rough notes
growth = "growing"   # 🌿 Developing, being refined
growth = "evergreen" # 🌲 Mature, well-established
```

### Growth Stage Icons

- **Seedling** 🌱: New ideas, rough notes, work in progress
- **Growing** 🌿: Developing content, being actively refined
- **Evergreen** 🌲: Mature, well-established, rarely changes

## Content Types

Use the `type` field to categorize your content:

```toml
[extra]
type = "note"       # 📄 General note (default)
type = "blog"       # 📝 Blog post/article
type = "project"    # 🚀 Project documentation
type = "reference"  # 📚 Reference material
type = "tutorial"   # 🎓 Tutorial/guide
type = "snippet"    # 💾 Code snippet
type = "log"        # 🛠️ Dev log/build journal
```

## Math

Notes containing LaTeX must opt in. Without the flag you get literal dollar
signs:

```toml
[extra]
math = true
```

Then `$O(n \log n)$` renders inline and `$$…$$` renders as a display block.
`\(…\)` and `\[…\]` also work.

**Why it is opt-in and not just always on.** `$` is not a safe delimiter across
this whole site. The 6502 emulator notes write hex literals in prose — `$8000`,
`$C000`, `$00` — and turning on `$…$` globally would treat everything between
two hex addresses as a formula and mangle the paragraph. Pages that do not
declare `math` never load the renderer, so that content cannot break no matter
what anyone writes in it.

Anything inside backticks or a fenced block is skipped regardless, so
`` `$8000` `` is always safe even on a page with math enabled.

The renderer is KaTeX, loaded from a CDN only on pages that ask for it.

## Example Frontmatter

```toml
+++
title = "Rust Borrowing Rules"
date = "2024-01-15"
description = "Deep dive into Rust's ownership system"

[taxonomies]
tags = ["rust", "systems"]

[extra]
growth = "evergreen"  # Well-established content
type = "reference"    # Reference material
math = true           # Only if the note contains LaTeX
+++
```
