+++
title = "Fighting the Borrow Checker"
date = "2025-12-06"
description = "Common patterns where the borrow checker yells at me, and how to satisfy it."

[taxonomies]
tags = ["rust", "memory-safety"]

[extra]
growth = "seedling"
+++

The Borrow Checker is the hardest part of the Rust learning curve. It forces you to think about **Ownership** and **Lifetimes** at compile time.

## The Golden Rules

### 1. Each value has exactly one owner.

```rust
let s1 = String::from("hello");
let s2 = s1;  // s1 is MOVED to s2

// println!("{}", s1);  // ❌ Error: value borrowed after move
println!("{}", s2);     // ✅ s2 is the owner now
```

If you actually need both, use `.clone()` — but know that it copies the data.

### 2. There can only be one owner at a time.

```rust
fn take_ownership(s: String) {
    println!("{}", s);
}  // s is dropped here

let name = String::from("Brandon");
take_ownership(name);

// println!("{}", name);  // ❌ Error: value used after move
```

The fix is usually to **borrow** instead of transferring ownership:

```rust
fn borrow_it(s: &String) {
    println!("{}", s);
}

let name = String::from("Brandon");
borrow_it(&name);
println!("{}", name);  // ✅ Still valid, we only lent it out
```

### 3. When the owner goes out of scope, the value is dropped.

```rust
{
    let s = String::from("hello");
    // s is valid here
}
// s is dropped — memory freed, no garbage collector needed
```

This is where the compiler catches dangling references:

```rust
fn dangling() -> &String {
    let s = String::from("hello");
    &s  // ❌ Error[E0597]: s does not live long enough
}
// s is dropped here, but we’re trying to return a reference to it
```

The fix: return the owned value instead of a reference.

```rust
fn not_dangling() -> String {
    let s = String::from("hello");
    s  // ✅ Ownership is moved to the caller
}
```

## Related

- [Rust Iter](@/garden/languages/rust/iter.md) — How `iter()` vs `into_iter()` interacts with ownership
