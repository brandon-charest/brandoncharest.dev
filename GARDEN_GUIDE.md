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
+++
```
