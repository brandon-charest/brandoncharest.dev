+++
title = "Game of Life Algorithm"
date = "2026-01-02"
description = "How Conway's Game of Life works and implementing it in Rust"

[taxonomies]
tags = ["rust", "algorithms"]

[extra]
growth = "seedling"
type = "tutorial"
+++

## The Rules

Conway's Game of Life is a cellular automaton with simple rules:

1. **Birth:** A dead cell with exactly 3 live neighbors becomes alive
2. **Survival:** A live cell with 2-3 live neighbors stays alive
3. **Death:** All other cells die (overcrowding or loneliness)

---

## Implementation Approach

### Grid Representation

Two common approaches:

**1. 2D Array:**

```rust
struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}
```

**2. Flat Array with Index Calculation:**

```rust
fn get_index(&self, row: u32, col: u32) -> usize {
    (row * self.width + col) as usize
}
```

### Double Buffering

To avoid conflicts when updating cells:

- Read from current state
- Write to next state
- Swap buffers

### Counting Neighbors

For each cell at `(row, col)`, check the 8 surrounding cells:
```bash
[ ][ ][ ]
[ ][X][ ]  ← Current cell
[ ][ ][ ]
```

Handle edge cases:

- Wrap around (torus topology)
- Or treat edges as dead cells

## Optimization Ideas

- **Bit packing:** Store cells as bits instead of bytes
- **SIMD:** Use vectorized operations for neighbor counting
- **Sparse representation:** Only track live cells in sparse grids
- **WebWorkers:** Divide grid into chunks for parallel processing

## Next Steps

- [ ] Implement basic algorithm
- [ ] Add performance profiling
- [ ] Explore WebGPU compute shaders for massive grids
