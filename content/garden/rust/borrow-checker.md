+++
title = "Fighting the Borrow Checker"
date = 2025-12-06
description = "Common patterns where the borrow checker yells at me, and how to satisfy it."

[taxonomies]
tags = ["rust", "memory-safety"]

[extra]
# Status: 'building' makes the dot yellow (WIP)
status = "building"
+++

# > rustc --explain E0382

The Borrow Checker is the hardest part of the Rust learning curve. It forces you to think about **Ownership** and **Lifetimes** at compile time.

## The Golden Rules
1. Each value in Rust has a variable that’s called its **owner**.
2. There can only be one owner at a time.
3. When the owner goes out of scope, the value will be dropped.

## Scenario: The "Use After Move" Error
This was my first major hurdle when building the CPU struct.

### ❌ The Fail
I tried to pass `cpu` to a function, then use it again.

```rust
fn main() {
    let cpu = CPU::new();
    
    // This MOVES ownership of 'cpu' to run_cycle
    run_cycle(cpu); 

    // Error: Borrow of moved value: `cpu`
    println!("Register A: {}", cpu.register_a); 
}

fn run_cycle(cpu: CPU) {
    // cpu dies here when function ends
}