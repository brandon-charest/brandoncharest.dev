+++
title = "Rust Iter"
date = "2025-12-18T21:36:06.530Z"
description = "iter"

[taxonomies]
tags = [ "rust", "iterators", "functional-programming" ]

[extra]
growth = "seedling"
type = "note"
+++

## Core Concepts

Rust iterators are used for processing collections of data in a functional way. They lazy, meaning they do not consume their values until they are needed.

### Iterator Trait

An iterator is any type that implements the `Iterator` trait, which requires defining a single method: `next`.

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

## Adapter Methods

Adapter methods are methods that take an iterator and return a new iterator with modified behavior. These adapters can be chained together to create complex processing pipelines. Common adapter methods include `map`, `filter`, and `take`.

### Transformation & Filtering

```rust
let numbers = vec![1, 2, 3, 4, 5];
let even_squares = numbers.iter()
    .map(|x| x * x)         // Transform each number to its square
    .filter(|x| x % 2 == 0) // Keep only even numbers
    .collect();             // Collect results into a vector
```

`|x| x * x` is a closure, which in other languages is called an anonymous function or lambda.

### Limiting Results

```rust
let first_three_evens = numbers.iter()
    .map(|x| x * x)
    .filter(|x| x % 2 == 0)
    .take(3)
    .collect();
```

## Links to Related Notes

- [borrow-checker](@/garden/languages/rust/borrow-checker.md) - Understanding how iter() vs into_iter() interacts with ownership.
- [chaining-methods](@/garden/languages/rust/chaining-methods.md) - How method chaining syntax makes iterators readable.
- [AoC Day 02](@/garden/projects/AdventOfCode/2025/day-02.md) - Example of using custom types with iterators.