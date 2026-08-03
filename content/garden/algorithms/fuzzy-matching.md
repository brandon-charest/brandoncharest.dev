+++
title = "Fuzzy Product Matching"
date = "2026-03-24"
description = "A three-stage matching pipeline for resolving unstructured vendor product titles to a canonical catalog"

[taxonomies]
tags = ["algorithms", "python"]

[extra]
growth = "seedling"
type = "note"
+++

You take product data from five different vendors. None of them agree on what to call the same product. If you're lucky they **might** be close in names:

```txt
Vendor A: "Padron 1964 Anniversary Series Natural Robusto Box of 20"
Vendor B: "Padron Anniversary 1964 Nat. 5x50 (20ct)"
Vendor C: "Padron Aniversario 1964 Robusto Natural - Box of 20"
Vendor D: "1964 Anniversary Padron Natural Robusto 5 x 50 Box 20"
```

Same cigar. Four different strings. To any person its fairly easy to see that these are the same cigar, and yes you could just manually do this by hand, and while the number of cigars that are available today is a finite number, doing so is not feasible. 

This is the core problem behind [CigarEdge](@/garden/projects/cigar-edge/_index.md) — and I have accepted it will never be perfect.

## Why Naive Fuzzy Matching Fails

The obvious first attempt:

```python
from rapidfuzz import fuzz

a = "padron 1964 anniversary series natural robusto box of 20"
b = "padron anniversary 1964 nat. 5x50 (20ct)"

fuzz.ratio(a, b)       # 58 — not great
fuzz.token_sort_ratio(a, b)  # 65 — still not great
```

_Not going to lie, I thought I was really onto something here and fooled myself this part was going to be easier than I thought..._

The scores are low because these strings contain **structurally different information**. One includes dimensions (`5x50`), the other doesn't. One abbreviates "Natural" to "Nat." and uses `(20ct)` instead of `Box of 20`. Fuzzy string matching doesn't understand that `5x50` and `Robusto` encode the same thing — that a Robusto **is** a 5x50 cigar.

Maybe if I had more experience in LLMs this issue could have been solved easier, or at least a better solution would have made itself clear to me.

## The Pipeline

My approach:

```txt
Raw vendor title
       │
       ▼
┌─────────────────┐
│ Stage 1: Alias  │ ← O(1) lookup. Seen this exact title before?
│ (fast path)     │   If yes → instant match, done.
└────────┬────────┘
         │ miss
         ▼
┌─────────────────┐
│ Stage 2: Extract│ ← Parse title into fields:
│ (field parsing) │   brand, line, wrapper, vitola, dims, qty
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Stage 3: Score  │ ← Fuzzy-match extracted fields against
│ (fuzzy match)   │   catalog candidates. Confidence 0.0–1.0.
└────────┬────────┘
         │
         ▼
   Route by confidence:
   high    → auto-accept
   medium  → accept + flag for review
   low     → queue for manual review
```

### Stage 1: Exact Alias Lookup

Before doing any parsing or fuzzy logic, check if we've seen this exact vendor + title pair before. If yes, return the cached match instantly.

This cache gets populated every time a match is confirmed — whether auto-accepted or manually reviewed. The system gets faster over time. On a mature catalog, Stage 1 handles the vast majority of incoming data. The expensive fuzzy logic only fires on products we've never seen.

### Stage 2: Structured Field Extraction

This is where domain knowledge lives. Raw titles get parsed into discrete fields:

```python
@dataclass
class ExtractedFields:
    brand: str = ""
    line: str = ""
    wrapper_color: str = ""
    vitola_name: str = ""
    length: float | None = None
    ring_gauge: int | None = None
    quantity: int = 1
    quantity_type: str = "single"
```

Each field has its own extraction function. Some are straightforward, some are a nightmare. Why can't we align on how items should be labeled??

#### Dimensions — Three Formats

Vendors can't even agree on how to write measurements:
- `"5 x 50"`
- `"6 1/2 x 54"`
- `"(6-3/4x60)"` 

Some vendors list ring gauge first (`"50 x 6"` instead of `"6 x 50"`), so there's a swap check with validation bounds to figure out which is which.

#### Wrapper Colors — Alias Normalization

Vendors use all kinds of regional names and abbreviations for wrapper colors. `"nat"`, `"natural"`, `"colorado natural"`, `"sun grown"` — all the same thing. So you build an alias map that normalizes them down to a handful of canonical colors.

Word boundary matching is critical — `"nat"` shouldn't match inside `"national"`, and short aliases shouldn't consume longer ones. Sorting longest-first helps.

#### Vitola Names — Dimension Lookup

A `5 x 50` cigar is a Robusto. A `6 x 60` is a Gordo. This mapping isn't in the title — it's domain knowledge. So you build a lookup table from (length, ring_gauge) → canonical shape name.

