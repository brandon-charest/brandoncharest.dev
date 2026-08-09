+++
title = "Game of Life Algorithm"
date = "2026-01-02"
description = "How Conway's Game of Life works and implementing it in Rust"

[taxonomies]
tags = ["rust", "algorithms"]

[extra]
growth = "growing"
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

```rust
const NEIGHBORS: [(i32, i32); 8] = [
    (-1, -1),
    (-1, 0),
    (-1, 1),
    (0, -1),
    (0, 1),
    (1, -1),
    (1, 0),
    (1, 1),
];
```

Each number corresponds to NEIGHBORS array index. The tuples show (`row_offset`,`col_offset`)

```txt
[0][1][2]     (-1,-1) (-1, 0) (-1,+1)   
[3][X][4]  ←  ( 0,-1)    X    ( 0,+1)  Current cell
[5][6][7]     (+1,-1) (+1, 0) (+1,+1)
```

```rust
fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    NEIGHBORS
        .iter()  // Iterate over all 8 neighbor offsets
        .map(|&(dr, dc)| {
            // Apply offset and wrap around edges
            // rem_euclid handles negative numbers correctly for wrapping
            let neighbor_row = (row as i32 + dr).rem_euclid(self.height as i32) as u32;
            let neighbor_col = (column as i32 + dc).rem_euclid(self.width as i32) as u32;
            
            // Get the cell state (0 = dead, 1 = alive)
            let idx = self.get_index(neighbor_row, neighbor_col);
            self.cells[idx] as u8
        })
        .sum()  // Count total live neighbors
}
```

## Optimization Ideas

- **Bit packing:** Store cells as bits instead of bytes
- **SIMD:** Use vectorized operations for neighbor counting
- **Sparse representation:** Only track live cells in sparse grids
- **WebWorkers:** Divide grid into chunks for parallel processing

## Next Steps

- [ ] Implement basic algorithm
- [ ] Add performance profiling
- [ ] Explore WebGPU compute shaders for massive grids
