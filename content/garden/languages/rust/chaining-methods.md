+++
title = "Chaining methods"
date = "2025-12-18T21:15:47.043Z"
description = "Rusts functional style"

[taxonomies]
tags = [ "rust", "patterns" ]

[extra]
growth = "seedling"
+++

Method chaining in Rust works because most iterator adapters return a new iterator, so you can stack operations without intermediate variables. It's the same idea as piping commands in a shell — each step transforms the data and passes it along.

## The Pattern

```rust
let result: Vec<String> = names
    .iter()
    .filter(|name| name.len() > 3)
    .map(|name| name.to_uppercase())
    .collect();
```

Each method consumes the previous iterator and produces a new one. Nothing actually runs until `.collect()` (or another consumer) is called — this is because iterators are [lazy](@/garden/languages/rust/iter.md).

## Imperative Equivalent

The same logic without chaining:

```rust
let mut result: Vec<String> = Vec::new();
for name in &names {
    if name.len() > 3 {
        result.push(name.to_uppercase());
    }
}
```

Both produce the same output. The chained version is more declarative — it says _what_ to do rather than _how_ to do it. The imperative version is easier to step through with a debugger though, so it's a trade-off.

## Why It Works

Methods like `.filter()` and `.map()` return `impl Iterator`, which means you can call another iterator method on the result. The compiler fuses these into a single pass over the data — no intermediate collections are created.

## Related

- [Rust Iter](@/garden/languages/rust/iter.md) — Core iterator concepts and adapter methods