If we extract dimensions, we look up the canonical name. If not, fall back to regex extraction from the title — preferring the *last* match (vitola names appear after brand+line) and the *longest* match (`"Double Corona"` over `"Corona"`).

#### Line Isolation — The Hard Part

After extracting brand, wrapper, vitola, dimensions, and quantity, whatever's left *should* be the line name. In practice... it's a mess:

```python
# Strip everything we've identified
remainder = _strip_known_elements(remainder)

# Safety net: strip residual brand prefix
# Recovery: if stripping emptied the line, try a less aggressive pass
# Brand-as-line fallback: for single-line brands, use brand name as line
```

There are three fallback paths because aggressive stripping sometimes eats too much. `ORIGIN_NOISE_TERMS` strips 40+ tobacco descriptors (`"Ecuadorian Habano"`, `"Connecticut Broadleaf"`, etc.) that vendors embed in titles but aren't part of the line name. And then there's `_is_clean_line_name()` which rejects prices, product codes, pure vitola names, packaging terms, and shipping text that made it through the gauntlet.

I think at this point you can see that there is no shortage of edge cases.

### Stage 3: Confidence-Scored Fuzzy Match

With structured fields in hand, score every candidate in the catalog. Each field gets its own score (0.0–1.0), then they're combined with weights that reflect how discriminating each field is.

Brand and line carry the most weight — get those right and you're almost certainly looking at the right cigar. Vitola (shape/size) matters but less so. Wrapper color is the weakest signal because the same cigar in Maduro vs. Natural is still fundamentally the same product.

For the fuzzy comparison I'm using token-set matching — it's word-order invariant and tolerant of extra tokens. `"1964 Anniversary Series"` matches `"Anniversary 1964"` because it doesn't care about order.

A few scoring details that took a while to get right:

- **Dimensions beat names** for vitola matching — more reliable than vendor-specific spellings
- **Dimension tolerance** — vendors round inconsistently, so exact matches aren't realistic. Allow some wiggle room
- **Explicit mismatch is worse than missing data** — if we extracted a wrapper and it contradicts the candidate, penalize. But if one side has no wrapper info, stay neutral
- **Missing data is neutral** — don't punish what you can't see

## Routing

The confidence score determines what happens:

| Confidence | Action | Why |
|---|---|---|
| High | Auto-accept, write price data | Confident enough to trust |
| Medium | Accept, but flag for human review | Probably right, but verify |
| Low | Queue as pending, block write | Not confident — human decides |

Every confirmed match gets cached. Next time that vendor uses the same title, Stage 1 catches it. The "hard" cases shrink over time as the cache grows.

## Edge Cases That Hurt

A few of the fun ones:

- **Brand name leaking into line**: After stripping `"Padron"`, the remainder sometimes kept `"Padron "` as a prefix. Added a safety-net regex pass. Should have caught that earlier.
- **Single-line brands**: Baccarat, Brick House — title is just `"Brand Vitola"`. After stripping everything, line is empty. Fallback: use brand name as line name.
- **Unicode**: `"Padrón"` vs `"Padron"`. NFD decomposition strips combining diacritical marks. One of those things you don't think about until it breaks.
- **Ambiguous vitola names**: `"Forty"` is both a shape name and a line name for La Gloria Cubana. Separate `AMBIGUOUS_VITOLA_NAMES` set, only stripped when we have confirmed structured data.
- **Non-cigar filtering**: Vendors list ashtrays, lighters, *bobbleheads*, and mystery samplers alongside cigars. 30+ keywords plus accessory brand names.

## Testing

The matching engine has ~800 lines of implementation and ~2,770 lines of tests. I am not sure if I have gone crazy and lost the plot here with my current implementation, but it works _(kinda)_ and I need to ship something rather than sit around and tinker for another few months.

No one likes writing tests, and I used to not really write tests for my side projects because I felt I was too busy. But this test suite I have created has saved me **SO** much time when I have been making adjustments to the matching engine.

## Takeaways

1. **Domain knowledge > string algorithms.** The lookup tables do more work than rapidfuzz.
2. **Self-improving systems are worth the investment.** The alias table turns O(n) fuzzy search into O(1) for every confirmed match.
3. **Human-in-the-loop isn't a failure mode.** Auto-accept what you're confident about, escalate what you're not, feed results back in. In fact I lean pretty heavily into this for my work, if my matching engine is basically not completely certain, I want it to hand it over to me to verify. The time I spend reviewing this queue in my opinion is well worth the time, over being slightly faster but risking having bad data.
4. **Test the hell out of fuzzy logic.** You will not catch regressions any other way.

## Related

- [CigarEdge Devlog](@/garden/projects/cigar-edge/devlog.md) — The project this was built for
- [Thread-safe LRU Cache](@/garden/algorithms/lru_cache.md) — Another algorithm deep-dive from a real project
- [Database Patterns for Content Hierarchies](@/garden/concepts/catalog_pattern.md) — The catalog schema the matcher targets
