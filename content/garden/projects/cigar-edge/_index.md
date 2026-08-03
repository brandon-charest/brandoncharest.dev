+++
title = "CigarEdge"
description = "A cigar price comparison engine — scraping, matching, and scoring deals across vendors."
sort_by = "date"
template = "section.html"
+++

I have been a fan of preimum cigars for a few years now, and I kept falling into the same annoyance each time I wanted to restock, I would have multiple tabs open comparing prices against vendors. There are some solutions out there, but I felt they were dated and left a lot of room for improvement. This is what inspired to me to start [CigarEdge.com](https://cigaredge.com).

**Stack:** Python 3.12 / FastAPI, Next.js 14 / PostgreSQL

**Github:** [cigar-edge](https://github.com/brandon-charest/cigar-edge)

## Learning Notes

### Core Systems
- [Fuzzy Product Matching](@/garden/algorithms/fuzzy-matching.md) - Three-stage matching engine with confidence scoring
- Deal Scoring - Percentile-based algorithm for surfacing price drops
- Data Pipeline - Multi-source ingestion (CJ feed, HTML crawlers, catalog builder)

### Architecture
- [Catalog Pattern in Practice](@/garden/concepts/catalog_pattern.md) - Brand > Line > Vitola > PackSize hierarchy


### Development Map
- [x] Matching engine
- [x] Data pipeline
- [x] Backend
- [x] Deal scoring
- [x] MVP UI

### Future Items
- [] Price drop notifications
- [] User accounts
- [] Virtual Humidor
- [] Shipping + tax total calculations