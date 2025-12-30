# Digital Garden Growth Stages & Content Types

## Growth Stages

Use the `growth` field in your frontmatter to indicate note maturity:

```toml
[extra]
growth = "seedling"  # 🌱 New idea, rough notes
# or
growth = "growing"   # 🌿 Developing, being refined
# or
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
# or
type = "blog"       # 📝 Blog post/article
# or
type = "project"    # 🚀 Project documentation
# or
type = "reference"  # 📚 Reference material
# or
type = "tutorial"   # 🎓 Tutorial/guide
# or
type = "snippet"    # 💾 Code snippet
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
type = "reference"     # Reference material
+++
```

## Visual Indicators

The file list now shows:

1. **Growth stage icon** (left) - indicates note maturity
2. **Content type icon** (middle) - indicates content category  
3. **Border accent** (left edge) - blogs and projects get colored borders
4. **Hover effects** - icons scale up and become more vibrant on hover
