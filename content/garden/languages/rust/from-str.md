+++
title = "FromStr Trait"
date = "2025-12-01"
description = "How to parse strings into custom Structs idiomatically using the FromStr trait."
[taxonomies]
tags = ["rust", "traits", "parsing"]
[extra]
growth = "seedling"
+++

The [`FromStr`](https://doc.rust-lang.org/std/str/trait.FromStr.html) trait lets you define how to parse a string into your custom type. Once implemented, you get `.parse()` for free.

## The Trait

```rust
pub trait FromStr {
    type Err;
    fn from_str(s: &str) -> Result<Self, Self::Err>;
}
```

## Example: Parsing a Color

```rust
use std::str::FromStr;

#[derive(Debug)]
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

impl FromStr for Color {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // Expect format "r,g,b"
        let parts: Vec<&str> = s.split(',').collect();
        if parts.len() != 3 {
            return Err(format!("expected 3 values, got {}", parts.len()));
        }

        let r = parts[0].trim().parse::<u8>().map_err(|e| e.to_string())?;
        let g = parts[1].trim().parse::<u8>().map_err(|e| e.to_string())?;
        let b = parts[2].trim().parse::<u8>().map_err(|e| e.to_string())?;

        Ok(Color { r, g, b })
    }
}
```

## Usage

Once `FromStr` is implemented, you can use `.parse()` with turbofish syntax:

```rust
let color: Color = "255, 128, 0".parse().unwrap();
// or
let color = "255, 128, 0".parse::<Color>().unwrap();
```

This is the same mechanism that makes `"42".parse::<i32>()` work — the standard library implements `FromStr` for all the primitive types.