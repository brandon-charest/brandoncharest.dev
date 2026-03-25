+++
title = "Database Patterns for Content Hierarchies"
date = "2026-01-13T16:48:37.996Z"
description = "Schema patterns for handling asset variants and internationalization"

[taxonomies]
tags = [ "system-design" ]  
[extra]
growth = "growing"
+++

Design a data model to store the catalog for a show like The Office or Breaking Bad.

## Requirements

- Shows can have multiple seasons and episodes
- Episodes might have different 'cuts' for different regions (e.g., 'censored' version for Region A, 'Director's Cut' for Region B)
- Shows might be localized for different regions (title and description vary by locale)

We can model this as a simple Parent > Child > Grandchild hierarchy:

**Show** > **Season** > **Episode**

## Naive Approach

```sql
-- SHOW (Top-level parent)
CREATE TABLE shows {
    show_id UUID PRIMARY KEY
    title
    release_year
    created_at
}
-- SEASON (Child)
CREATE TABLE seasons {
    season_id UUID PRIMARY KEY
    show_id UUID NOT NULL REFERENCES shows(show_id)
    description
    season_number
    release_year
    created_at
}
-- EPISODE (Grandchild)
CREATE TABLE episodes {
    episode_id UUID PRIMARY KEY
    season_id UUID NOT NULL REFERENCES seasons(season_id)
    episode_number
    title
    description
    runtime_sec
    created_at
}
```

This captures the basic hierarchy, but we are still missing some requirements:

1. **No support for multiple cuts** - We'd need separate episode entries for each version
2. **No localization** - Titles and descriptions are hard-coded
3. **Asset metadata missing** - No place for technical video data (codec, frame rate, S3 paths)

## Pattern: Concept vs. Asset Separation

We could just add a cut_type column to the episodes table. This would mean we would need to add a row for every episode, for each cut_type. Clearly this adds a lot of duplication and does not scale very well.

One solution is to separate the **concept** (the intellectual property) from the **asset** (the actual video file).

An episode is a concept - The Office: Season 05 Episode 05 "Stress Relief" exists as an idea. But there might be multiple playable assets: the original broadcast, a director's cut, a censored version for streaming, etc.

### Benefits

- **Deduplication**: Episode metadata stored once, not repeated per variant
- **Query efficiency**: Fetch episode details without joining heavy asset data
- **Flexibility**: Add new asset types (4K remasters, bonus content) without schema changes
- **Auditing**: Easily track which playable versions exist for each episode

## Refactored Schema

```sql
CREATE TABLE shows (
    show_id             UUID PRIMARY KEY,
    release_year        INT,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seasons (
    season_id           UUID PRIMARY KEY,
    show_id             UUID NOT NULL REFERENCES shows(show_id),
    season_number       INT NOT NULL,
    release_year        INT,
    created_at          TIMESTAMP DEFAULT NOW()
);
-- EPISODE (Grandchild - the "Concept")
CREATE TABLE episodes (
    episode_id          UUID PRIMARY KEY,
    season_id           UUID NOT NULL REFERENCES seasons(season_id),
    episode_number      INT NOT NULL,
    original_runtime_sec INT NOT NULL, -- Canonical runtime
    created_at          TIMESTAMP DEFAULT NOW()
);
-- PLAYABLES (The "Asset")
CREATE TABLE playables (
    playable_id         UUID PRIMARY KEY,
    episode_id          UUID NOT NULL REFERENCES episodes(episode_id),
    asset_type          VARCHAR(20),  -- 'ORIGINAL', 'DIRECTORS_CUT', 'CENSORED_UK'
    
    -- Technical metadata
    duration_sec        INT NOT NULL, -- May differ from episode.original_runtime
    frame_rate          DECIMAL(5,2), -- 23.97, 60.00
    resolution          VARCHAR(10),  -- '1080p', '4K'
    codec               VARCHAR(20),  -- 'H.264', 'VP9'
    s3_path             VARCHAR(255),
    
    created_at          TIMESTAMP DEFAULT NOW()
);
```

## Sidecar - Localization

Looking back at our requirements, we still need to support localization. Shows might be available in different languages with translated titles and descriptions.

We _could_ add `title_en`, `title_es`, `title_ja`, `description_en`, `description_es`, `description_ja` columns to our shows, seasons, and episodes tables. But this approach becomes unmaintainable quickly:

- Schema changes required for every new language
- Most columns would be NULL (not every show is translated to every language)
- Queries become complex with conditional column selection

### The Sidecar Pattern

Instead, we use a **sidecar table** - a separate table that holds supplementary, optional data alongside the core entity. Think of it like a motorcycle sidecar: attached to the main vehicle but separate.

```sql
CREATE TABLE localized_metadata (
    entity_id           UUID NOT NULL, 
    locale              VARCHAR(10) NOT NULL, -- 'en-US', 'pt-BR', 'ja-JP'
    
    -- The localized content
    title               TEXT,
    description         TEXT,
    synopsis_short      VARCHAR(140),
    
    -- Helps identify which table entity_id references
    entity_type         VARCHAR(20), -- 'SHOW', 'SEASON', 'EPISODE'
    
    PRIMARY KEY (entity_id, locale)
);
```

### How It Solves Our Problem

This design uses a **polymorphic association** - `entity_id` can reference a `show_id`, `season_id`, or `episode_id`. The composite primary key `(entity_id, locale)` ensures one translation per entity per language.

**Benefits:**
- **Dynamic languages**: Add new languages without schema changes (just insert new rows)
- **Sparse data**: Only store translations that exist (no NULL columns for untranslated content)
- **Clean core tables**: Shows, seasons, and episodes remain focused on structural data
- **Flexible queries**: Easily fetch content in any language with a simple JOIN

**Example:** Breaking Bad might have English, Spanish, and Japanese metadata. The Office might only have English and Portuguese. Each only stores what's needed.

### Scale: Why This Matters

Let's say Netflix wants to add support for Korean (ko-KR). With the naive column approach, you'd need to:

1. **Add 6 new columns** to EVERY entity table (`title_ko`, `description_ko` for shows, seasons, episodes)
2. **Migrate ~18,000 shows**, each with ~50 episodes = **~900,000 episode rows**
3. **ALTER TABLE** on massive production tables during a maintenance window
4. **Update application code** to handle the new columns
5. **Backfill translations** gradually, leaving millions of NULL values initially

With the sidecar pattern:

1. **Insert new rows** into `localized_metadata` as translations arrive
2. **No schema changes**, **no migrations**, **no downtime**
3. **Application code unchanged** - already handles dynamic locales via JOIN

> **Real Impact:** Adding 10 new languages with the column approach = 60 new columns × 1M+ rows = massive table rewrites. With sidecar = just insert new rows into a single table. No locks, no risk.


## Pattern Names

This design combines three patterns:

1. **Concept-Asset Separation**: `episodes` (concept) vs `playables` (physical assets)
2. **Sidecar Table**: `localized_metadata` provides supplementary, optional data
3. **Polymorphic Association**: `localized_metadata.entity_id` can reference multiple table types

## Entity Diagram

{% mermaid() %}
erDiagram
    shows ||--o{ seasons : "has"
    seasons ||--o{ episodes : "has"
    episodes ||--o{ playables : "has"
    
    shows ||--o{ localized_metadata : "has translations"
    seasons ||--o{ localized_metadata : "has translations"
    episodes ||--o{ localized_metadata : "has translations"
    
    shows {
        UUID show_id PK
        VARCHAR original_language
        INT release_year
        TIMESTAMP created_at
    }
    
    seasons {
        UUID season_id PK
        UUID show_id FK
        INT season_number
        INT release_year
        TIMESTAMP created_at
    }
    
    episodes {
        UUID episode_id PK
        UUID season_id FK
        INT episode_number
        INT original_runtime_sec
        TIMESTAMP created_at
    }
    
    playables {
        UUID playable_id PK
        UUID episode_id FK
        VARCHAR asset_type
        INT duration_sec
        DECIMAL frame_rate
        VARCHAR resolution
        VARCHAR codec
        VARCHAR s3_path
        TIMESTAMP created_at
    }
    
    localized_metadata {
        UUID entity_id PK,FK
        VARCHAR locale PK
        TEXT title
        TEXT description
        VARCHAR synopsis_short
        VARCHAR entity_type
    }
{% end %}

## Query Examples

### Get all episodes of a season with their available playables

```sql
SELECT 
    e.episode_number,
    lm.title,
    p.asset_type,
    p.duration_sec,
    p.resolution
FROM episodes e
LEFT JOIN localized_metadata lm 
    ON e.episode_id = lm.entity_id 
    AND lm.locale = 'en-US'
LEFT JOIN playables p 
    ON e.episode_id = p.episode_id
WHERE e.season_id = ?
ORDER BY e.episode_number, p.asset_type;
```

### Find shows available in Japanese

```sql
SELECT DISTINCT s.show_id, lm.title
FROM shows s
JOIN localized_metadata lm 
    ON s.show_id = lm.entity_id 
    AND lm.entity_type = 'SHOW'
    AND lm.locale = 'ja-JP';
```

### Get all 4K playables for a show

```sql
SELECT 
    lm_show.title AS show_title,
    s.season_number,
    e.episode_number,
    lm_ep.title AS episode_title,
    p.s3_path
FROM playables p
JOIN episodes e ON p.episode_id = e.episode_id
JOIN seasons s ON e.season_id = s.season_id
JOIN shows sh ON s.show_id = sh.show_id
LEFT JOIN localized_metadata lm_show 
    ON sh.show_id = lm_show.entity_id 
    AND lm_show.locale = 'en-US'
LEFT JOIN localized_metadata lm_ep 
    ON e.episode_id = lm_ep.entity_id 
    AND lm_ep.locale = 'en-US'
WHERE p.resolution = '4K'
    AND sh.show_id = ?;
```

## Real-World Considerations

### Indexing Strategy

```sql
-- Essential foreign key indexes
CREATE INDEX idx_seasons_show_id ON seasons(show_id);
CREATE INDEX idx_episodes_season_id ON episodes(season_id);
CREATE INDEX idx_playables_episode_id ON playables(episode_id);

-- Localization lookups
CREATE INDEX idx_localized_entity_locale ON localized_metadata(entity_id, locale);
CREATE INDEX idx_localized_type_locale ON localized_metadata(entity_type, locale);

-- Asset filtering
CREATE INDEX idx_playables_type ON playables(asset_type);
CREATE INDEX idx_playables_resolution ON playables(resolution);
```

### Soft Deletes

For auditing and recovery:

```sql
ALTER TABLE episodes ADD COLUMN deleted_at TIMESTAMP NULL;

-- Query only active episodes
SELECT * FROM episodes WHERE deleted_at IS NULL;
```

### Versioning

For tracking metadata changes over time, add:

```sql
ALTER TABLE localized_metadata ADD COLUMN version INT DEFAULT 1;
ALTER TABLE localized_metadata ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
```

### Constraint Validation

```sql
-- Ensure episode numbers are sequential
ALTER TABLE episodes ADD CONSTRAINT positive_episode_num 
    CHECK (episode_number > 0);

-- Validate asset types
ALTER TABLE playables ADD CONSTRAINT valid_asset_type
    CHECK (asset_type IN ('ORIGINAL', 'DIRECTORS_CUT', 'CENSORED', 'EXTENDED', 'THEATRICAL'));
```

## Scaling Considerations

- **Read replicas**: Most queries are reads (browsing catalog), use read replicas
- **Caching**: Cache localized metadata at the CDN level (rarely changes)
- **Partitioning**: Partition `playables` by `created_at` if ingesting massive libraries
- **Denormalization**: Consider materializing common queries (e.g., "episodes per season count") for homepage displays

---

## In Practice: CigarEdge Catalog

I didn't expect to actually use these patterns until I started building [CigarEdge](@/garden/projects/cigar-edge/_index.md) — a cigar price comparison site. Turns out the Show > Season > Episode hierarchy maps almost perfectly to the cigar world. Brand > Product Line > Variant > Purchasable Size. Same nesting, different nouns.

### Where the Patterns Show Up

**Concept-Asset Separation** — A cigar variant is the concept — it exists as an idea. But you don't *buy* a concept, you buy a box of 20, a 5-pack, or a single. Those are the assets. Pricing attaches to the purchasable unit, not the variant, because a single stick and a box of 20 are very different purchases.

**Sidecar-Style Enrichment** — Some data shows up immediately when the catalog is built — the stuff that makes a product unique. Other data (origin, strength, leaf details) trickles in later from different sources. Sound familiar? 

It's the same idea as localized metadata arriving separately from the show/episode structure. Core identity lives in the main table, supplementary details ride along in sidecar-style fields.

**Denormalization for Reads** — I also have a denormalized "current price" table because I got tired of aggregating the full price history every time someone loads a page. Every price write updates both tables. You pay on writes to avoid the aggregation on reads — same trade-off as materializing "episodes per season count" for a homepage.