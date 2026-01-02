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

1. Each value in Rust has a variable that’s called its **owner**.
2. There can only be one owner at a time.
3. When the owner goes out of scope, the value will be dropped.
