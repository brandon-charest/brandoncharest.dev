+++
title = "CigarEdge Dev Log"
date = "2026-03-24"
description = "A chronological record of my suffering."

[taxonomies]
tags = ["devlog"]

[extra]
type = "log"
growth = "growing"
+++

# Build Log

*A chronological record of my suffering.*

---

## The Problem

Every cigar retailer has their own naming conventions. One site lists `"Padron 1964 Anniversary Series Natural Robusto Box of 20"` while another calls the same cigar `"Padron Anniversary 1964 Nat. 5x50 (20)"`. Try comparing prices across five vendors when none of them agree on what to call the product.

That's the core challenge — turning unstructured vendor data into a canonical catalog you can actually query.

---

## 2026-05-08 — Back to Basics

Matching and maintaining accuracy over hundreds of individual products and retailers is still a significant problem. So instead fo trying to create a pipeline to handle this for me I decided to go back to the basics. Lets take just a few brands and make them work 100%

So I built a [three-stage matching pipeline](@/garden/algorithms/fuzzy-matching.md):

1. **Exact alias lookup** — O(1) fast path, skip everything if we've seen this title before
2. **Field extraction** — regex + domain-specific lookup tables
3. **Confidence-scored fuzzy match** — weighted scoring, auto-accept above 0.90, queue below 0.70

The key insight: the alias table makes the system *self-improving*. Every confirmed match becomes an instant lookup for future scrapes. Over time the expensive fuzzy logic fires less and less.

## 2026-02-15 — The Matching Problem

My first instinct was simple: normalize the strings, do some fuzzy comparison, call it a day. Took about 30 minutes to realize that was never going to work.

The problem isn't typos — vendors embed *completely different information* in their titles. One includes dimensions (`5x50`), another includes wrapper leaf origin, a third throws in shipping restriction text. You can't fuzzy-match through structurally different strings.

So I built a [three-stage matching pipeline](@/garden/algorithms/fuzzy-matching.md):

1. **Exact alias lookup** — O(1) fast path, skip everything if we've seen this title before
2. **Field extraction** — regex + domain-specific lookup tables
3. **Confidence-scored fuzzy match** — weighted scoring, auto-accept above 0.90, queue below 0.70

The key insight: the alias table makes the system *self-improving*. Every confirmed match becomes an instant lookup for future scrapes. Over time the expensive fuzzy logic fires less and less.

### Extraction

This is where the real pain is. Consider:

```text
"Padron 1964 Anniversary Series Maduro Torpedo Box of 20"
"CAO Flathead V660 Carb Gordo Maduro (6x60) 20ct Box"
"La Aroma de Cuba Mi Amor Reserva Magnifico 6 1/2 x 54 Box of 24"
```

Each one needs different handling. Dimensions come in three formats (decimal, fraction, parenthesized). Wrapper colors have regional aliases — `"nat"`, `"natural"`, `"colorado natural"`, `"sun grown"` all mean the same thing. And vitola names overlap with line names — "Forty" is a shape name *and* a line name for La Gloria Cubana. 🤦

I ended up building lookup tables for all of this. More on that in the [fuzzy matching](@/garden/algorithms/fuzzy-matching.md) note.

---

## 2026-01-22 — Data Quality is Important

Started scraping a new vendor and immediately hit a wall. Product pages mix cigars with accessories, quantity parsing is unreliable (sometimes "20" is the year, not the pack count), and prices don't always match the listed pack size.

Built a filtering layer — catches samplers, accessories, cigarillos, machine-made brands, gift sets. Added a whitelist of valid pack quantities because no, a box of 2020 is not a real product.

The bigger lesson: **garbage in, garbage out**. I spent more time on pre-processing filters than on the actual fuzzy logic. Not what I expected.

### Repair Scripts

By this point I had accumulated... a collection:

```text
repair_vendor_qty.py
repair_lcp_duplicates.py
repair_url_mismatches.py
cleanup.py
```

Not proud of it. But every one of these exists because of a real bug that corrupted real data. The alternative was rebuilding the database from scratch, which — after a few hundred manually reviewed matches — was **not** happening.

---

## 2026-02-03 — The Pivot

I had been building the catalog *from* matched vendor data — scrape titles, extract fields, create catalog entries when confidence was high enough. This works, but it's lossy. Vendor titles don't always include dimensions, wrapper info, or even the correct line name. The catalog was full of holes.

New approach: **build the catalog first, then match against it.** Some vendor sites have structured spec pages with clean data — dimensions, wrapper, strength, country, filler. So I wrote a catalog builder that scrapes specs directly and creates canonical entries before any pricing data comes in.

```text
catalog_builder.py  → scrapes specs → data/spec_cache/
seed_manager.py     → versions brand_seed.json (diff, backfill, rollback)
```

The seed file uses semantic versioning with a changelog. Probably overkill for a side project, but I was tired of losing data to bad seeds. (I hope future me doesn't come back and realize this is *also* overkill.)

---

## 2026-02-14 — From Hardcoded to DB-Driven

Different data sources use their own brand names — sometimes matching the canonical name, sometimes not. I started with a hardcoded Python dict:

```python
BRAND_MAP = {
    "Padron Cigars": "Padron",
    "AJ Fernandez Cigars": "AJ Fernandez",
    "Rocky Patel Premium Cigars": "Rocky Patel",
    # ... 80 more entries
}
```

This worked until it didn't. Every time a new brand appeared, I had to update the code, redeploy, and re-run the import. Moved the whole thing to a `VendorBrandMapping` table with an admin UI for managing mappings at runtime.

Should have done this from the start. But you know, [ship first](@/blog/2024-12-27-escaping-tutorial-hell.md).

---

## 2026-02-25 — Security Pass

Had been heads-down on features and realized I'd skipped some basics. The "oh right, this goes on the internet" moment. 😅

- **SSRF protection** on the image pipeline — validate URLs before *and after* redirects, check DNS resolution against private/loopback ranges
- **ILIKE injection** — user search input was going into `ILIKE` clauses unsanitized. whoops.
- **JWT migration** — moved from `localStorage` to `httpOnly` cookies
- **Image validation** — 3-layer check: Content-Type header → magic byte signature → PIL load attempt

---

## 2026-03-08 — Deal Scoring

Built a deal scoring algorithm — takes price history and outputs a 0-100 "how good is this deal" number. The core idea: use the product's own price history as the baseline. If the current price is lower than most historical prices, that's a good deal. Layer in a few bonuses for recent trends, clamp to 0-100, done.

I considered more complex approaches — ML models, weighted moving averages, seasonality detection. But this is a cigar price site, not a hedge fund. Simple heuristic, interpretable, debuggable, doesn't need training data. Good enough...

---

## What's Next

- [ ] Deploy to production
- [ ] Expand crawlers to more vendors
- [ ] Scheduled scraping pipeline
- [ ] Price alert email notifications
- [ ] Expand the [matching engine tests](@/garden/algorithms/fuzzy-matching.md) — currently at 2,770 lines of test code for ~800 lines of implementation. The ratio is not a problem, it's a feature.
